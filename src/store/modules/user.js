import { login, logout, getInfo, register, modifyInfo } from '@/api/user'
import { getToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const state = {
  token: getToken(),
  userName: '',
  fullName: '',
  gender: 0,
  school: '',
  major: '',
  gradeName: '',
  gradeId: '',
  role: ''
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = getToken()
  },
  SET_USERNAME: (state, userName) => {
    state.userName = userName
  },
  SET_FULLNAME: (state, fullName) => {
    state.fullName = fullName
  },
  SET_GENDER: (state, gender) => {
    state.gender = gender
  },
  SET_SCHOOL: (state, school) => {
    state.school = school
  },
  SET_MAJOR: (state, major) => {
    state.major = major
  },
  SET_GRADENAME: (state, grade) => {
    state.gradeName = grade
  },
  SET_GRADEID: (state, gradeId) => {
    state.gradeId = gradeId
  },
  SET_ROLE: (state, role) => {
    state.role = role
  }
}

const actions = {
  // user login
  login ({ commit }, userInfo) {
    const { userName, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ userName, password }).then(response => {
        const { data } = response
        commit('SET_USERNAME', data.userName)
        commit('SET_FULLNAME', data.fullName)
        commit('SET_GENDER', data.gender)
        commit('SET_SCHOOL', data.school)
        commit('SET_MAJOR', data.major)
        commit('SET_SCHOOL', data.school)
        commit('SET_GRADENAME', data.gradeName)
        commit('SET_GRADEID', data.gradeId)
        commit('SET_ROLE', data.role)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  register ({ commit }, userInfo) {
    return new Promise((resolve, reject) => {
      register(userInfo).then(response => {
        const { data } = response
        commit('SET_TOKEN')
        commit('SET_USERNAME', data.userName)
        commit('SET_FULLNAME', data.fullName)
        commit('SET_GENDER', data.gender)
        commit('SET_SCHOOL', data.school)
        commit('SET_MAJOR', data.major)
        commit('SET_GRADENAME', data.gradeName)
        commit('SET_GRADEID', data.gradeId)
        // commit('SET_ROLE', data.role)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo ({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo().then(response => {
        const { data } = response
        commit('SET_USERNAME', data.userName)
        commit('SET_FULLNAME', data.fullName)
        commit('SET_GENDER', data.gender)
        commit('SET_SCHOOL', data.school)
        commit('SET_MAJOR', data.major)
        commit('SET_GRADENAME', data.gradeName)
        commit('SET_GRADEID', data.gradeId)
        commit('SET_ROLE', data.role)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },
  modifyInfo ({ commit, userInfo }) {
    return new Promise((resolve, reject) => {
      modifyInfo(userInfo).then(response => {
        const { data } = response
        commit('SET_USERNAME', data.userName)
        commit('SET_FULLNAME', data.fullName)
        commit('SET_GENDER', data.gender)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },
  // user logout
  logout ({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLE', null)
        removeToken()
        resetRouter()
        dispatch('tagsView/delAllViews', null, { root: true })

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken ({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLE', null)
      removeToken()
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
