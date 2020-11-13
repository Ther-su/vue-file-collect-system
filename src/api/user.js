import request from '@/utils/request'

export function login (data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}
export function register (data) {
  return request({
    url: '/user/register',
    method: 'post',
    data
  })
}
export function getInfo () {
  return request({
    url: '/user/info',
    method: 'get'
  })
}
export function modifyInfo () {
  return request({
    url: '/user/modify',
    method: 'put'
  })
}
export function logout () {
  return request({
    url: '/user/logout',
    method: 'put'
  })
}
