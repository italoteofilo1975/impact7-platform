/**
 * Hook para armazenamento offline e sincronização em background
 * Usa IndexedDB para persistir dados quando offline
 */

import { useCallback, useEffect, useState } from 'react';

const DB_NAME = 'impact7-offline';
const DB_VERSION = 1;

type StoreName = 'pendingLeads' | 'pendingCalculations' | 'pendingContacts' | 'pendingAnalytics';

interface OfflineItem<T> {
  id?: number;
  data: T;
  createdAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      const stores: StoreName[] = ['pendingLeads', 'pendingCalculations', 'pendingContacts', 'pendingAnalytics'];
      
      stores.forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
        }
      });
    };
  });
}

async function addToStore<T>(storeName: StoreName, data: T): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    const item: OfflineItem<T> = {
      data,
      createdAt: Date.now(),
    };
    
    const request = store.add(item);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as number);
  });
}

async function getFromStore<T>(storeName: StoreName): Promise<OfflineItem<T>[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function getCountFromStore(storeName: StoreName): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.count();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function clearStore(storeName: StoreName): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function requestBackgroundSync(tag: string): Promise<boolean> {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register(tag);
      console.log(`[OfflineStorage] Background sync registered: ${tag}`);
      return true;
    } catch (error) {
      console.error('[OfflineStorage] Background sync registration failed:', error);
      return false;
    }
  }
  return false;
}

export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCounts, setPendingCounts] = useState({
    leads: 0,
    calculations: 0,
    contacts: 0,
    analytics: 0,
  });

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when coming back online
      requestBackgroundSync('sync-all');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update pending counts periodically
  useEffect(() => {
    const updateCounts = async () => {
      try {
        const [leads, calculations, contacts, analytics] = await Promise.all([
          getCountFromStore('pendingLeads'),
          getCountFromStore('pendingCalculations'),
          getCountFromStore('pendingContacts'),
          getCountFromStore('pendingAnalytics'),
        ]);
        
        setPendingCounts({ leads, calculations, contacts, analytics });
      } catch (error) {
        console.error('[OfflineStorage] Failed to get pending counts:', error);
      }
    };

    updateCounts();
    const interval = setInterval(updateCounts, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Save lead for offline sync
  const saveLead = useCallback(async (leadData: any): Promise<{ success: boolean; offline: boolean }> => {
    if (isOnline) {
      return { success: true, offline: false };
    }
    
    try {
      await addToStore('pendingLeads', leadData);
      await requestBackgroundSync('sync-leads');
      return { success: true, offline: true };
    } catch (error) {
      console.error('[OfflineStorage] Failed to save lead:', error);
      return { success: false, offline: true };
    }
  }, [isOnline]);

  // Save calculation for offline sync
  const saveCalculation = useCallback(async (calcData: any): Promise<{ success: boolean; offline: boolean }> => {
    if (isOnline) {
      return { success: true, offline: false };
    }
    
    try {
      await addToStore('pendingCalculations', calcData);
      await requestBackgroundSync('sync-calculations');
      return { success: true, offline: true };
    } catch (error) {
      console.error('[OfflineStorage] Failed to save calculation:', error);
      return { success: false, offline: true };
    }
  }, [isOnline]);

  // Save contact for offline sync
  const saveContact = useCallback(async (contactData: any): Promise<{ success: boolean; offline: boolean }> => {
    if (isOnline) {
      return { success: true, offline: false };
    }
    
    try {
      await addToStore('pendingContacts', contactData);
      await requestBackgroundSync('sync-contacts');
      return { success: true, offline: true };
    } catch (error) {
      console.error('[OfflineStorage] Failed to save contact:', error);
      return { success: false, offline: true };
    }
  }, [isOnline]);

  // Track analytics event for offline sync
  const trackEvent = useCallback(async (eventData: any): Promise<void> => {
    if (!isOnline) {
      try {
        await addToStore('pendingAnalytics', eventData);
        // Don't request sync immediately for analytics, batch them
      } catch (error) {
        console.error('[OfflineStorage] Failed to track event:', error);
      }
    }
  }, [isOnline]);

  // Force sync all pending data
  const syncAll = useCallback(async (): Promise<boolean> => {
    return requestBackgroundSync('sync-all');
  }, []);

  // Get all pending items
  const getPendingItems = useCallback(async () => {
    const [leads, calculations, contacts, analytics] = await Promise.all([
      getFromStore('pendingLeads'),
      getFromStore('pendingCalculations'),
      getFromStore('pendingContacts'),
      getFromStore('pendingAnalytics'),
    ]);
    
    return { leads, calculations, contacts, analytics };
  }, []);

  // Clear all pending items
  const clearAllPending = useCallback(async (): Promise<void> => {
    await Promise.all([
      clearStore('pendingLeads'),
      clearStore('pendingCalculations'),
      clearStore('pendingContacts'),
      clearStore('pendingAnalytics'),
    ]);
    
    setPendingCounts({ leads: 0, calculations: 0, contacts: 0, analytics: 0 });
  }, []);

  return {
    isOnline,
    pendingCounts,
    totalPending: pendingCounts.leads + pendingCounts.calculations + pendingCounts.contacts + pendingCounts.analytics,
    saveLead,
    saveCalculation,
    saveContact,
    trackEvent,
    syncAll,
    getPendingItems,
    clearAllPending,
  };
}

export default useOfflineStorage;
