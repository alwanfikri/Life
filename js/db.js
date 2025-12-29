const DB_NAME = 'life_beta'
const DB_VERSION = 1

export function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = e => {
      const db = e.target.result

      db.createObjectStore('journals', { keyPath: 'id' })
      db.createObjectStore('schedules', { keyPath: 'id' })
      db.createObjectStore('finance', { keyPath: 'id' })
      db.createObjectStore('syncQueue', { autoIncrement: true })
    }

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function save(store, data) {
  const db = await openDB()
  const tx = db.transaction(store, 'readwrite')
  tx.objectStore(store).put(data)
}