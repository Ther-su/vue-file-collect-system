<template>
  <div class="register-container">
    <el-tabs v-model="activeName"  type="card" class="tab-container">
      <el-tab-pane label="学生注册" name="student">
        <el-form :model="studentRegisterForm"  status-icon
        ref="studentRegisterFormRef" :rules="studentRegisterFormRules" size="small">
          <el-form-item prop="userName" label="用户名">
            <el-input prefix-icon="el-icon-user" v-model="studentRegisterForm.userName">
            </el-input>
          </el-form-item>

          <el-form-item prop="fullName" label="真实姓名">
            <el-input v-model="studentRegisterForm.fullName">
              <span class="svg-container" slot="prefix">
                <svg-icon icon-class="full-name" />
              </span>
            </el-input>
          </el-form-item>

          <el-form-item label="性别" prop="gender">
            <el-select v-model="studentRegisterForm.gender" placeholder="请选择">
              <el-option label="男" value="1"></el-option>
              <el-option label="女" value="2"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item prop="gradeId" label="班级代号">
            <el-input v-model="studentRegisterForm.gradeId">
              <span class="svg-container" slot="prefix">
                <svg-icon icon-class="grade" />
              </span>
            </el-input>
          </el-form-item>

          <el-form-item prop="password" label="密码">
            <el-input prefix-icon="el-icon-lock" v-model="studentRegisterForm.password" type="password"></el-input>
          </el-form-item>

          <el-form-item class="btns">
            <el-button type="primary" @click="handleRegister" :loading="loading">注册</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="学委注册" name="admin">
        <el-form :model="adminRegisterForm" status-icon
        ref="adminRegisterFormRef" :rules="adminRegisterFormRules" size="mini">
          <el-form-item prop="userName" label="用户名">
            <el-input prefix-icon="el-icon-user" v-model="adminRegisterForm.userName">
            </el-input>
          </el-form-item>

          <el-form-item prop="fullName" label="真实姓名">
            <el-input  v-model="adminRegisterForm.fullName">
              <span class="svg-container" slot="prefix">
                <svg-icon icon-class="full-name" />
              </span>
            </el-input>
          </el-form-item>

          <el-form-item label="性别" prop="gender">
            <el-select v-model="adminRegisterForm.gender" placeholder="请选择">
              <el-option label="男" value="1"></el-option>
              <el-option label="女" value="2"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item prop="school" label="学校">
            <el-input v-model="adminRegisterForm.school">
              <span class="svg-container" slot="prefix">
                <svg-icon icon-class="school" />
              </span>
            </el-input>
          </el-form-item>

          <el-form-item prop="major" label="专业">
            <el-input v-model="adminRegisterForm.major">
              <span class="svg-container" slot="prefix">
                <svg-icon icon-class="school" />
              </span>
            </el-input>
          </el-form-item>

          <el-form-item prop="grade" label="班级">
            <el-input v-model="adminRegisterForm.gradeName">
              <span class="svg-container" slot="prefix">
                <svg-icon icon-class="grade" />
              </span>
            </el-input>
          </el-form-item>

          <el-form-item prop="password" label="密码">
            <el-input prefix-icon="el-icon-goods" v-model="adminRegisterForm.password" type="password"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleRegister" :loading="loading">注册</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import {
  isPassword,
  isUserName,
  isFullName,
  isSchool,
  isGradeId,
  isMajor,
  isGrade,
  createValidateFn
} from '../../utils/validate'
export default {
  data () {
    return {
      activeName: 'student',
      loading: false,
      studentRegisterForm: {
        userName: 'Ther',
        password: 'SU20000922',
        fullName: '苏明炯',
        gender: '1',
        role: 'student',
        gradeId: 'f88cb0a8182934774f73eb9778eeb305'
      },
      adminRegisterForm: {
        userName: '伊藤美来',
        password: 'SU20000922',
        fullName: '伊藤美来',
        gender: '1',
        role: 'admin',
        gradeName: '3班',
        major: '软件工程',
        school: '清华大学'
      },
      studentRegisterFormRules: {
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
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { validator: createValidateFn(isPassword, '密码由6-10个字符的字母和汉字组成'), trigger: 'blur' }
        ],
        gradeId: [
          { required: true, message: '请输入班级代号', trigger: 'blur' },
          { validator: createValidateFn(isGradeId, '班级代号由32位字符组成'), trigger: 'blur' }
        ]
      },
      adminRegisterFormRules: {
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
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { validator: createValidateFn(isPassword, '密码由6-10个字符的字母和汉字组成'), trigger: 'blur' }
        ],
        grade: [
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
    handleRegister () {
      this.$refs.studentRegisterFormRef.validate(valid => {
        if (valid) {
          this.loading = true
          let sendForm = null
          if (this.activeName === 'student') {
            sendForm = this.studentRegisterForm
          } else {
            sendForm = this.adminRegisterForm
          }
          this.$store.dispatch('user/register', sendForm)
            .then(() => {
              this.loading = false
              this.$confirm('注册成功, 是否跳转到首页?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'success'
              }).then(() => {
                this.$router.push({ path: '/' })
              })
            })
            .catch(() => {
              this.loading = false
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
$bg: #283443;

.register-container {
  background-color: #283443;
  width: 100%;
  min-height: 100%;
  .tab-container {
    padding: 20px 20px;
    background-color: #fff;
    position: absolute;
    max-height: 95%;
    top: 50%;
    left:50%;
    transform: translate(-50%,-50%);
    width: 520px;
    max-width: 95%;
    border-radius: 8px;
    .svg-container {
      width: 18px;
      margin-left: 5px;
    }

  }
}
</style>
