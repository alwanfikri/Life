import { openDB } from './db.js'

export async function queueSync(data) {
  const db = await openDB()
  db.transaction('syncQueue', 'readwrite')
    .objectStore('syncQueue')
    .add(data)
}

window.syncNow = async function() {
  alert('Manual sync placeholder (Apps Script later)')
}
