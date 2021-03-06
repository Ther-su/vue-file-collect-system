<template>
  <div class="my-task-container">
    <el-timeline v-if="myTasks.length > 0">
      <el-timeline-item :timestamp="item.publishTime | dateFormat" placement="top" v-for="item in myTasks" :key="item.id">
        <el-card>
          <el-collapse accordion>
            <el-collapse-item>
              <template slot="title">
                <div class="title-box">
                  <h3>{{item.taskName}}</h3>
                  <div class="tip-box">
                    <el-tooltip effect="dark" content="截止日期" placement="top-start">
                      <el-tag type="danger" effect="dark">{{item.deadline | dateFormat}}</el-tag>
                    </el-tooltip>
                    <el-tooltip effect="dark" content="作业状态" placement="top-start">
                      <el-tag :type="item.status | statusTagFormat">{{item.status | statusFormat}}</el-tag>
                    </el-tooltip>
                  </div>
                </div>
              </template>
              <div class="content-box" v-html="item.taskContent"></div>

                <el-button size="small" type="primary" class="submit-btn" :disabled="item.uploadFile&&item.uploadFile.status!=='wait'">
                  <i class="el-icon-upload2 el-icon--left" size="mini"></i>选择文件
                  <input
                    v-if="!(item.uploadFile&&item.uploadFile.status!=='wait')"
                    type="file"
                    :multiple="false"
                    class="select-file-input"
                    ref="input"
                    οnclick="f.outerHTML=f.outerHTML"
                    @change="handleFileChange($event, item.taskId)"
                  />
                </el-button>
                <el-button size="small" type="success" @click="handleUpload(item)"
                  :disabled="!item.uploadFile||item.uploadFile.status!=='wait'"
                >
                  <i class="el-icon-upload el-icon--left" size="mini"></i>
                  上传文件
                </el-button>
                <el-button type="danger" size="small" @click="handlePause(item)"
                  :disabled="!item.uploadFile||item.uploadFile.status!=='uploading'">
                  <i class="el-icon-video-pause el-icon--left" size="mini"></i>暂停
                </el-button>
                <el-button type="warning" size="small" @click="handleResume(item)"
                  :disabled="!item.uploadFile||item.uploadFile.status!=='pause'">
                  <i class="el-icon-video-play el-icon--left" size="mini"></i>恢复
                </el-button>
                <el-button type="info" size="small" @click="clearFiles(item)"
                  :disabled="!item.uploadFile">
                  <i class="el-icon-delete el-icon--left" size="mini"></i>清空
                </el-button>
              <div class="upload-info-box" v-if="item.uploadFile">
                <div class="name-box">{{item.uploadFile.name}}</div>
                <div class="size-box">{{item.uploadFile.size | transformByte}}</div>
                <div class="progress-box" v-if="item.uploadFile.status === 'hashing' || item.uploadFile.status === 'wait'">
                  <span>{{item.uploadFile.status === 'wait' ? '准备读取文件' : '正在读取文件'}}</span>
                  <el-progress :percentage="item.uploadFile.hashProgress"></el-progress>
                </div>
                <div v-else class="progress-box">
                  <span>文件进度</span>
                  <el-progress :percentage="item.uploadFile.uploadProgress"></el-progress>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
          </el-card>
      </el-timeline-item>
    </el-timeline>
    <div v-else class="no-content-box">
      <el-image :src="require('../../assets/empty.png')"></el-image>
      这里还空空如也~
    </div>
    <el-pagination
      small
      background
      layout="total, sizes, prev, pager, next"
      :page-sizes="[3,5,8,10]"
      :page-size="queryInfo.pageSize"
      :current-page="queryInfo.pageNum"
      :total="count"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
    </el-pagination>
  </div>
</template>
<script>
// 单个文件的状态
import { CancelToken } from 'axios'
import { getStorage, setStorage, clearStorage } from '../../utils/localstorage'
import { upLoadFileChunk, mergeFileChunk, presenceFileChunk, getMyTasks } from '../../api/task'
const fileStatus = {
  wait: 'wait',
  hashing: 'hashing',
  uploading: 'uploading',
  success: 'success',
  error: 'error',
  pause: 'pause',
  resume: 'resume'
}

