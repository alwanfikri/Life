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

function normalize(text){
  text = text.toLowerCase();
  Object.keys(slang).forEach(k=>{
    text = text.replaceAll(k, slang[k]);
  });
  return text;
}

export async function search(q){
  q = normalize(q);

  const db = await openDB();
  const results = [];

  for(const store of ["journals","schedules","finance"]){
    const tx = db.transaction(store,"readonly");
    const rows = await tx.objectStore(store).getAll();

    rows.forEach(item=>{
      const blob = JSON.stringify(item).toLowerCase();
      if(blob.includes(q)){
        results.push({...item,type:store});
      }
    });
  }

  return results;
}
