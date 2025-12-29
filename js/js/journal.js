import { save } from './db.js'
import { getUser } from './users.js'

export async function addJournal(text, shared=false) {
  const entry = {
    id: crypto.randomUUID(),
    owner: getUser(),
    shared,
    text,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  await save('journals', entry)
}