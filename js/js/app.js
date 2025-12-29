import { setUser, getUser } from './users.js'
import { openDB } from './db.js'
import { autoSync } from './sync.js'

window.selectUser = function(name) {
  setUser(name)
  location.reload()
}

window.onload = async () => {
  // 1️⃣ Force IndexedDB creation
  await openDB()

  // 2️⃣ Check active user
  const user = getUser()
  if (!user) return

  // 3️⃣ Show app
  document.getElementById('user-select').hidden = true
  document.getElementById('app').hidden = false
  document.getElementById('activeUser').innerText = user

  // 4️⃣ Auto-sync in background
  autoSync()
}