import { openDB } from './db.js'

console.log('APP MODULE LOADED')

window.onload = async () => {
  console.log('WINDOW ONLOAD')
  await openDB()
  console.log('DB OPEN ATTEMPTED')
}
