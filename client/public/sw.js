/**
 * IMPACT7 Service Worker
 * Gerencia cache offline e funcionalidades PWA
 */

const CACHE_NAME = 'impact7-v1';
const STATIC_CACHE = 'impact7-static-v1';
const DYNAMIC_CACHE = 'impact7-dynamic-v1';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html'
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Network first, fallback to cache
  networkFirst: async (request) => {
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      const cachedResponse = await caches.match(request);
      return cachedResponse || caches.match('/offline.html');
    }
  },

  // Cache first, fallback to network
  cacheFirst: async (request) => {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      return caches.match('/offline.html');
    }
  },

  // Stale while revalidate
  staleWhileRevalidate: async (request) => {
    const cachedResponse = await caches.match(request);
    const networkPromise = fetch(request).then(async (networkResponse) => {
      if (networkResponse.ok) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    }).catch(() => null);

    return cachedResponse || networkPromise;
  }
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip API requests (don't cache)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Skip external requests
  if (!url.origin.includes(self.location.origin)) {
    return;
  }

  // Determine cache strategy based on request type
  let strategy;

  // Static assets (JS, CSS, images) - cache first
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2)$/)
  ) {
    strategy = CACHE_STRATEGIES.cacheFirst;
  }
  // HTML pages - network first
  else if (request.headers.get('accept')?.includes('text/html')) {
    strategy = CACHE_STRATEGIES.networkFirst;
  }
  // Everything else - stale while revalidate
  else {
    strategy = CACHE_STRATEGIES.staleWhileRevalidate;
  }

  event.respondWith(strategy(request));
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const data = event.data?.json() || {};
  const title = data.title || 'IMPACT7';
  const options = {
    body: data.body || 'Nova notificação do IMPACT7',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Fechar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    const url = event.notification.data?.url || '/';
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-leads') {
    event.waitUntil(syncLeads());
  }
  
  if (event.tag === 'sync-calculations') {
    event.waitUntil(syncCalculations());
  }
  
  if (event.tag === 'sync-contacts') {
    event.waitUntil(syncContacts());
  }
  
  if (event.tag === 'sync-analytics') {
    event.waitUntil(syncAnalytics());
  }
  
  if (event.tag === 'sync-all') {
    event.waitUntil(
      Promise.all([
        syncLeads(),
        syncCalculations(),
        syncContacts(),
        syncAnalytics()
      ])
    );
  }
});

// IndexedDB helper functions
const DB_NAME = 'impact7-offline';
const DB_VERSION = 1;

