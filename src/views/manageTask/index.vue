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
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteTask(scope)">删除</el-button>
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
      <el-form :model="editForm" status-icon ref="editFormRef" :rules="editFormRules" size="medium ">
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

        <!-- <el-form-item prop="checkedStudents" label="需提交作业的同学">
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
          <div style="margin: 15px 0;"></div>
          <el-checkbox-group v-model="editForm.checkedStudents" @change="handleCheckedStudentsChange">
            <el-checkbox v-for="student in studentList" :label="student.id" :key="student.id">{{student.fullName}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item> -->

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
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
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
        <el-table-column label="提交情况" prop="status">
          <template v-slot="scope">
            <el-tag :type="scope.row.status==='1'?'danger':'success'">
              {{scope.row.status==='1'?'未提交':'已提交'}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button size="mini" type="danger" icon="el-icon-upload" @click="downloadPersonalTask(scope)">下载作业</el-button>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </span>
    </el-dialog>
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
import { getSubmitSituation } from '../../api/task'
import tinymce from '../../components/Tinymce'
import { mapState } from 'vuex'
export default {
  name: 'manageTask',
  components: {
    tinymce
  },
  data () {
    return {
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
  methods: {
    downloadPersonalTask () {

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
      this.$store.dispatch('task/getPublishedTasks', this.queryInfo)
        .then(() => {
        })
        .catch((e) => {
          console.log(e)
        })
    },
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
          this.$store.dispatch('task/addTask', this.taskInfo)
            .then(() => {
              loading.close()
              that.$message({
                message: '提交成功',
                type: 'success'
              })
            })
            .catch(() => {
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
    showEditDialog (task) {
      this.editForm = task
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
    this.getPublishedTasks()
  },
  computed: {
    ...mapState({
      publishedTasks: state => state.task.publishedTasks,
      count: state => state.task.publishedTasksCount
    })
  }
}
</script>
