import request from '@/utils/request'

export function addTask (data) {
  return request({
    url: '/task/add',
    method: 'post',
    data
  })
}

export function getMyTask () {
  return request({
    url: '/task/my',
    method: 'get'
  })
}

export function upLoadImage (data) {
  return request({
    url: '/task/pic',
    method: 'post',
    data
  })
}
