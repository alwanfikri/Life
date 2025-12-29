const DB_NAME='life_beta';
const DB_VERSION=1;

export function openDB(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,DB_VERSION);

    req.onupgradeneeded=e=>{
      const db=e.target.result;

      if(!db.objectStoreNames.contains('journals'))
        db.createObjectStore('journals',{keyPath:'id'});

      if(!db.objectStoreNames.contains('schedules'))
        db.createObjectStore('schedules',{keyPath:'id'});

      if(!db.objectStoreNames.contains('finance'))
        db.createObjectStore('finance',{keyPath:'id'});
    };

    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}

export async function save(store,item){
  const db=await openDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,'readwrite');
    tx.objectStore(store).put(item);
    tx.oncomplete=()=>resolve();
    tx.onerror=()=>reject(tx.error);
  });
}
