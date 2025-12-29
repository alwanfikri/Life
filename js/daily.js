import { openDB } from './db.js'
import { getUser } from './users.js'

export async function renderDaily() {
  const db = await openDB()
  const user = getUser()

  const view = document.getElementById('view')
  view.innerHTML = `<h2>Today</h2>`

  const today = new Date().toISOString().slice(0,10)

  const journals = await readAll(db, 'journals')
  const schedules = await readAll(db, 'schedules')
  const finance = await readAll(db, 'finance')

  const todaysJournals = journals.filter(j =>
    new Date(j.createdAt).toISOString().startsWith(today)
  )

  const todaysEvents = schedules.filter(s =>
    new Date(s.start).toISOString().startsWith(today)
  )

  const todaysFinance = finance.filter(f =>
    new Date(f.createdAt).toISOString().startsWith(today)
  )

  let balanceIn = 0
  let balanceOut = 0

  todaysFinance.forEach(f => {
    if (f.type === "in") balanceIn += Number(f.amount)
    else balanceOut += Number(f.amount)
  })

  view.innerHTML += `
    <div>
      <h3>Money</h3>
      <p>In: ${balanceIn}</p>
      <p>Out: ${balanceOut}</p>
    </div>
  `

  view.innerHTML += `<h3>Events</h3>`
  todaysEvents.forEach(e => {
    view.innerHTML += `<div>${e.title}</div>`
  })

  view.innerHTML += `<h3>Journal</h3>`
  todaysJournals.forEach(j => {
    view.innerHTML += `<div>${j.text}</div>`
  })
}

async function readAll(db, store) {
  return new Promise(resolve => {
    const tx = db.transaction(store)
    const req = tx.objectStore(store).getAll()
    req.onsuccess = () => resolve(req.result)
  })
}
