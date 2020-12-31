export function getStorage (key) {
  const res = window.localStorage.getItem(key)
  if (res && res !== 'undefined') {
    return JSON.parse(res)
  }
  return false
}

export function setStorage (key, val) {
  window.localStorage.setItem(key, JSON.stringify(val))
}

export function clearStorage (key) {
  window.localStorage.removeItem(key)
}
