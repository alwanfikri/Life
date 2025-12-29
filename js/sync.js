import { setUser, getUser } from './users.js'
import { openDB } from './db.js'

window.selectUser = function(name) {
  setUser(name)
  location.reload()
}

window.syncNow = async function() {
  const button = event.target;
  const originalText = button.textContent;
  
  button.textContent = 'Syncing...';
  button.disabled = true;

  try {
    const user = getUser();
    if (!user) throw new Error('No user selected');

    // Get all local data
    const db = await openDB();
    const stores = ['journals', 'schedules', 'finance'];
    const localData = {};
    
    for (const store of stores) {
      const tx = db.transaction(store, 'readonly');
      const objectStore = tx.objectStore(store);
      const request = objectStore.getAll();
      
      localData[store] = await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    // Send to Google Apps Script
    const response = await fetch('https://script.google.com/macros/s/AKfycbwwP1vcelnBwsiG1Zy67wvK0xSsQCWEgaIvuRBgGTHvNFOGOS6JEzYcF3SU0tUz7ulf/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'sync',
        user: user,
        localData: localData
      })
    });

    if (!response.ok) {
      throw new Error('Network error: ' + response.status);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Sync failed');
    }

    button.textContent = '✓ Synced!';
    setTimeout(() => location.reload(), 1000);

  } catch (error) {
    console.error('Sync error:', error);
    button.textContent = '✗ ' + error.message;
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 3000);
  }
}

window.onload = async () => {
  // 1️⃣ Force IndexedDB creation
  await openDB()

  // 2️⃣ Check active user
  const user = getUser()
  if (!user) return

  // 3️⃣ Show app
  document.getElementById('user-select').hidden = true
  document.getElementById('app').hidden = false
  document.getElementById('activeUser').innerText = user
}