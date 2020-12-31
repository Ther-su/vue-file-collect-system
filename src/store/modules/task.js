import { addTask, getMyTask } from '@/api/task'
import Vue from 'vue'
const state = {
  tasks: [],
  count: 0,
  newTask: null
}

const mutations = {
  SET_TASKS: (state, tasks) => {
    state.tasks = tasks
  },
  SET_NEW_TASK: (state, task) => {
    state.newTask = task
  },
  SET_COUNT: (state, count) => {
    state.count = count
  },
  SET_UPLOADFILE: (state, { rawFile, taskId }) => {
    let taskIndex = -1
    const targetTask = (state.tasks.filter((item, index) => {
      if (item.id === taskId) {
        taskIndex = index
        return true
      } else {
        return false
      }
    }))[0]
    targetTask.uploadFile = rawFile
    Vue.set(state.tasks, taskIndex, targetTask)
  }
}

const actions = {
  addTask ({ commit }, task) {
    return new Promise((resolve, reject) => {
      addTask(task).then(response => {
        const { data } = response
        const tasks = state.tasks
        tasks.unshift(data)
        commit('SET_TASKS', tasks)
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
        commit('SET_TASKS', data.taskList)
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
