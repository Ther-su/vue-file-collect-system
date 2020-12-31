import Cookies from 'js-cookie'

const TokenKey = 'koa.sid'
const TokenKey2 = 'koa.sid.sig'

export function getToken () {
  return Cookies.get(TokenKey)
}

export function setToken (token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken () {
  Cookies.remove(TokenKey)
  Cookies.remove(TokenKey2)
}
