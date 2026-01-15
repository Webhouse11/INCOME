import { CMSData } from '../types.ts';
import { INITIAL_DATA } from '../constants.ts';

const STORAGE_KEY = 'incomelab_cms_data_v1'; // Versioned key to prevent conflicts

export const getCMSData = (): CMSData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      // First time initialization
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    const parsed = JSON.parse(data);
    // Basic validation to ensure we have the right structure
    if (!parsed.articles || !parsed.products || !parsed.siteSettings) {
      throw new Error("Invalid storage format");
    }
    return parsed;
  } catch (error) {
    console.error("Storage Retrieval Error:", error);
    // If corruption occurs, we fallback to initial but don't overwrite unless saved
    return INITIAL_DATA;
  }
};

export const saveCMSData = (data: CMSData): boolean => {
  try {
    const stringified = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, stringified);
    return true;
  } catch (error) {
    console.error("Storage Save Error (Quota likely exceeded):", error);
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      alert("Storage quota exceeded! Try using smaller images or deleting old content.");
    } else {
      alert("An error occurred while saving. Please check the console.");
    }
    return false;
  }
};

export const updateSiteSettings = (settings: CMSData['siteSettings']) => {
  const data = getCMSData();
  data.siteSettings = settings;
  saveCMSData(data);
};

export const clearAllData = () => {
  if (window.confirm("Are you sure you want to reset all data to factory defaults? This cannot be undone.")) {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }
};