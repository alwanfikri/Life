import { openDB } from './db.js'
import { getUser } from './users.js'

// !!! REPLACE THIS WITH YOUR ACTUAL APPS SCRIPT WEB APP URL !!!
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwwP1vcelnBwsiG1Zy67wvK0xSsQCWEgaIvuRBgGTHvNFOGOS6JEzYcF3SU0tUz7ulf/exec';

// Get all local data
async function getAllLocalData() {
  const db = await openDB();
  const stores = ['journals', 'schedules', 'finance'];
  const data = {};
  
  for (const store of stores) {
    const tx = db.transaction(store, 'readonly');
    const objectStore = tx.objectStore(store);
    const request = objectStore.getAll();
    
    data[store] = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  return data;
}

// Save remote data to local IndexedDB
async function saveRemoteData(remoteData) {
  const db = await openDB();
  const user = getUser();
  const stores = ['journals', 'schedules', 'finance'];
  
  let totalSynced = 0;
  
  for (const store of stores) {
    // Get current local data
    const tx = db.transaction(store, 'readonly');
    const objectStore = tx.objectStore(store);
    const localItems = await new Promise((resolve, reject) => {
      const request = objectStore.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    // Get remote data for this user and partner
    const partnerUser = user === 'fikri' ? 'khansa' : 'fikri';
    const userRemote = remoteData[user]?.[store] || [];
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
  }
  
  return totalSynced;
}

// Main sync function
window.syncNow = async function() {
  const button = event?.target || document.querySelector('[onclick="syncNow()"]');
  const originalText = button ? button.textContent : 'Sync';
  
  if (button) {
    button.textContent = 'Syncing...';
    button.disabled = true;
  }
  
  try {
    const user = getUser();
    
    if (!user) {
      throw new Error('No user selected');
    }
    
    // Check if URL is configured
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'https://script.google.com/macros/s/AKfycbwwP1vcelnBwsiG1Zy67wvK0xSsQCWEgaIvuRBgGTHvNFOGOS6JEzYcF3SU0tUz7ulf/exec') {
      throw new Error('Please configure APPS_SCRIPT_URL in sync.js');
    }
    
    // Get all local data
    const localData = await getAllLocalData();
    
    // Send to Google Apps Script
    const response = await fetch(APPS_SCRIPT_URL, {
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
      throw new Error('Sync request failed');
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Sync failed');
    }
    
    // Save remote data locally
    const syncedCount = await saveRemoteData(result.data);
    
    if (button) {
      if (syncedCount > 0) {
        button.textContent = `✓ Synced ${syncedCount} items`;
        // Reload page to show new data
        setTimeout(() => location.reload(), 1500);
      } else {
        button.textContent = '✓ Already up to date';
        setTimeout(() => {
          button.textContent = originalText;
          button.disabled = false;
        }, 2000);
      }
    }
    
  } catch (error) {
    console.error('Sync error:', error);
    
    if (button) {
      button.textContent = '✗ Sync failed: ' + error.message;
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 3000);
    }
    
    alert('Sync failed: ' + error.message);
  }
}

// Auto-sync on page load (optional)
export async function autoSync() {
  const user = getUser();
  if (user && APPS_SCRIPT_URL !== 'https://script.google.com/macros/s/AKfycbwwP1vcelnBwsiG1Zy67wvK0xSsQCWEgaIvuRBgGTHvNFOGOS6JEzYcF3SU0tUz7ulf/exec') {
    // Silently sync in background
    try {
      const localData = await getAllLocalData();
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync',
          user: user,
          localData: localData
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          await saveRemoteData(result.data);
        }
      }
    } catch (e) {
      console.log('Background sync failed:', e);
    }
  }
}