import Vue from 'vue'
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + 1 + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

Vue.filter('statusFormat', function (val) {
  if (val === '1') {
    return '待提交'
  } else if (val === '2') {
    return '已提交'
  } else if (val === '3') {
    return '已过期'
  }
})

Vue.filter('statusTagFormat', function (val) {
  if (val === '1') {
    return ''
  } else if (val === '2') {
    return 'success'
  } else if (val === '3') {
    return 'danger'
  }
})
