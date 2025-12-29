import { save } from './db.js'
import { getUser } from './users.js'

export async function addFinance(amount, type, category, shared=false) {
  const item = {
    id: crypto.randomUUID(),
    owner: getUser(),
    shared,
    amount,
    type,
    category,  // 🆕
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  await save('finance', item)
}