async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Store for offline leads
      if (!db.objectStoreNames.contains('pendingLeads')) {
        db.createObjectStore('pendingLeads', { keyPath: 'id', autoIncrement: true });
      }
      
      // Store for offline calculations
      if (!db.objectStoreNames.contains('pendingCalculations')) {
        db.createObjectStore('pendingCalculations', { keyPath: 'id', autoIncrement: true });
      }
      
      // Store for offline contacts
      if (!db.objectStoreNames.contains('pendingContacts')) {
        db.createObjectStore('pendingContacts', { keyPath: 'id', autoIncrement: true });
      }
      
      // Store for offline analytics events
      if (!db.objectStoreNames.contains('pendingAnalytics')) {
        db.createObjectStore('pendingAnalytics', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function getAllFromStore(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function deleteFromStore(storeName, id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function clearStore(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Sync leads from IndexedDB to server
async function syncLeads() {
  try {
    console.log('[SW] Syncing leads...');
    const pendingLeads = await getAllFromStore('pendingLeads');
    
    if (pendingLeads.length === 0) {
      console.log('[SW] No pending leads to sync');
      return;
    }
    
    console.log(`[SW] Found ${pendingLeads.length} pending leads`);
    
    for (const lead of pendingLeads) {
      try {
        const response = await fetch('/api/trpc/leads.create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ json: lead.data })
        });
        
        if (response.ok) {
          await deleteFromStore('pendingLeads', lead.id);
          console.log(`[SW] Lead ${lead.id} synced successfully`);
        } else {
          console.error(`[SW] Failed to sync lead ${lead.id}:`, response.status);
        }
      } catch (error) {
        console.error(`[SW] Error syncing lead ${lead.id}:`, error);
      }
    }
    
    console.log('[SW] Leads sync completed');
  } catch (error) {
    console.error('[SW] Sync leads failed:', error);
    throw error;
  }
}

// Sync calculations from IndexedDB to server
async function syncCalculations() {
  try {
    console.log('[SW] Syncing calculations...');
    const pendingCalculations = await getAllFromStore('pendingCalculations');
    
    if (pendingCalculations.length === 0) {
      console.log('[SW] No pending calculations to sync');
      return;
    }
    
    console.log(`[SW] Found ${pendingCalculations.length} pending calculations`);
    
    for (const calc of pendingCalculations) {
      try {
        const response = await fetch('/api/trpc/calculator.saveResult', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ json: calc.data })
        });
        
        if (response.ok) {
          await deleteFromStore('pendingCalculations', calc.id);
          console.log(`[SW] Calculation ${calc.id} synced successfully`);
        } else {
          console.error(`[SW] Failed to sync calculation ${calc.id}:`, response.status);
        }
      } catch (error) {
        console.error(`[SW] Error syncing calculation ${calc.id}:`, error);
      }
    }
    
    console.log('[SW] Calculations sync completed');
  } catch (error) {
    console.error('[SW] Sync calculations failed:', error);
    throw error;
  }
}

// Sync contacts from IndexedDB to server
async function syncContacts() {
  try {
    console.log('[SW] Syncing contacts...');
    const pendingContacts = await getAllFromStore('pendingContacts');
    
    if (pendingContacts.length === 0) {
      console.log('[SW] No pending contacts to sync');
      return;
    }
    
    console.log(`[SW] Found ${pendingContacts.length} pending contacts`);
    
    for (const contact of pendingContacts) {
      try {
        const response = await fetch('/api/trpc/contacts.submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ json: contact.data })
        });
        
        if (response.ok) {
          await deleteFromStore('pendingContacts', contact.id);
          console.log(`[SW] Contact ${contact.id} synced successfully`);
        } else {
          console.error(`[SW] Failed to sync contact ${contact.id}:`, response.status);
        }
      } catch (error) {
        console.error(`[SW] Error syncing contact ${contact.id}:`, error);
      }
    }
    
    console.log('[SW] Contacts sync completed');
  } catch (error) {
    console.error('[SW] Sync contacts failed:', error);
    throw error;
  }
}

// Sync analytics events from IndexedDB to server
async function syncAnalytics() {
  try {
    console.log('[SW] Syncing analytics...');
    const pendingAnalytics = await getAllFromStore('pendingAnalytics');
    
    if (pendingAnalytics.length === 0) {
      console.log('[SW] No pending analytics to sync');
      return;
    }
    
    console.log(`[SW] Found ${pendingAnalytics.length} pending analytics events`);
    
    // Batch analytics events for efficiency
    const batchSize = 50;
    for (let i = 0; i < pendingAnalytics.length; i += batchSize) {
      const batch = pendingAnalytics.slice(i, i + batchSize);
      
      try {
        const response = await fetch('/api/trpc/analytics.trackBatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ json: { events: batch.map(e => e.data) } })
        });
        
        if (response.ok) {
          for (const event of batch) {
            await deleteFromStore('pendingAnalytics', event.id);
          }
          console.log(`[SW] Analytics batch of ${batch.length} events synced`);
        } else {
          console.error('[SW] Failed to sync analytics batch:', response.status);
        }
      } catch (error) {
        console.error('[SW] Error syncing analytics batch:', error);
      }
    }
    
    console.log('[SW] Analytics sync completed');
  } catch (error) {
    console.error('[SW] Sync analytics failed:', error);
    throw error;
  }
}

// Message event - communicate with main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
});

console.log('[SW] Service Worker loaded');
