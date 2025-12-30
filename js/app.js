import { setUser, getUser } from './users.js'
import { openDB } from './db.js'

const API =
 'https://script.google.com/macros/s/AKfycbwwP1vcelnBwsiG1Zy67wvK0xSsQCWEgaIvuRBgGTHvNFOGOS6JEzYcF3SU0tUz7ulf/exec';


// ===== JSONP HELPER =====
function jsonp(url){
  return new Promise((resolve,reject)=>{
    const cb = "cb_"+Date.now();
    window[cb] = data=>{
      resolve(data);
      delete window[cb];
      script.remove();
    };
    const script = document.createElement("script");
    script.src = url + `&callback=${cb}`;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}


// ===== USERS =====
async function fetchUsers(){

  try{
    const res = await jsonp(`${API}?action=getUsers`);
    const users = res || [];

    const db = await openDB();
    const tx = db.transaction("users","readwrite");
    const store = tx.objectStore("users");
    await store.clear();
    users.forEach(u=>store.put(u));

    return users;
  }
  catch(e){

    const db = await openDB();
    return new Promise(res=>{
      db.transaction("users","readonly")
        .objectStore("users")
        .getAll().onsuccess=e=>res(e.target.result);
    });
  }
}

async function addUserRemote(name){
  await jsonp(`${API}?action=addUser&name=${encodeURIComponent(name)}`);
  return fetchUsers();
}


// ===== UI =====
window.showApp = name=>{
  document.getElementById("landing-page").classList.remove("active");
  document.getElementById("home-page").classList.add("active");
  document.getElementById("main-nav").style.display="flex";
  document.getElementById("nav-username").textContent = name;
};


// ===== LOGIN =====
window.quickLogin = name=>{
  setUser(name);
  showApp(name);
};

window.loginUser = async ()=>{
  const name = document.getElementById("username-input").value.trim();
  if(!name) return;
  await addUserRemote(name);
  setUser(name);
  showApp(name);
};


// ===== INIT =====
window.addEventListener("load", async()=>{

  await openDB();
  const users = await fetchUsers();

  document.getElementById("user-select-list").innerHTML =
    users.map(u=>`
      <button class="user-chip" onclick="quickLogin('${u.name}')">
        ${u.name}
      </button>
    `).join("");

  const u = getUser();
  if(u) showApp(u);
});
