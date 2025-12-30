import { openDB } from "./db.js";

const slang = {
  duit:"money",
  uang:"money",
  jajan:"eat",
  opo:"what",
  nulis:"write",
  lakukan:"do",
  aktivitas:"activity",
  belanja:"spend"
};

function normalize(t){
  t=t.toLowerCase();
  Object.keys(slang).forEach(k=>{
    t = t.replaceAll(k,slang[k]);
  });
  return t;
}

export async function search(q){
  q = normalize(q);

  const db = await openDB();
  const results = [];

  for(const s of ["journals","schedules","finance"]){
    const rows = await db.transaction(s,"readonly")
      .objectStore(s).getAll();

    rows.forEach(r=>{
      if(JSON.stringify(r).toLowerCase().includes(q))
        results.push({...r,type:s});
    });
  }

  return results;
}
