import Vue from 'vue'
import VueRouter from 'vue-router'
const Layout = () => import(/* webpackChunkName: "layout" */ '@/layout')
const Login = () => import(/* webpackChunkName: "login" */ '@/views/login')
const Register = () => import(/* webpackChunkName: "register" */ '@/views/register')
const Profile = () => import(/* webpackChunkName: "profile" */ '@/views/profile')

Vue.use(VueRouter)

export const constantRoutes = [
  {
    path: '/login',
    name: 'Login',
    hidden: true,
    component: Login,
    meta: {
      title: '登录'
    }
  },
  {
    path: '/register',
    name: 'Register',
    hidden: true,
    component: Register,
    meta: {
      title: '注册'
    }
  },
  {
    path: '/',
    redirect: '/profile',
    component: Layout,
    children: [
      {
        path: 'profile',
        component: Profile,
        name: 'profile',
        meta: {
          title: '个人信息',
          icon: 'el-icon-user',
          roles: ['admin', 'student']
        }
      }
    ]
  }
]

export const asyncRoutes = [
  {
    path: '/task',
    redirect: '/task',
    component: Layout,
    children: [
      {
        path: 'index',
        component: Profile,
        name: 'profile',
        meta: {
          title: '我的作业',
          icon: 'el-icon-notebook-1',
          roles: ['admin', 'student']
        }
      }
    ]
  }
]

const createRouter = () => new VueRouter({
  routes: constantRoutes,
  scrollBehavior: () => ({ y: 0 })
})
const router = createRouter()

export function resetRouter () {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher
}

export default router
