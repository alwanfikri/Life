import { save } from './db.js'
import { getUser } from './users.js'

export async function addFinance(amount, type, description = '', shared = false) {
  const item = {
    id: crypto.randomUUID(),
    owner: getUser(),
    shared,
    amount,
    type, // "in" or "out"
    description,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  await save('finance', item)
}