import { openDB } from "./db.js";
import { getUser } from "./users.js";

/* ========= HELPERS ========= */

function formatDateLong(d){
  return new Date(d).toLocaleDateString("id-ID",{
    weekday:"long",
    year:"numeric",
    month:"long",
    day:"numeric"
  });
}

function formatTime(d){
  return new Date(d).toLocaleTimeString("id-ID",{
    hour:"2-digit",
    minute:"2-digit"
  });
}

function startOfDay(d){
  const x=new Date(d);
  x.setHours(0,0,0,0);
  return x;
}

function endOfDay(d){
  const x=new Date(d);
  x.setHours(23,59,59,999);
  return x;
}

/* ========= RENDER ROOT ========= */

export async function renderCalendar(view="daily"){

  const root=document.getElementById("calendar-root");
  root.innerHTML="Loading…";

  const db=await openDB();
  const items=(await getAll(db,"schedules"))
    .sort((a,b)=>new Date(a.start)-new Date(b.start));

  if(view==="daily") return renderDaily(items);
  if(view==="weekly") return renderWeekly(items);
  return renderMonthly(items);
}

/* ========= DB HELPER ========= */

async function getAll(db,store){
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,"readonly");
    const req=tx.objectStore(store).getAll();
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}

/* ========= DAILY ========= */

function renderDaily(items){
  const root=document.getElementById("calendar-root");
  const today=new Date();

  const filtered=items.filter(i=>{
    const d=new Date(i.start);
    return (
      d.getFullYear()==today.getFullYear() &&
      d.getMonth()==today.getMonth() &&
      d.getDate()==today.getDate()
    );
  });

  root.innerHTML=`
    <h3>${formatDateLong(today)}</h3>
    ${filtered.length===0?`
      <div class="empty-state">
        Tidak ada jadwal hari ini
      </div>
    `:filtered.map(renderCard).join("")}
  `;
}

/* ========= WEEKLY ========= */

function renderWeekly(items){
  const root=document.getElementById("calendar-root");

  const today=new Date();
  const first=new Date(today);
  first.setDate(today.getDate()-today.getDay()+1);

  const last=new Date(first);
  last.setDate(first.getDate()+6);

  root.innerHTML=`
    <h3>${formatDateLong(first)} – ${formatDateLong(last)}</h3>
    ${items
      .filter(i=>{
        const d=new Date(i.start);
        return d>=startOfDay(first) && d<=endOfDay(last);
      })
      .map(renderCard)
      .join("") || `<div class="empty-state">Tidak ada jadwal minggu ini</div>`}
  `;
}

/* ========= MONTHLY ========= */

function renderMonthly(items){
  const root=document.getElementById("calendar-root");
  const today=new Date();

  const year=today.getFullYear();
  const month=today.getMonth();

  const first=new Date(year,month,1);
  const last=new Date(year,month+1,0);

  let days=[];

  for(let d=1;d<=last.getDate();d++){
    const date=new Date(year,month,d);

    const dayItems=items.filter(i=>{
      const x=new Date(i.start);
      return (
        x.getFullYear()==year &&
        x.getMonth()==month &&
        x.getDate()==d
      );
    });

    days.push(`
      <div class="calendar-day">
        <div class="calendar-date">${d}</div>

        ${dayItems.map(j=>`
          <div class="calendar-pill ${j.shared?'shared':''}">
            ${j.title}
          </div>
        `).join("")}
      </div>
    `);
  }

  root.innerHTML=`
    <h3>${today.toLocaleDateString("id-ID",{month:"long",year:"numeric"})}</h3>

    <div class="calendar-grid">
      ${days.join("")}
    </div>
  `;
}

/* ========= CARD ========= */

function renderCard(item){
  return `
    <div class="item-card ${item.shared?'shared':''}">
      <div class="item-badges">
        <span class="item-badge">${item.owner}</span>
        ${item.shared?'<span class="item-badge shared">Shared</span>':""}
      </div>

      <h4>${item.title}</h4>

      <div class="item-meta">
        ${formatDateLong(item.start)}<br>
        ${formatTime(item.start)} – ${formatTime(item.end)}
      </div>
    </div>
  `;
}
