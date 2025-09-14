// Offline-first storage service for local data persistence and sync

export interface StorageItem<T = any> {
  data: T;
  timestamp: number;
  version: number;
  synced: boolean;
}

export interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retries: number;
}

class StorageService {
  private static instance: StorageService;
  private syncQueue: SyncQueueItem[] = [];
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;

  private constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Load sync queue from localStorage
    this.loadSyncQueue();
  }

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Check if storage is available
  isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  // Save data locally with offline-first approach
  async save<T>(key: string, data: T, version: number = 1): Promise<void> {
    try {
      if (!this.isStorageAvailable()) {
        throw new Error('Local storage not available');
      }

      const storageItem: StorageItem<T> = {
        data,
        timestamp: Date.now(),
        version,
        synced: this.isOnline
      };

      localStorage.setItem(key, JSON.stringify(storageItem));

      // If offline, add to sync queue
      if (!this.isOnline) {
        this.addToSyncQueue('update', key, data);
      }
    } catch (error) {
      console.error('Failed to save data locally:', error);
      throw error;
    }
  }

  // Load data from local storage
  async load<T>(key: string): Promise<T | null> {
    try {
      if (!this.isStorageAvailable()) {
        return null;
      }

      const item = localStorage.getItem(key);
      if (!item) {
        return null;
      }

      const storageItem: StorageItem<T> = JSON.parse(item);
      return storageItem.data;
    } catch (error) {
      console.error('Failed to load data from storage:', error);
      return null;
    }
  }

  // Load data with fallback
  async loadWithFallback<T>(key: string, fallback: T): Promise<T> {
    const data = await this.load<T>(key);
    return data !== null ? data : fallback;
  }

  // Remove data from storage
  async remove(key: string): Promise<void> {
    try {
      if (!this.isStorageAvailable()) {
        return;
      }

      localStorage.removeItem(key);

      // Add to sync queue if offline
      if (!this.isOnline) {
        this.addToSyncQueue('delete', key, null);
      }
    } catch (error) {
      console.error('Failed to remove data from storage:', error);
      throw error;
    }
  }

  // Check if data exists
  async exists(key: string): Promise<boolean> {
    try {
      if (!this.isStorageAvailable()) {
        return false;
      }

      return localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  }

  // Get all keys
  async getAllKeys(): Promise<string[]> {
    try {
      if (!this.isStorageAvailable()) {
        return [];
      }

      return Object.keys(localStorage);
    } catch {
      return [];
    }
  }

  // Clear all data
  async clear(): Promise<void> {
    try {
      if (!this.isStorageAvailable()) {
        return;
      }

      localStorage.clear();
      this.syncQueue = [];
      this.saveSyncQueue();
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  }

  // Add item to sync queue
  private addToSyncQueue(operation: 'create' | 'update' | 'delete', key: string, data: any): void {
    const queueItem: SyncQueueItem = {
      id: `${key}_${Date.now()}`,
      operation,
      data,
      timestamp: Date.now(),
      retries: 0
    };

    this.syncQueue.push(queueItem);
    this.saveSyncQueue();
  }

  // Save sync queue to localStorage
  private saveSyncQueue(): void {
    try {
      localStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  // Load sync queue from localStorage
  private loadSyncQueue(): void {
    try {
      const queue = localStorage.getItem('sync_queue');
      if (queue) {
        this.syncQueue = JSON.parse(queue);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
      this.syncQueue = [];
    }
  }

  // Process sync queue when online
  private async processSyncQueue(): Promise<void> {
    if (this.syncInProgress || !this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;

    try {
      const itemsToProcess = [...this.syncQueue];
      this.syncQueue = [];

      for (const item of itemsToProcess) {
        try {
          await this.syncItem(item);
        } catch (error) {
          // If sync fails, add back to queue with retry count
          item.retries++;
          if (item.retries < 3) {
            this.syncQueue.push(item);
          }
          console.error('Failed to sync item:', item, error);
        }
      }

      this.saveSyncQueue();
    } finally {
      this.syncInProgress = false;
    }
  }

  // Sync individual item (mock implementation)
  private async syncItem(item: SyncQueueItem): Promise<void> {
    // In a real app, this would sync with the server
    console.log('Syncing item:', item);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mark as synced in localStorage
    if (item.operation !== 'delete') {
      const existingItem = localStorage.getItem(item.id);
      if (existingItem) {
        const storageItem = JSON.parse(existingItem);
        storageItem.synced = true;
        localStorage.setItem(item.id, JSON.stringify(storageItem));
      }
    }
  }

  // Get sync status
  getSyncStatus(): { pending: number; inProgress: boolean; online: boolean } {
    return {
      pending: this.syncQueue.length,
      inProgress: this.syncInProgress,
      online: this.isOnline
    };
  }

  // Force sync
  async forceSync(): Promise<void> {
    await this.processSyncQueue();
  }

  // Get storage usage info
  getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      if (!this.isStorageAvailable()) {
        return { used: 0, available: 0, percentage: 0 };
      }

      let used = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length;
        }
      }

      // Estimate available space (5MB limit in most browsers)
      const available = 5 * 1024 * 1024 - used;
      const percentage = (used / (5 * 1024 * 1024)) * 100;

      return { used, available, percentage };
    } catch {
      return { used: 0, available: 0, percentage: 0 };
    }
  }
}

// Create singleton instance
export const storageService = StorageService.getInstance();
