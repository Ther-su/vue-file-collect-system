<template>
  <div class="login-container">
    <el-form :model="loginForm" class="login-form"
      ref="loginFormRef" :rules="loginFormRules">
      <div class="title-container">
        <h3 class="title">
          作业收集系统登录
        </h3>
      </div>
      <el-form-item prop="userName" label="用户名">
        <el-input prefix-icon="el-icon-user" v-model="loginForm.userName">
        </el-input>
      </el-form-item>
      <el-form-item prop="password" label="密码">
        <el-input prefix-icon="el-icon-lock" v-model="loginForm.password" type="password"></el-input>
      </el-form-item>
      <el-form-item class="btns">
        <el-button type="primary" @click="handleLogin" :loading="loading">登录</el-button>
        <el-button type="default" @click="toRegister">还没有账户?去注册</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  data () {
    return {
      loading: false,
      loginForm: {
        userName: '伊藤美来',
        password: 'SU20000922'
      },
      loginFormRules: {
        userName: [
          { required: true, message: '请输入登录用户名', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    $route: {
      handler: function (route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  methods: {
    toRegister () {
      this.$router.push('/register')
    },
    handleLogin () {
      this.$refs.loginFormRef.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/login', this.loginForm)
            .then(() => {
              this.$message({
                message: '登录成功',
                type: 'success'
              })
              this.loading = false
              this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
            })
            .catch(() => {
              this.loading = false
            })
        } else {
          return false
        }
      })
    },
    getOtherQuery (query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
  }
}
</script>
<style lang="scss" scoped>
$bg: #283443;
.login-container {
  background-color: #283443;
  width: 100%;
  min-height: 100%;
  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $bg;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }
  .login-form {
    width: 520px;
    max-width: 90%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    padding: 20px 40px;
    background-color: #fff;
    border-radius: 8px;
    position:absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
