<template>
  <div class="profile-container">
    <el-card>
      <el-form :model="userInfo" status-icon ref="infoFormRef" :rules="infoFormRules"
          size="small">
        <el-form-item prop="userName" label="用户名">
          <el-input prefix-icon="el-icon-user" v-model="userInfo.userName" :disabled="!isModifyUserInfo">
          </el-input>
        </el-form-item>

        <el-form-item prop="fullName" label="真实姓名">
          <el-input v-model="userInfo.fullName" :disabled="!isModifyUserInfo">
            <span class="svg-container" slot="prefix">
              <svg-icon icon-class="full-name" />
            </span>
          </el-input>
        </el-form-item>

        <el-form-item label="性别" prop="gender">
          <el-select v-model="userInfo.gender" placeholder="请选择" :disabled="!isModifyUserInfo">
            <el-option label="男" value="1"></el-option>
            <el-option label="女" value="2"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item prop="gradeId" label="班级代号">
          <el-input v-model="userInfo.gradeId" :disabled="true" class="copy-text">
            <span class="svg-container" slot="prefix">
              <svg-icon icon-class="grade" />
            </span>
          </el-input>
          <el-button type="success" icon="el-icon-document-copy" @click="copyGradeId" style="margin-top:8px">复制</el-button>
        </el-form-item>

        <el-form-item prop="school" label="学校">
          <el-input v-model="userInfo.school" :disabled="true">
            <span class="svg-container" slot="prefix">
              <svg-icon icon-class="school" />
            </span>
          </el-input>
        </el-form-item>

        <el-form-item prop="major" label="专业">
          <el-input v-model="userInfo.major" :disabled="true">
            <span class="svg-container" slot="prefix">
              <svg-icon icon-class="major" />
            </span>
          </el-input>
        </el-form-item>

        <el-form-item prop="major" label="班级">
          <el-input v-model="userInfo.gradeName" :disabled="true">
            <span class="svg-container" slot="prefix">
              <svg-icon icon-class="grade" />
            </span>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button :type="isModifyUserInfo?'danger':'info'" @click="modifyUserInfo">{{isModifyUserInfo?'确认修改':'修改个人信息'}}</el-button>
          <el-button type="primary">修改密码</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script>
import ClipboardJS from 'clipboard'
import { mapState } from 'vuex'
export default {
  name: 'Profile',
  data () {
    return {
      isModifyUserInfo: false
    }
  },
  methods: {
    copyGradeId () {
      const clipboard = new ClipboardJS('.copy-text')
      clipboard.on('success', function (e) {
        this.$message({
          message: '复制成功',
          type: 'success'
        })
      })

      clipboard.on('error', function (e) {
        this.$message({
          message: '复制失败',
          type: 'error'
        })
      })
    },
    modifyUserInfo () {
      if (!this.isModifyUserInfo) {
        this.isModifyUserInfo = true
      } else {
        this.isModifyUserInfo = false
      }
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
</style>
