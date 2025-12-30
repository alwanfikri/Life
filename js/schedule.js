import { openDB } from "./db.js";
import { getUser } from "./users.js";

export async function addSchedule(title,start,end,shared){
  const db = await openDB();

  const item = {
    id: crypto.randomUUID(),
    owner: getUser(),
    title,
    start,
    end,
    shared,
    createdAt: Date.now()
  };

  const tx = db.transaction("schedules","readwrite");
  tx.objectStore("schedules").put(item);
}
