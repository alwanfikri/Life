import { openDB } from "./db.js";
import { getUser } from "./users.js";

export async function addJournal(text,shared){
  const db = await openDB();

  const item = {
    id: crypto.randomUUID(),
    owner: getUser(),
    shared,
    text,
    createdAt: Date.now()
  };

  const tx = db.transaction("journals","readwrite");
  tx.objectStore("journals").put(item);

  return tx.complete;
}
