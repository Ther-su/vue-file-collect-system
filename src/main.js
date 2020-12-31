import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import router from './router'
import store from './store'
import axios from './utils/request'
import './icons'
import 'normalize.css/normalize.css'
import './filter'
import './permission/permission'
import '@/styles/index.scss'
import clipboard from 'clipboard'

Vue.prototype.clipboard = clipboard
Vue.prototype.$axios = axios

Vue.use(ElementUI)
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
