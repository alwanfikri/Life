import { save } from './db.js'
import { getUser } from './users.js'

export async function addSchedule(title, start, end, category, shared=false) {
  const item = {
    id: crypto.randomUUID(),
    owner: getUser(),
    shared,
    title,
    category,   // 🆕
    start,
    end,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  await save('schedules', item)
}
