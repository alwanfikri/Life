import { setUser, getUser } from './users.js'
import { openDB } from './db.js'

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwwP1vcelnBwsiG1Zy67wvK0xSsQCWEgaIvuRBgGTHvNFOGOS6JEzYcF3SU0tUz7ulf/exec';

window.selectUser = function(name) {
  setUser(name)
  location.reload()
}

// Helper function to make requests without CORS issues
async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const callbackName = 'callback_' + Date.now();
    
    window[callbackName] = function(data) {
      delete window[callbackName];
      document.body.removeChild(script);
      resolve(data);
    };
    
    script.onerror = function() {
      delete window[callbackName];
      document.body.removeChild(script);
      reject(new Error('Script load failed'));
    };
    
    // Add callback parameter
    const separator = url.includes('?') ? '&' : '?';
    script.src = url + separator + 'callback=' + callbackName;
    document.body.appendChild(script);
    
    // Timeout after 30 seconds
    setTimeout(() => {
      if (window[callbackName]) {
        delete window[callbackName];
        if (script.parentNode) {
          document.body.removeChild(script);
        }
        reject(new Error('Request timeout'));
      }
    }, 30000);
  });
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

    // Prepare data for sync
    const syncData = {
      user: user,
      localData: localData
    };

    // Build URL with parameters
    const url = `${APPS_SCRIPT_URL}?action=sync&data=${encodeURIComponent(JSON.stringify(syncData))}`;
    
    console.log('Syncing with URL (data omitted for brevity)');
    
    // Use JSONP to avoid CORS
    const result = await makeRequest(url);
    console.log('Sync result:', result);
    
    if (!result.success) {
      throw new Error(result.message || 'Sync failed');
    }

    // Save remote data to local
    if (result.data) {
      const syncCount = await saveRemoteData(result.data, user);
      if (syncCount > 0) {
        button.textContent = `✓ Synced ${syncCount} items!`;
      } else {
        button.textContent = '✓ Up to date!';
      }
    } else {
      button.textContent = '✓ Synced!';
    }
    
    setTimeout(() => location.reload(), 1500);

  } catch (error) {
    console.error('Sync error:', error);
    button.textContent = '✗ ' + error.message;
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 3000);
  }
}

async function saveRemoteData(remoteData, currentUser) {
  const db = await openDB();
  const stores = ['journals', 'schedules', 'finance'];
  const partnerUser = currentUser === 'fikri' ? 'khansa' : 'fikri';
  let totalSynced = 0;
  
  for (const store of stores) {
    try {
      // Get current local data
      const tx = db.transaction(store, 'readonly');
      const objectStore = tx.objectStore(store);
      const localItems = await new Promise((resolve, reject) => {
        const request = objectStore.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      // Get remote data for this user and partner
      const userRemote = remoteData[currentUser]?.[store] || [];
      const partnerRemote = remoteData[partnerUser]?.[store] || [];
      
      // Merge: Get all remote items (both user's and partner's shared items)
      const allRemote = [...userRemote];
      partnerRemote.forEach(item => {
        if (item.shared) {
          allRemote.push(item);
        }
      });
      
      // Find items that don't exist locally
      const localIds = new Set(localItems.map(item => item.id));
      const newItems = allRemote.filter(item => !localIds.has(item.id));
      
      // Save new items
      if (newItems.length > 0) {
        const writeTx = db.transaction(store, 'readwrite');
        const writeStore = writeTx.objectStore(store);
        
        for (const item of newItems) {
          writeStore.put(item);
        }
        
        await new Promise((resolve, reject) => {
          writeTx.oncomplete = () => resolve();
          writeTx.onerror = () => reject(writeTx.error);
        });
        
        totalSynced += newItems.length;
      }
    } catch (e) {
      console.error(`Error syncing ${store}:`, e);
    }
  }
  
  return totalSynced;
}

window.onload = async () => {
  await openDB()
  const user = getUser()
  if (!user) return
  
  document.getElementById('user-select').hidden = true
  document.getElementById('app').hidden = false
  document.getElementById('activeUser').innerText = user
}