import { save } from './db.js'
import { getUser } from './users.js'

export async function addSchedule(title, start, end, shared=false) {
  const item = {
    id: crypto.randomUUID(),
    owner: getUser(),
    shared,
    title,
    start,
    end,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  await save('schedules', item)
}
