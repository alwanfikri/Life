const DB_NAME = 'life_beta';
const DB_VERSION = 2; 

export function openDB(){
  return new Promise((resolve,reject)=>{
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = e=>{
      const db = e.target.result;

      if(!db.objectStoreNames.contains('journals'))
        db.createObjectStore('journals',{keyPath:'id'});

      if(!db.objectStoreNames.contains('schedules'))
        db.createObjectStore('schedules',{keyPath:'id'});

      if(!db.objectStoreNames.contains('finance'))
        db.createObjectStore('finance',{keyPath:'id'});

      if(!db.objectStoreNames.contains('users'))
        db.createObjectStore('users',{keyPath:'name'});
    };

    req.onsuccess = ()=>resolve(req.result);
    req.onerror = ()=>reject(req.error);
  });
}
