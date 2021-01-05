import { addTask, getMyTasks, getPublishedTasks } from '@/api/task'
import Vue from 'vue'
const state = {
  myTasks: [],
  publishedTasks: [],
  myTasksCount: 0,
  publishedTasksCount: 0
}

const mutations = {
  SET_MY_TASKS: (state, myTasks) => {
    state.myTasks = myTasks
  },
  SET_PUBLISHED_TASKS: (state, publishedTasks) => {
    state.publishedTasks = publishedTasks
  },
  SET_MY_TASKS_COUNT: (state, myTasksCount) => {
    state.myTasksCount = myTasksCount
  },
  SET_PUBLISH_TASKS_COUNT: (state, publishedTasksCount) => {
    state.publishedTasksCount = publishedTasksCount
  },
  SET_UPLOADFILE: (state, { rawFile, taskId }) => {
    let taskIndex = -1
    const targetTask = (state.myTasks.filter((item, index) => {
      if (item.id === taskId) {
        taskIndex = index
        return true
      } else {
        return false
      }
    }))[0]
    targetTask.uploadFile = rawFile
    Vue.set(state.myTasks, taskIndex, targetTask)
  }
}

const actions = {
  addTask ({ commit }, task) {
    return new Promise((resolve, reject) => {
      addTask(task).then(response => {
        const { data } = response
        const myTasks = state.myTasks
        myTasks.unshift(data)
        commit('SET_MY_TASKS', myTasks)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  getMyTask ({ commit }, queryInfo) {
    return new Promise((resolve, reject) => {
      getMyTasks({
        params: queryInfo
      }).then(response => {
        const { data } = response
        commit('SET_MY_TASKS', data.taskList)
        commit('SET_MY_TASKS_COUNT', data.count)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  getPublishedTasks ({ commit }, queryInfo) {
    return new Promise((resolve, reject) => {
      getPublishedTasks({
        params: queryInfo
      }).then(response => {
        const { data } = response
        commit('SET_PUBLISHED_TASKS', data.taskList)
        commit('SET_PUBLISH_TASKS_COUNT', data.count)
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
