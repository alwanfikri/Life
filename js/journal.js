import { save } from './db.js';
import { getUser } from './users.js';

export async function addJournal(text,shared){
  await save('journals',{
    id:crypto.randomUUID(),
    owner:getUser(),
    text,
    shared,
    createdAt:Date.now(),
    updatedAt:Date.now()
  });
}