const chunkSize = 10 * 1024 * 1024 // 切片大小
// 单个文件的状态 对应描述
// const fileStatusStr = {
//   wait: '待上传',
//   uploading: '上传中',
//   success: '成功',
//   error: '失败',
//   pause: '暂停',
//   resume: '恢复'
// }
export default {
  name: 'myTask',
  filters: {
    transformByte (size) {
      if (!size) {
        return '0B'
      }

      var num = 1024.0 // byte

      if (size < num) {
        return size + 'B'
      }
      if (size < Math.pow(num, 2)) {
        return (size / num).toFixed(2) + 'K'
      } // kb
      if (size < Math.pow(num, 3)) {
        return (size / Math.pow(num, 2)).toFixed(2) + 'M'
      } // M
      if (size < Math.pow(num, 4)) {
        return (size / Math.pow(num, 3)).toFixed(2) + 'G'
      } // G
      return (size / Math.pow(num, 4)).toFixed(2) + 'T' // T
    }
  },
  data () {
    return {
      tempThreads: 3,
      worker: null,
      cancels: [],
      myTasks: [],
      count: 0,
      queryInfo: {
        pageSize: 3,
        pageNum: 1
      }
    }
  },
  methods: {
    handleSizeChange (newSize) {
      this.queryInfo.pageSize = newSize
      this.getMyTask()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pageNum = newPage
      this.getMyTask()
    },
    handleFileChange (e, taskId) {
      const files = e.target.files
      if (!files.length) return null
      const postFiles = Array.prototype.slice.call(files)
      const rawFile = postFiles[0]
      rawFile.status = fileStatus.wait
      rawFile.chunkList = []
      rawFile.uploadProgress = 0
      rawFile.fakeUploadProgress = 0 // 假进度条，处理恢复上传后，进度条后移的问题
      rawFile.hashProgress = 0
      rawFile.taskId = taskId
      this.setUploadFile(rawFile, taskId)
    },
    verifyUpload (fileName, fileHash, taskId) {
      return new Promise((resolve) => {
        const obj = {
          hash: fileHash,
          fileName,
          taskId,
          submitTime: new Date()
        }
        presenceFileChunk(obj)
          .then((res) => {
            resolve(res.data)
          })
          .catch((err) => {
            console.log(err)
          })
      })
    },
    // 创建文件切片
    createFileChunk (file, size = chunkSize) {
      const fileChunkList = []
      let count = 0
      while (count < file.size) {
        fileChunkList.push({
          file: file.slice(count, count + size)
        })
        count += size
      }
      return fileChunkList
    },
    async handleUpload ({ uploadFile }) {
      try {
        const { taskId } = uploadFile
        const fileChunkList = this.createFileChunk(uploadFile)
        // 若不是恢复，再进行hash计算
        if (uploadFile.status !== 'resume') {
          uploadFile.status = fileStatus.hashing
          uploadFile.hash = await this.calculateHash({ uploadFile, taskId })
        }
        const { presence } = await this.verifyUpload(uploadFile.name, uploadFile.hash, uploadFile.taskId)
        if (presence) {
          uploadFile.status = fileStatus.secondPass
          uploadFile.uploadProgress = 100
          this.setUploadFile(uploadFile, taskId)
        } else {
          uploadFile.status = fileStatus.uploading
          const getChunkStorage = this.getChunkStorage(uploadFile.hash)
          uploadFile.fileHash = uploadFile.hash // 文件的hash，合并时使用
          uploadFile.chunkList = fileChunkList.map(({ file }, index) => ({
            fileHash: uploadFile.hash,
            fileName: uploadFile.name,
            index,
            hash: uploadFile.hash + '-' + index,
            chunk: file,
            taskId,
            size: file.size,
            uploaded: getChunkStorage && getChunkStorage.includes(index), // 标识：是否已完成上传
            progress: getChunkStorage && getChunkStorage.includes(index) ? 100 : 0,
            status: getChunkStorage && getChunkStorage.includes(index) ? 'success' : 'wait' // 上传状态，用作进度状态显示
          }))
          this.setUploadFile(uploadFile, taskId)
          await this.uploadChunks(uploadFile)
        }
      } catch (err) {
        console.log(err)
      }
    },
    // 生成文件 hash（web-worker）
    calculateHash ({ uploadFile, taskId }) {
      return new Promise((resolve) => {
        // this.worker = new Worker('./hash.js')
        // this.worker.postMessage({ fileChunkList })
        // this.worker.onmessage = (e) => {
        //   const { percentage, hash } = e.data
        //   uploadFile.hashProgress = Number(percentage.toFixed(0))
        //   console.log(uploadFile.hashProgress)
        //   this.$store.commit('task/SET_UPLOADFILE', { rawFile: uploadFile, taskId })
        //   if (hash) {
        //     resolve(hash)
        //   }
        // }

        this.worker = new Worker('./hash.js')
        this.worker.postMessage({ uploadFile })
        this.worker.onmessage = (e) => {
          const { percentage, hash } = e.data
          uploadFile.hashProgress = Number(percentage.toFixed(0))
          this.setUploadFile(uploadFile, taskId)
          if (hash) {
            resolve(hash)
          }
        }
      })
    },
    // 将切片传输给服务端
    async uploadChunks (data) {
      const chunkData = data.chunkList
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve, reject) => {
        const requestDataList = chunkData
          .filter(({ uploaded }) => !uploaded)
          .map(({ fileHash, chunk, fileName, index, taskId }) => {
            const formData = new FormData()
            formData.append('fileHash', fileHash)
            formData.append('file', chunk)
            formData.append('chunkId', index) // 文件名使用切片的下标
            formData.append('taskId', taskId)
            return { formData, index, fileName }
          })
        try {
          await this.sendRequest(requestDataList, chunkData, data)
        } catch (error) {
          // 上传有被reject的
          this.$message.error('亲 上传失败了,考虑重试下呦')
          return null
        }
        // 合并切片
        const isUpload = chunkData.some((item) => item.uploaded === false)
        if (isUpload) {
          alert('存在失败的切片')
        } else {
          // 执行合并
          try {
            await this.mergeRequest(data)
            resolve()
          } catch (error) {
            reject(error)
          }
        }
      })
    },
    // 处理清空
    clearFiles ({ uploadFile }) {
      const { taskId } = uploadFile
      this.setUploadFile(null, taskId)
      this.worker && this.worker.terminate()
    },
    // 暂停上传
    handlePause ({ uploadFile }) {
      const { taskId } = uploadFile
      uploadFile.status = fileStatus.pause
      uploadFile.fakeUploadProgress = uploadFile.uploadProgress
      while (this.cancels.length > 0) {
        this.cancels.pop()('暂停上传')
      }
      this.setUploadFile(uploadFile, taskId)
    },
    // 恢复上传
    handleResume ({ uploadFile }) {
      uploadFile.status = fileStatus.resume
      const { taskId } = uploadFile
      this.setUploadFile(uploadFile, taskId)
      this.handleUpload({ uploadFile })
    },
    // 通知服务端合并切片
    mergeRequest (data) {
      return new Promise((resolve, reject) => {
        const obj = {
          taskId: data.taskId,
          fileHash: data.fileHash,
          fileName: data.name,
          fileChunkNum: data.chunkList.length,
          submitTime: new Date()
        }

        mergeFileChunk(obj, {
          timeout: 0
        })
          .then((res) => {
            // 清除storage
            if (res.code === 0) {
              data.status = fileStatus.success
              this.setUploadFile(data, data.taskId)
              clearStorage(data.fileHash)
              this.$message({
                type: 'success',
                message: '上传作业成功!'
              })
              resolve()
            } else {
              // 文件块数量不对，清除缓存
              clearStorage(data.fileHash)
              data.status = fileStatus.error
              this.setUploadFile(data, data.taskId)
              resolve()
            }
          })
          .catch((err) => {
            data.status = fileStatus.error
            reject(err)
          })
      })
    },
    // 切片上传进度
    createProgresshandler (item, uploadFile) {
      return (p) => {
        item.progress = parseInt(String((p.loaded / p.total) * 100))
        this.fileProgress(uploadFile)
      }
    },
    // 文件总进度
    fileProgress (uploadFile) {
      const currentFile = uploadFile
      const { taskId } = currentFile
      if (currentFile) {
        const uploadProgress = currentFile.chunkList.map((item) => item.size * item.progress).reduce((acc, cur) => acc + cur)
        const currentFileProgress = parseInt((uploadProgress / currentFile.size).toFixed(2))
        // 真假进度条处理--处理进度条后移
        if (!currentFile.fakeUploadProgress) {
          currentFile.uploadProgress = currentFileProgress
          this.setUploadFile(currentFile, taskId)
        } else if (currentFileProgress > currentFile.fakeUploadProgress) {
          currentFile.uploadProgress = currentFileProgress
          this.setUploadFile(currentFile, taskId)
        }
      }
    },
    // 并发处理
    sendRequest (forms, chunkData, uploadFile) {
      var finished = 0
      const total = forms.length
      const that = this
      const retryArr = [] // 数组存储每个文件hash请求的重试次数，做累加 比如[1,0,2],就是第0个文件切片报错1次，第2个报错2次

      return new Promise((resolve, reject) => {
        const handler = () => {
          if (forms.length) {
            // 出栈
            const formInfo = forms.shift()
            const formData = formInfo.formData
            const index = formInfo.index

            upLoadFileChunk(formData, {
              onUploadProgress: that.createProgresshandler(chunkData[index], uploadFile),
              cancelToken: new CancelToken((c) => this.cancels.push(c)),
              timeout: 0
            })
              .then((res) => {
                // 更改状态
                chunkData[index].uploaded = true
                chunkData[index].status = 'success'

                // 存储已上传的切片下标
                this.addChunkStorage(chunkData[index].fileHash, index)
                finished++
                handler()
              })
              .catch((e) => {
                if ([fileStatus.pause, fileStatus.wait].includes(uploadFile.status)) return
                if (typeof retryArr[index] !== 'number') {
                  retryArr[index] = 0
                }

                // 更新状态
                chunkData[index].status = 'warning'

                // 累加错误次数
                retryArr[index]++

                // 重试3次
                if (retryArr[index] >= this.chunkRetry) {
                  console.warn(' 重试失败--- > handler -> retryArr', retryArr, chunkData[index].hash)
                  // eslint-disable-next-line prefer-promise-reject-errors
                  return reject('重试失败', retryArr)
                }

                this.tempThreads++ // 释放当前占用的通道

                // 将失败的重新加入队列
                forms.push(formInfo)
                handler()
              })
          }

          if (finished >= total) {
            resolve()
          }
        }

        // 控制并发
        for (let i = 0; i < this.tempThreads; i++) {
          handler()
        }
      })
    },
    // 存储已上传完成的切片下标
    addChunkStorage (name, index) {
      const data = [index]
      const arr = getStorage(name)
      if (arr) {
        setStorage(name, [...arr, ...data])
      } else {
        setStorage(name, data)
      }
    },
    getChunkStorage (name) {
      return getStorage(name)
    },
    getMyTask () {
      getMyTasks({
        params: this.queryInfo
      }).then(response => {
        const { data } = response
        this.myTasks = data.taskList
        this.count = data.count
      }).catch(error => {
        console.log(error)
      })
    },
    setUploadFile (rawFile, taskId) {
      let taskIndex = -1
      const targetTask = (this.myTasks.filter((item, index) => {
        if (item.taskId === taskId) {
          taskIndex = index
          return true
        } else {
          return false
        }
      }))[0]
      targetTask.uploadFile = rawFile
      this.$set(this.myTasks, taskIndex, targetTask)
    }
  },
  created () {
    this.getMyTask()
  }
}
</script>
<style lang="scss" scoped>

.submit-btn {
  position: relative;
    .select-file-input {
      position: absolute;
      display: inline-block;
      left: 0;
      top: 0;
      border: none;
      opacity: 0;
      width: 96px;
      height: 28px;
    }
}

.my-task-container {
  max-width:97%;
  width: 1000px;
  margin: 5px auto;
}
.el-timeline {
  padding: 0;
}
.title-box {
  width: 800px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.content-box {
  padding: 10px 0;
}
.tip-box {
  width: 180px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.no-content-box {
  width: 270px;
  display: flex;
  flex-direction: column;
  margin: 60px auto;
  align-items: center;
}
</style>
