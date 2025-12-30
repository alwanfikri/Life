import { setUser, getUser } from './users.js'
import { openDB } from './db.js'

const API = 'https://script.google.com/macros/s/AKfycbwwP1vcelnBwsiG1Zy67wvK0xSsQCWEgaIvuRBgGTHvNFOGOS6JEzYcF3SU0tUz7ulf/exec';

// ================= USER SYNC =================

async function fetchUsers(){
  try{
    const res = await fetch(`${API}?action=getUsers`);
    const users = await res.json();

    const db = await openDB();
    const tx = db.transaction("users","readwrite");
    const store = tx.objectStore("users");

    await store.clear();
    users.forEach(u=>store.put(u));

    return users;
  }
  catch(e){
    // offline fallback
    const db = await openDB();
    return new Promise(res=>{
      db.transaction("users","readonly")
        .objectStore("users")
        .getAll().onsuccess = e=>res(e.target.result);
    });
  }
}

async function addUserRemote(name){
  await fetch(`${API}?action=addUser&name=${encodeURIComponent(name)}`);
  return fetchUsers();
}

// ============== LANDING UI ==============

async function loadLandingUsers(){
  const list = await fetchUsers();
  const box = document.getElementById("user-select-list");

  if(!list.length){
    box.innerHTML="<i>Belum ada user terdaftar</i>";
    return;
  }

  box.innerHTML = list.map(u=>`
    <button class="user-chip" onclick="quickLogin('${u.name}')">${u.name}</button>
  `).join("");
}

window.quickLogin = name=>{
  setUser(name);
  showApp(name);
};

// ============ LOGIN HANDLER ============

window.loginUser = async ()=>{
  const name = document.getElementById("username-input").value.trim();
  if(!name) return;

  await addUserRemote(name);

  setUser(name);
  showApp(name);
};

// ============ INIT ============

window.addEventListener("load", async()=>{
  await openDB();
  await loadLandingUsers();

  const u = getUser();
  if(u) showApp(u);
});
