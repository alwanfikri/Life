// ========= IMPORTS =========
import { setUser, getUser } from './users.js'
import { openDB } from './db.js'
import { renderDaily } from './daily.js'
import { renderWeekly } from './weekly.js'
import { renderMonthly } from './monthly.js'
import { renderAdd } from './add.js'

// ========= CONFIG =========
const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwwP1vcelnBwsiG1Zy67wvK0xSsQCWEgaIvuRBgGTHvNFOGOS6JEzYcF3SU0tUz7ulf/exec'


// ========= OPTIONAL: legacy hook =========
window.selectUser = function(name) {
  setUser(name)
  location.reload()
}


// ========= JSONP REQUEST =========
async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    const callbackName = 'callback_' + Date.now()

    window[callbackName] = function(data) {
      delete window[callbackName]
      script.remove()
      resolve(data)
    }

    script.onerror = function() {
      delete window[callbackName]
      script.remove()
      reject(new Error('Script load failed'))
    }

    const sep = url.includes('?') ? '&' : '?'
    script.src = url + sep + 'callback=' + callbackName
    document.body.appendChild(script)

    setTimeout(() => {
      if (window[callbackName]) {
        delete window[callbackName]
        script.remove()
        reject(new Error('Request timeout'))
      }
    }, 30000)
  })
}


// ========= SYNC BUTTON =========
window.syncNow = async function(e) {
  const button = e?.target || e?.currentTarget
  const original = button ? button.textContent : null

  if (button) {
    button.textContent = 'Syncing...'
    button.disabled = true
  }

  try {
    const user = getUser()
    if (!user) throw new Error('No user selected')

    const db = await openDB()

    const stores = ['journals', 'schedules', 'finance']
    const localData = {}

    for (const store of stores) {
      localData[store] = await new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readonly')
        const req = tx.objectStore(store).getAll()
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      })
    }

    const syncData = { user, localData }

    const url =
      `${APPS_SCRIPT_URL}?action=sync&data=${encodeURIComponent(JSON.stringify(syncData))}`

    const result = await makeRequest(url)

    if (!result.success)
      throw new Error(result.message || 'Sync failed')

    const synced = await saveRemoteData(result.data, user)

    if (button) {
      button.textContent =
        synced > 0 ? `✓ Synced ${synced} items` : '✓ Up to date'
    }

    setTimeout(() => location.reload(), 1200)

  } catch (err) {
    console.error('Sync error:', err)

    if (button) {
      button.textContent = '✗ ' + err.message
      setTimeout(() => {
        button.textContent = original
        button.disabled = false
      }, 3000)
    }
  }
}


// ========= SAVE REMOTE DATA =========
async function saveRemoteData(remoteData, currentUser) {
  const db = await openDB()
  const stores = ['journals', 'schedules', 'finance']
  let totalSynced = 0

  const allUsers = Object.keys(remoteData || {})

  for (const store of stores) {
    try {
      // read local
      const tx = db.transaction(store, 'readonly')
      const req = tx.objectStore(store).getAll()

      const localItems = await new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      })

      const localIds = new Set(localItems.map(i => i.id))

      // merge remote respecting sharing
      let combined = []

      for (const user of allUsers) {
        const items = remoteData[user]?.[store] || []

        if (user === currentUser)
          combined.push(...items)
        else
          combined.push(...items.filter(x => x.shared))
      }

      const newItems = combined.filter(x => !localIds.has(x.id))

      if (newItems.length) {
        const wtx = db.transaction(store, 'readwrite')
        const storeRef = wtx.objectStore(store)

        newItems.forEach(i => storeRef.put(i))

        await new Promise((resolve, reject) => {
          wtx.oncomplete = resolve
          wtx.onerror = () => reject(wtx.error)
        })

        totalSynced += newItems.length
      }

    } catch (err) {
      console.error(`Error syncing ${store}:`, err)
    }
  }

  return totalSynced
}


// ========= INITIALIZE DB ONLY =========
window.onload = async () => {
  await openDB()
  // UI is controlled in index.html
}


// ========= OPTIONAL VIEW HOOKS =========
window.showView = function(name) {
  if (name === 'daily') return renderDaily()
  if (name === 'weekly') return renderWeekly()
  if (name === 'monthly') return renderMonthly()
  if (name === 'add') return renderAdd()
}
