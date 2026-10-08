const TOKEN_KEY = 'convention_access_token'
const USER_KEY = 'convention_username'

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function setAccessToken(token) {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY)
    return
  }
  localStorage.setItem(TOKEN_KEY, token)
}

export function getUsername() {
  return localStorage.getItem(USER_KEY) || ''
}

export function setUsername(username) {
  if (!username) {
    localStorage.removeItem(USER_KEY)
    return
  }
  localStorage.setItem(USER_KEY, username)
}

export function clearAuthStorage() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function isLoggedIn() {
  return Boolean(getAccessToken())
}
