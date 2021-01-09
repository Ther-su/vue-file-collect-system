<template>
  <div class="manage-task-container">
    <el-card>
      <el-table :data="publishedTasks" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="作业名称" prop="taskName"></el-table-column>
        <el-table-column label="截止日期" prop="deadline">
          <template slot-scope="scope">
            {{scope.row.deadline | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="发布日期" prop="publishTime">
          <template slot-scope="scope">
            {{scope.row.publishTime | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteTask(scope.row)">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSumbitSituationDialog(scope.row)">提交情况</el-button>
          </template>
        </el-table-column>
      </el-table>
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
    </el-card>
    <el-dialog
      title="修改作业"
      :visible.sync="editDialogVisible"
      width="80%">
      <el-form :model="editForm" status-icon ref="editFormRef" :rules="editFormRules" size="medium">
        <el-form-item prop="taskName" label="作业名称">
          <el-input v-model="editForm.taskName" >
          </el-input>
        </el-form-item>

        <el-form-item prop="taskContent" label="作业内容">
          <tinymce
            ref="editor"
            v-model="editForm.taskContent"
            />
        </el-form-item>

        <el-form-item prop="checkedStudents" label="需提交作业的同学">
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange" border>全选</el-checkbox>
          <div style="margin: 15px 0;"></div>
          <el-checkbox-group v-model="editForm.checkedStudents" @change="handleCheckedStudentsChange">
            <el-checkbox v-for="student in studentList" :label="student.id" :key="student.id" border>{{student.fullName}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item prop="deadline" label="截止时间">
          <el-date-picker
            v-model="editForm.deadline"
            type="datetime"
            placeholder="选择日期时间"
            align="center"
            :picker-options="pickerOptions">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit(editForm)">保存</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="提交情况"
      :visible.sync="submitSituationDialogVisible"
      width="80%">
      <el-table :data="submitSituation" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="学号" prop="studentNumber"></el-table-column>
        <el-table-column label="用户名称" prop="userName"></el-table-column>
        <el-table-column label="姓名" prop="fullName"></el-table-column>
        <el-table-column label="性别" prop="gender">
          <template slot-scope="scope">
            {{scope.row.gender | genderFormat}}
          </template>
        </el-table-column>
        <el-table-column label="提交日期" prop="deadline">
          <template slot-scope="scope">
            {{scope.row.submitTime | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="提交情况" prop="status">
          <template v-slot="scope">
            <el-tag :type="scope.row.status==='1'?'danger':'success'">
              {{scope.row.status==='1'?'未提交':'已提交'}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button size="mini" type="danger" :disabled="scope.row.status==='1'" icon="el-icon-download" @click="downloadPersonalTask(scope.row)">下载作业</el-button>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-input
          size="small"
          placeholder="请输入作业命名规则"
          v-model="namingRule"
          clearable>
        </el-input>
        <div style="margin: 15px 0;"></div>
        <el-button type="success" @click="exportExcel" size="small">导出提交情况</el-button>
        <el-button type="primary" @click="packFiles" size="small" :disabled="!submitSituation.some(item => item.status==='2')">打包班级作业</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import FileSaver from 'file-saver'
import JSZip from 'jszip'
import {
  createValidateFn,
  isTaskName,
  isCheckedStudents,
  isDeadline
} from '../../utils/validate'
import { getGradePeople } from '../../api/grade'
import { getSubmitSituation, updatePublishedTask, getPublishedTasks, downloadOneTask, deleteOneTask } from '../../api/task'
import tinymce from '../../components/Tinymce'
export default {
  name: 'manageTask',
  components: {
    tinymce
  },
  data () {
    return {
      // eslint-disable-next-line no-template-curly-in-string
      namingRule: '毛概作业2019级电子与信息学院${studentNumber}-${fullName}',
      publishedTasks: [],
      count: 0,
      isIndeterminate: false,
      checkAll: false,
      studentList: [],
      editForm: {},
      editDialogVisible: false,
      submitSituationDialogVisible: false,
      submitSituation: [],
      queryInfo: {
        pageSize: 3,
        pageNum: 1
      },
      editFormRules: {
        taskName: [
          { required: true, message: '请输入作业名称', trigger: 'blur' },
          { validator: createValidateFn(isTaskName, '作业名称为2-20个字符的数字、字母、汉字'), trigger: 'blur' }
        ],
        taskContent: [
          { required: true, message: '请输入作业内容', trigger: 'blur' }
        ],
        checkedStudents: [
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
  methods: {
    deleteTask (task) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteOneTask({
          taskId: task.id
        })
          .then(res => {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    exportExcel () {
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['学号', '用户名称', '姓名', '性别', '提交日期', '提交情况']
        const filterVal = ['studentNumber', 'userName', 'fullName', 'gender', 'submitTime', 'status']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '提交情况'
        })
      })
    },
    formatJson (filterVal) {
      return this.submitSituation.map(v => filterVal.map(j => {
        if (j === 'submitTime') {
          return this.$options.filters.dateFormat(v[j])
        } else if (j === 'gender') {
          return this.$options.filters.genderFormat(v[j])
        } else if (j === 'status') {
          return this.$options.filters.statusFormat(v[j])
        } else {
          return v[j]
        }
      }))
    },
    downloadOneFile (submitter) {
      return new Promise((resolve, reject) => {
        downloadOneTask({
          params: {
            taskId: submitter.taskId,
            userId: submitter.id
          }
        }).then(res => {
          resolve(res)
        }).catch(err => {
          reject(err)
        })
      })
    },
    packFiles () {
      const zip = new JSZip()
      const submitSituation = this.submitSituation.filter(item => item.status === '2')
      Promise.all(
        submitSituation.map(async item => {
          const res = await this.downloadOneFile(item)
          const newFileName = this.handleNameingFile(item) + item.suffix
          zip.file(newFileName, res, { binary: true })
        })
      ).then(() => {
        zip.generateAsync({ type: 'blob' })
          .then(content => {
            FileSaver.saveAs(content, '打包.zip')
          })
      })
    },
    downloadPersonalTask (submitter) {
      const newFileName = this.handleNameingFile(submitter) + submitter.suffix
      downloadOneTask({
        params: {
          taskId: submitter.taskId,
          userId: submitter.id
        }
      }).then(res => {
        const data = res
        const url = window.URL.createObjectURL(new Blob([data]))
        const link = document.createElement('a')
        link.href = url
        link.download = newFileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
    },
    handleNameingFile ({ fullName, studentNumber }) {
      const nameingObj = { fullName, studentNumber }
      const regObj = {}
      // eslint-disable-next-line no-template-curly-in-string
      const namingRule = this.namingRule ? this.namingRule : '${studentNumber}-${fullName}'
      let temp1 = this.namingRule
      let temp2 = null
      const reg1 = /(?<=\$\{)(.*?)(?=\})/g
      const reg2 = /\$\{[^{}]+?\}/g
      const reg1Res = namingRule.match(reg1)
      const reg2Res = namingRule.match(reg2)
      for (let i = 0; i < reg1Res.length; i++) {
        regObj[reg2Res[i]] = reg1Res[i]
      }
      for (let i = 0; i < reg1Res.length; i++) {
        temp2 = temp1.replace(reg2Res[i], nameingObj[regObj[reg2Res[i]]])
        temp1 = temp2
      }
      return temp2
    },
    handleSizeChange (newSize) {
      this.queryInfo.pageSize = newSize
      this.getPublishedTasks()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pageNum = newPage
      this.getPublishedTasks()
    },
    getPublishedTasks () {
      getPublishedTasks({
        params: this.queryInfo
      }).then(response => {
        const { data } = response
        this.publishedTasks = data.taskList
        this.count = data.count
      }).catch(error => {
        console.log(error)
      })
    },
    handleCheckAllChange (val) {
      const studentIdList = this.studentList.map(item => item.id)
      this.editForm.checkedStudents = val ? studentIdList : []
      this.isIndeterminate = false
    },
    handleCheckedStudentsChange (value) {
      const checkedCount = value.length
      this.checkAll = checkedCount === this.studentList.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.studentList.length
    },
    handleSubmit (task) {
      const { submitterList, id } = task
      const that = this
      this.$refs.editFormRef.validate(valid => {
        if (valid) {
          const loading = this.$loading({
            lock: true,
            text: '提交中',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
          const needSubmitters = submitterList.map(item => item.userId)
          const addSubmitters = this.editForm.checkedStudents.filter(item =>
            !needSubmitters.includes(item)
          )
          const delSubmitters = needSubmitters.filter(item =>
            !this.editForm.checkedStudents.includes(item)
          )
          this.editForm.addSubmitters = addSubmitters
          this.editForm.delSubmitters = delSubmitters
          this.editForm.publishTime = new Date()
          this.editForm.taskId = id
          updatePublishedTask(this.editForm).then(response => {
            loading.close()
            that.$message({
              message: '更新成功',
              type: 'success'
            })
            that.getPublishedTasks()
          }).catch(error => {
            console.log(error)
            loading.close()
          })
        } else {
          return false
        }
      })
    },
    async getStudentsByGrade () {
      const { data } = await getGradePeople()
      this.studentList = data
    },
    showEditDialog (task) {
      this.editForm = task
      this.$set(this.editForm, 'checkedStudents', this.editForm.submitterList.map(item => item.userId))
      this.checkAll = this.studentList.length === this.editForm.submitterList.length
      this.isIndeterminate = this.editForm.submitterList.length > 0 && !this.checkAll
      this.editDialogVisible = true
    },
    async showSumbitSituationDialog (task) {
      const { data } = await getSubmitSituation({
        params: {
          taskId: task.id
        }
      })
      this.submitSituation = data.submitSituation
      this.submitSituationDialogVisible = true
    }
  },
  created () {
    this.getStudentsByGrade()
    this.getPublishedTasks()
  }
}
</script>
