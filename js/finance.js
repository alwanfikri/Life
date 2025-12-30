import { openDB } from "./db.js";
import { getUser } from "./users.js";

export async function addFinance(amount,type,shared){
  const db = await openDB();

  const item = {
    id: crypto.randomUUID(),
    owner: getUser(),
    amount,
    type,
    shared,
    createdAt: Date.now()
  };

  const tx = db.transaction("finance","readwrite");
  tx.objectStore("finance").put(item);
}
