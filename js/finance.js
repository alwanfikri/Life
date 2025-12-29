import { save } from './db.js';
import { getUser } from './users.js';

export async function addFinance(amount,type,category,shared){
  await save('finance',{
    id:crypto.randomUUID(),
    owner:getUser(),
    amount,
    type,
    category,
    shared,
    createdAt:Date.now(),
    updatedAt:Date.now()
  });
}
