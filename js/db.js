const DB_NAME = 'life_beta'
const DB_VERSION = 1

export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (e) => {
      const db = e.target.result

      if (!db.objectStoreNames.contains('journals')) {
        db.createObjectStore('journals', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('schedules')) {
        db.createObjectStore('schedules', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('finance')) {
        db.createObjectStore('finance', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id' })
      }

      console.log('DB upgrade completed')
    }

    request.onsuccess = () => {
      console.log('DB opened:', DB_NAME)
      resolve(request.result)
    }

    request.onerror = () => {
      console.error('DB open failed', request.error)
      reject(request.error)
    }
  })
}
