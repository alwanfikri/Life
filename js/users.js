export function setUser(name) {
  localStorage.setItem('activeUser', name)
}

export function getUser() {
  return localStorage.getItem('activeUser')
}

export function clearUser() {
  localStorage.removeItem('activeUser')
}