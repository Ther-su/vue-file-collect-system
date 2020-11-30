import { addTask, getMyTask } from '@/api/task'

const state = {
  newTask: null,
  tasks: [],
  count: 0
}

const mutations = {
  SET_NEW_TASK: (state, task) => {
    state.newTask = task
  },
  SET_TASK: (state, tasks) => {
    state.tasks = tasks
  },
  SET_COUNT: (state, count) => {
    state.count = count
  }
}

const actions = {
  addTask ({ commit }, task) {
    return new Promise((resolve, reject) => {
      addTask(task).then(response => {
        const { data } = response
        commit('SET_NEW_TASK', data)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  getMyTask ({ commit }) {
    return new Promise((resolve, reject) => {
      getMyTask().then(response => {
        const { data } = response
        commit('SET_TASK', data.rows)
        commit('SET_COUNT', data.count)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
