import { save } from './db.js';
import { getUser } from './users.js';

export async function addSchedule(title,start,end,category,shared){
  await save('schedules',{
    id:crypto.randomUUID(),
    owner:getUser(),
    title,
    category,
    start,
    end,
    shared,
    createdAt:Date.now(),
    updatedAt:Date.now()
  });
}
