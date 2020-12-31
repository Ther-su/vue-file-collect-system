import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'

axios.defaults.withCredentials = true
axios.defaults.baseURL = process.env.VUE_APP_BASE_API

axios.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code === 10005) {
      MessageBox.confirm('登录凭证过期，是否要重新登录', '提示', {
        confirmButtonText: '登录',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        store.dispatch('user/resetToken').then(() => {
          location.reload()
        })
      })
    } else if (res.code !== 0) {
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    console.log(error.message)
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)
export default axios
