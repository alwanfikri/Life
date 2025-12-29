import { setUser, getUser } from './users.js'

window.selectUser = function(name) {
  setUser(name)
  location.reload()
}

window.onload = () => {
  const user = getUser()

  if (!user) return

  document.getElementById('user-select').hidden = true
  document.getElementById('app').hidden = false
  document.getElementById('activeUser').innerText = user
}
