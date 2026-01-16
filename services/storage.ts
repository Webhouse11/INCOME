
import { CMSData, Article, Product, LogEntry } from '../types.ts';
import { INITIAL_DATA } from '../constants.ts';

const DB_NAME = 'IncomeLab_Infinite_V13';
const STORE_NAME = 'cms_data';
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

const addLog = (data: CMSData, level: LogEntry['level'], message: string, source: string) => {
  if (!data.logs) data.logs = [];
  data.logs.unshift({
    timestamp: new Date().toISOString(),
    level,
    message,
    source
  });
  // Keep last 100 logs for performance
  if (data.logs.length > 100) data.logs.pop();
};

export const saveCMSData = async (data: CMSData): Promise<boolean> => {
  try {
    cmsCache = data;
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(data, 'master_data');
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  } catch (error) {
    return false;
  }
};

export const initializeCMSData = async (): Promise<CMSData> => {
  const db = await getDB();
  return new Promise((resolve) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('master_data');

    request.onsuccess = async () => {
      let dbData = request.result as CMSData;
      let isFirstBoot = false;

      if (!dbData) {
        isFirstBoot = true;
        dbData = { 
          ...INITIAL_DATA, 
          deletedIds: [], 
          backups: {}, 
          logs: [],
          lastAuditAt: new Date().toISOString() 
        };
        addLog(dbData, 'SUCCESS', 'Workspace initialized from system baseline.', 'BootEngine');
      }

      // DIAGNOSTIC SCAN
      const currentIds = new Set([
        ...dbData.articles.map(a => a.id),
        ...dbData.products.map(p => p.id)
      ]);

      const missingArticles = INITIAL_DATA.articles.filter(a => !currentIds.has(a.id));
      const missingProducts = INITIAL_DATA.products.filter(p => !currentIds.has(p.id));

      if (missingArticles.length > 0 || missingProducts.length > 0) {
        addLog(dbData, 'RECOVERY', `Detected ${missingArticles.length + missingProducts.length} missing core files. Stabilization active.`, 'IntegrityGuard');
        dbData.articles = [...dbData.articles, ...missingArticles.map(a => ({ ...a, isLocked: true }))];
        dbData.products = [...dbData.products, ...missingProducts.map(p => ({ ...p, isLocked: true }))];
        dbData.lastAuditAt = new Date().toISOString();
      } else if (!isFirstBoot) {
        addLog(dbData, 'INFO', 'Integrity Scan Complete: Workspace stable, no drift detected.', 'IntegrityGuard');
      }

      cmsCache = dbData;
      await saveCMSData(dbData);
      resolve(dbData);
    };
  });
};

export const getCMSData = (): CMSData => {
  return cmsCache || { ...INITIAL_DATA, logs: [] };
};

export const updateItemWithSnapshot = async (type: 'article' | 'product', id: string, payload: any) => {
  const data = { ...getCMSData() };
  if (!data.backups) data.backups = {};
  
  const list = type === 'article' ? data.articles : data.products;
  const index = list.findIndex(i => i.id === id);
  
  if (index !== -1) {
    if (list[index].isLocked) {
      addLog(data, 'WARNING', `Blocked write attempt to protected file: ${id}`, 'SecurityEngine');
      await saveCMSData(data);
      return false;
    }

    if (!data.backups[id]) data.backups[id] = [];
    data.backups[id].push({ ...list[index], snapshotAt: new Date().toISOString() });
    
    if (data.backups[id].length > 15) data.backups[id].shift();

    const updatedItem = { 
      ...list[index], 
      ...payload, 
      version: (list[index].version || 1) + 1,
      updatedAt: new Date().toISOString() 
    };
    
    if (type === 'article') data.articles[index] = updatedItem;
    else data.products[index] = updatedItem as any;
    
    addLog(data, 'SUCCESS', `Updated ${type} and created version snapshot: ${id}`, 'PersistenceGuard');
  } else {
    const newItem = { ...payload, id, version: 1, createdAt: new Date().toISOString(), source: 'user' };
    if (type === 'article') data.articles.unshift(newItem);
    else data.products.unshift(newItem);
    addLog(data, 'INFO', `Registered new ${type} to workspace: ${id}`, 'PersistenceGuard');
  }

  return await saveCMSData(data);
};

