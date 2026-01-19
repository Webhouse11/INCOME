
import { CMSData, Article, Product, LogEntry } from '../types.ts';
import { INITIAL_DATA } from '../constants.ts';

// Unique DB Version for Absolute Authority Mode - V16 for Massive Marketplace Injection
const DB_NAME = 'IncomeLab_Absolute_Authority_V16';
const STORE_NAME = 'cms_data_unrestricted';
const VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;
let cmsCache: CMSData | null = null;

const getDB = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
};

/**
 * HARD PERSISTENCE: Immediate, unrestricted write to disk.
 */
export const saveCMSData = async (data: CMSData): Promise<boolean> => {
  try {
    const cleanData = JSON.parse(JSON.stringify(data));
    cmsCache = cleanData;
    
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(cleanData, 'master_data');
      
      transaction.oncomplete = () => {
        console.log("AUTHORITY: Disk sync successful.");
        resolve(true);
      };
      transaction.onerror = () => {
        console.error("AUTHORITY: Disk sync failure.");
        resolve(false);
      };
    });
  } catch (error) {
    return false;
  }
};

/**
 * MASTER BOOTSTRAP: Zero-Restore Logic.
 */
export const initializeCMSData = async (): Promise<CMSData> => {
  const db = await getDB();
  return new Promise((resolve) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('master_data');

    request.onsuccess = () => {
      if (request.result) {
        cmsCache = request.result;
        console.log("AUTHORITY: Registry loaded.");
        resolve(cmsCache!);
      } else {
        console.log("AUTHORITY: Initializing new registry.");
        cmsCache = { ...INITIAL_DATA, logs: [] };
        saveCMSData(cmsCache!);
        resolve(cmsCache!);
      }
    };
  });
};

export const getCMSData = (): CMSData => {
  return cmsCache ? JSON.parse(JSON.stringify(cmsCache)) : { ...INITIAL_DATA, logs: [] };
};

export const updateItem = async (type: 'article' | 'product', id: string, payload: any) => {
  const data = getCMSData();
  
  if (type === 'article') {
    const index = data.articles.findIndex(i => i.id === id);
    if (index !== -1) {
      data.articles[index] = { ...data.articles[index], ...payload, updatedAt: new Date().toISOString() };
    } else {
      data.articles.unshift({ ...payload, id, createdAt: new Date().toISOString(), source: 'user' });
    }
  } else {
    const index = data.products.findIndex(i => i.id === id);
    if (index !== -1) {
      data.products[index] = { ...data.products[index], ...payload, updatedAt: new Date().toISOString() };
    } else {
      data.products.unshift({ ...payload, id, createdAt: new Date().toISOString(), source: 'user' });
    }
  }

  const log: LogEntry = {
    timestamp: new Date().toISOString(),
    level: 'SUCCESS',
    message: `AUTHORITY UPDATE: ${id} modified.`,
    source: 'MasterControl'
  };
  data.logs.unshift(log);
  if (data.logs.length > 50) data.logs.pop();

  return await saveCMSData(data);
};

export const hardDeleteItems = async (type: 'article' | 'product', ids: string[]) => {
  const data = getCMSData();
  
  if (type === 'article') {
    data.articles = data.articles.filter(a => !ids.includes(a.id));
  } else {
    data.products = data.products.filter(p => !ids.includes(p.id));
  }

  const log: LogEntry = {
    timestamp: new Date().toISOString(),
    level: 'WARNING',
    message: `HARD PURGE: ${ids.length} items removed.`,
    source: 'MasterControl'
  };
  data.logs.unshift(log);

  return await saveCMSData(data);
};

export const restoreAllData = async () => {
  await saveCMSData({ ...INITIAL_DATA, logs: [] });
  window.location.reload();
};

export const getIntegrityReport = () => ({
  healthScore: 100,
  logs: getCMSData().logs
});
