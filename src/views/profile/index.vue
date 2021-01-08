<template>
  <div class="profile-container">
    <el-card>
      <el-form :model="userInfo" status-icon ref="infoFormRef" :rules="infoFormRules"
          size="small">
        <el-form-item prop="userName" label="用户名">
          <el-input prefix-icon="el-icon-user" v-model="userInfo.userName" :disabled="!isModifyStudentInfo">
          </el-input>
        </el-form-item>

        <el-form-item prop="fullName" label="真实姓名">
          <el-input v-model="userInfo.fullName" :disabled="!isModifyStudentInfo">
            <span class="svg-container" slot="prefix">
              <svg-icon icon-class="full-name" />
            </span>
          </el-input>
        </el-form-item>

        <el-form-item label="性别" prop="gender">
          <el-select v-model="userInfo.gender" placeholder="请选择" :disabled="!isModifyStudentInfo">
            <el-option label="男" value="1"></el-option>
            <el-option label="女" value="2"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="班级代号">
          <el-input v-model="userInfo.gradeId" :disabled="true">
            <span class="svg-container" slot="prefix">
              <svg-icon icon-class="grade" />
            </span>
          </el-input>
          <el-button type="success" icon="el-icon-document-copy" @click="copy" style="margin-top:8px">复制</el-button>
        </el-form-item>

        <el-form-item prop="school" label="学校">
          <el-input v-model="userInfo.school" :disabled="!isModifyAdminInfo">
            <span class="svg-container" slot="prefix">
              <svg-icon icon-class="school" />
            </span>
          </el-input>
        </el-form-item>

        <el-form-item prop="major" label="专业">
          <el-input v-model="userInfo.major" :disabled="!isModifyAdminInfo">
            <span class="svg-container" slot="prefix">
              <svg-icon icon-class="major" />
            </span>
          </el-input>
        </el-form-item>

        <el-form-item prop="gradeName" label="班级">
          <el-input v-model="userInfo.gradeName" :disabled="!isModifyAdminInfo">
            <span class="svg-container" slot="prefix">
              <svg-icon icon-class="grade" />
            </span>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="info" v-if="isModifyStudentInfo" @click="isModifyStudentInfo=false">取消</el-button>
          <el-button :type="isModifyStudentInfo?'danger':'info'" :loading="loading" @click="modifyUserInfo">{{isModifyStudentInfo?'确认修改':'修改个人信息'}}</el-button>
          <el-button type="primary" @click="dialogVisible = true">修改密码</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-dialog title="修改密码" :visible.sync="dialogVisible">
      <el-form :model="passwordForm" status-icon ref="passwordFormRef" :rules="passwordFormRules">
        <el-form-item prop="oldPassword" label="旧密码">
          <el-input v-model="passwordForm.oldPassword" prefix-icon="el-icon-lock" type="password">
          </el-input>
        </el-form-item>

        <el-form-item prop="newPassword" label="新密码">
          <el-input v-model="passwordForm.newPassword" prefix-icon="el-icon-lock" type="password">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="changePassword">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import {
  isUserName,
  isFullName,
  isSchool,
  isMajor,
  isGrade,
  isPassword,
  createValidateFn
} from '../../utils/validate'
export default {
  name: 'Profile',
  data () {
    return {
      dialogVisible: false,
      loading: false,
      isModifyStudentInfo: false,
      isModifyAdminInfo: false,
      passwordForm: {
        oldPassword: '',
        newPassword: ''
      },
      passwordFormRules: {
        oldPassword: [
          { required: true, message: '请输入旧密码', trigger: 'blur' },
          { validator: createValidateFn(isPassword, '密码由6-10个字符的字母和汉字组成'), trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { validator: createValidateFn(isPassword, '密码由6-10个字符的字母和汉字组成'), trigger: 'blur' }
        ]
      },
      infoFormRules: {
        userName: [
          { required: true, message: '请输入登录用户名', trigger: 'blur' },
          { validator: createValidateFn(isUserName, '用户名为2-10个字符的数字、字母、汉字'), trigger: 'blur' }
        ],
        fullName: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' },
          { validator: createValidateFn(isFullName, '姓名为2-10个字符的字母或汉字'), trigger: 'blur' }
        ],
        gender: [
          { required: true, message: '请输入性别', trigger: 'blur' }
        ],
        gradeName: [
          { required: true, message: '请输入班级', trigger: 'blur' },
          { validator: createValidateFn(isGrade, '班级代号由2-15个字符组成'), trigger: 'blur' }
        ],
        school: [
          { required: true, message: '请输入学校', trigger: 'blur' },
          { validator: createValidateFn(isSchool, '学校由2-30个字符组成'), trigger: 'blur' }
        ],
        major: [
          { required: true, message: '请输入专业', trigger: 'blur' },
          { validator: createValidateFn(isMajor, '专业由2-15个字符组成'), trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    copy () {
      var _input = document.createElement('input')
      _input.value = this.userInfo.gradeId
      document.body.appendChild(_input)
      _input.select()
      document.execCommand('Copy')
      document.body.removeChild(_input)
      this.$message({
        message: '复制成功',
        type: 'success'
      })
    },
    modifyUserInfo () {
      if (this.userInfo.role === 'admin' && this.isModifyAdminInfo === false) {
        this.isModifyAdminInfo = true
      } else if (this.userInfo.role === 'admin' && this.isModifyAdminInfo === true) {
        this.isModifyAdminInfo = false
      }
      if (!this.isModifyStudentInfo) {
        this.isModifyStudentInfo = true
      } else {
        this.isModifyStudentInfo = false
        this.$refs.infoFormRef.validate(valid => {
          if (valid) {
            this.loading = true
            this.$store.dispatch('user/modifyInfo', this.userInfo)
              .then(() => {
                this.loading = false
                this.$message({
                  message: '修改成功',
                  type: 'success'
                })
              })
              .catch((e) => {
                this.loading = false
              })
          } else {
            return false
          }
        })
      }
    },
    changePassword () {
      this.$refs.passwordFormRef.validate(valid => {
        if (valid) {
          this.$store.dispatch('user/changePassword', this.passwordForm)
            .then(() => {
              this.$message({
                message: '修改密码成功',
                type: 'success'
              })
              this.dialogVisible = false
              this.passwordForm.oldPassword = ''
              this.passwordForm.newPassword = ''
            })
            .catch((e) => {
              this.dialogVisible = false
              this.passwordForm.oldPassword = ''
              this.passwordForm.newPassword = ''
            })
        } else {
          return false
        }
      })
    }
  },
  computed: {
    ...mapState({
      userInfo: state => state.user
    })
  }
}
</script>
<style lang="scss">
.profile-container {
  background-color: #eaedf1;
  max-width:95%;
  width: 900px;
  margin: 10px auto;
}
.el-card {
  padding: 20px 20px;
}
.el-input.is-disabled .el-input__inner {
  color: #999999
}
.el-dialog {
  min-width: 95%;
}
</style>