export const deleteItemWithGuard = async (type: 'article' | 'product', id: string) => {
  const data = { ...getCMSData() };
  const list = type === 'article' ? data.articles : data.products;
  const item = list.find(i => i.id === id);

  if (!item) return false;

  if (item.isLocked) {
    addLog(data, 'ERROR', `Blocked deletion of protected baseline file: ${id}`, 'SecurityEngine');
    await saveCMSData(data);
    return false;
  }

  if (type === 'article') {
    data.articles = data.articles.filter(a => a.id !== id);
  } else {
    data.products = data.products.filter(p => p.id !== id);
  }

  if (!data.deletedIds) data.deletedIds = [];
  data.deletedIds.push(id);
  addLog(data, 'WARNING', `Archived ${type}: ${id}`, 'PersistenceGuard');

  return await saveCMSData(data);
};

export const toggleItemLock = async (type: 'article' | 'product', id: string) => {
  const data = { ...getCMSData() };
  const list = type === 'article' ? data.articles : data.products;
  const index = list.findIndex(i => i.id === id);
  if (index !== -1) {
    list[index].isLocked = !list[index].isLocked;
    addLog(data, 'INFO', `${list[index].isLocked ? 'Locked' : 'Unlocked'} security protocol for: ${id}`, 'SecurityEngine');
    return await saveCMSData(data);
  }
  return false;
};

export const rollbackToVersion = async (id: string, versionIndex: number) => {
  const data = { ...getCMSData() };
  if (!data.backups || !data.backups[id] || !data.backups[id][versionIndex]) return false;
  
  const restoredState = data.backups[id][versionIndex];
  const artIdx = data.articles.findIndex(a => a.id === id);
  const prodIdx = data.products.findIndex(p => p.id === id);
  
  if (artIdx !== -1) data.articles[artIdx] = { ...restoredState, version: data.articles[artIdx].version + 1 };
  else if (prodIdx !== -1) data.products[prodIdx] = { ...restoredState, version: data.products[prodIdx].version + 1 };
  
  addLog(data, 'RECOVERY', `Rolled back file to previous snapshot state: ${id}`, 'BackupEngine');
  return await saveCMSData(data);
};

export const getIntegrityReport = () => {
  const current = getCMSData();
  const unlockedImportant = [
    ...current.articles.filter(a => !a.isLocked && a.source === 'system'),
    ...current.products.filter(p => !p.isLocked && p.source === 'system')
  ];

  return {
    riskCount: unlockedImportant.length,
    unlockedIds: unlockedImportant.map(i => i.id),
    healthScore: Math.max(0, 100 - (unlockedImportant.length * 3)),
    totalBackups: Object.keys(current.backups || {}).length,
    lastVerified: current.lastAuditAt,
    logs: current.logs || []
  };
};

export const restoreAllData = async () => {
  const current = getCMSData();
  addLog(current, 'RECOVERY', 'Triggering full workspace stabilization...', 'IntegrityGuard');
  
  const currentIds = new Set([...current.articles.map(a => a.id), ...current.products.map(p => p.id)]);
  
  const missingArticles = INITIAL_DATA.articles.filter(a => !currentIds.has(a.id)).map(a => ({ ...a, version: 1, isLocked: true }));
  const missingProducts = INITIAL_DATA.products.filter(p => !currentIds.has(p.id)).map(p => ({ ...p, version: 1, isLocked: true }));
  
  const newData = {
    ...current,
    articles: [...current.articles, ...missingArticles],
    products: [...current.products, ...missingProducts],
    deletedIds: [],
    lastAuditAt: new Date().toISOString()
  };
  
  await saveCMSData(newData);
  window.location.reload();
};

export const clearAllData = async () => {
  if (window.confirm("CRITICAL: Permanent wipe of workspace. This cannot be undone.")) {
    const db = await getDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.clear();
    window.location.reload();
  }
};
