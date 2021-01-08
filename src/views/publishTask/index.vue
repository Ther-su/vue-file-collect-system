<template>
  <div class="publish-task-container">
    <el-card>
      <el-form :model="taskInfo" status-icon ref="taskFormRef" :rules="taskFormRules" size="medium ">
        <el-form-item prop="taskName" label="作业名称">
          <el-input v-model="taskInfo.taskName" >
          </el-input>
        </el-form-item>

        <el-form-item prop="taskContent" label="作业内容">
          <!-- <el-input v-model="taskInfo.taskContent" type="textarea" placeholder="字数应在50以内" :rows="7">
          </el-input> -->
          <tinymce
            ref="editor"
            v-model="taskInfo.taskContent"
            />
        </el-form-item>

        <el-form-item prop="checkedStudents" label="需提交作业的同学">
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
          <div style="margin: 15px 0;"></div>
          <el-checkbox-group v-model="taskInfo.checkedStudents" @change="handleCheckedStudentsChange">
            <el-checkbox v-for="student in studentList" :label="student.id" :key="student.id">{{student.fullName}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item prop="deadline" label="截止时间">
          <el-date-picker
            v-model="taskInfo.deadline"
            type="datetime"
            placeholder="选择日期时间"
            align="center"
            :picker-options="pickerOptions">
          </el-date-picker>
        </el-form-item>

        <el-form-item>
          <el-button type="info" @click="resetForm">重置</el-button>
          <el-button type="warning" @click="save">暂存</el-button>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script>
import {
  createValidateFn,
  isTaskName,
  isCheckedStudents,
  isDeadline
} from '../../utils/validate'
import { getGradePeople } from '../../api/grade'
import { addTask } from '../../api/task'
import tinymce from '../../components/Tinymce'
export default {
  name: 'publishTask',
  components: {
    tinymce
  },
  data () {
    return {
      disabled: false,
      formDataList: [],
      isUploading: false,
      picUrl: process.env.VUE_APP_BASE_API + '/task/pic',
      canSubmit: false,
      checkAll: false,
      isIndeterminate: false,
      studentList: [],
      taskInfo: {
        taskName: '',
        taskContent: '',
        deadline: '',
        checkedStudents: []
      },
      taskFormRules: {
        taskName: [
          { required: true, message: '请输入作业名称', trigger: 'blur' },
          { validator: createValidateFn(isTaskName, '作业名称为2-20个字符的数字、字母、汉字'), trigger: 'blur' }
        ],
        taskContent: [
          { required: true, message: '请输入作业内容', trigger: 'blur' }
        ],
        checkedStudents: [
          { required: true, message: '请选择需要提交作业的同学', trigger: 'blur' },
          { validator: createValidateFn(isCheckedStudents, '请选择需要提交作业的同学'), trigger: 'blur' }
        ],
        deadline: [
          { required: true, message: '请输入截止日期', trigger: 'blur' },
          { validator: createValidateFn(isDeadline, '选择的时间应晚于现在哦'), trigger: 'blur' }
        ]
      },
      pickerOptions: {
        shortcuts: [{
          text: '今天',
          onClick (picker) {
            picker.$emit('pick', new Date())
          }
        }, {
          text: '明天',
          onClick (picker) {
            const date = new Date()
            date.setTime(date.getTime() + 3600 * 1000 * 24)
            picker.$emit('pick', date)
          }
        }, {
          text: '一周后',
          onClick (picker) {
            const date = new Date()
            date.setTime(date.getTime() + 3600 * 1000 * 24 * 7)
            picker.$emit('pick', date)
          }
        }]
      }
    }
  },
  created () {
    const task = localStorage.getItem('task')
    if (task) {
      this.taskInfo = JSON.parse()
    }
    this.getStudentsByGrade()
  },
  methods: {
    save () {
      localStorage.setItem('task', JSON.stringify(this.taskInfo))
    },
    resetForm () {
      localStorage.removeItem('task')
      this.checkAll = false
      this.taskInfo = {
        taskName: '',
        taskContent: '',
        deadline: '',
        checkedStudents: []
      }
    },
    async getStudentsByGrade () {
      const { data } = await getGradePeople()
      this.studentList = data
    },
    handleCheckAllChange (val) {
      const studentIdList = this.studentList.map(item => item.id)
      this.taskInfo.checkedStudents = val ? studentIdList : []
      this.isIndeterminate = false
    },
    handleCheckedStudentsChange (value) {
      const checkedCount = value.length
      this.checkAll = checkedCount === this.studentList.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.studentList.length
    },
    // handleUploadQueue () {
    //   if (this.formDataList.length === 0) return null
    //   const curFormData = this.formDataList.shift()
    //   return new Promise((resolve, reject) => {
    //     upLoadImage(curFormData)
    //       .then(() => {
    //         if (this.formDataList.length > 0) {
    //           this.handleUploadQueue()
    //         } else {
    //           this.isUploading = false
    //         }
    //         resolve()
    //       })
    //       .catch(err => {
    //         reject(err)
    //       })
    //   })
    // },
    // upLoadImage (param) {
    //   const uploadFormData = new FormData()
    //   uploadFormData.append('file', param.file)
    //   uploadFormData.append('taskId', this.newTask.id)
    //   this.formDataList.push(uploadFormData)
    //   if (this.isUploading) return null
    //   else this.isUploading = true
    //   this.handleUploadQueue()
    //     .then(res => {
    //       param.onSuccess()
    //     })
    //     .catch(() => {
    //       param.onError()
    //     })
    // },
    handleSubmit () {
      const that = this
      this.$refs.taskFormRef.validate(valid => {
        if (valid) {
          const loading = this.$loading({
            lock: true,
            text: '提交中',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
          this.taskInfo.publishTime = new Date()
          addTask(this.taskInfo).then(res => {
            loading.close()
            that.$message({
              message: '提交成功',
              type: 'success'
            })
          }).catch(error => {
            console.log(error)
          })
        } else {
          return false
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.publish-task-container {
  background-color: #eaedf1;
  max-width:95%;
  width: 900px;
  margin: 10px auto;
}
.el-card {
  padding: 20px 20px;
}
.el-switch {
  display: block;
  margin-top: 8px;
}
</style>
