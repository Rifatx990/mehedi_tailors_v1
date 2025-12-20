
/**
 * ATELIER CORE DATABASE SERVICE
 * Uses IndexedDB for solid, production-grade persistence.
 */

const DB_NAME = 'MehediAtelierDB';
const DB_VERSION = 1;
const STORES = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  USERS: 'users',
  FABRICS: 'fabrics',
  BANNERS: 'banners',
  PARTNERS: 'partners',
  REVIEWS: 'reviews',
  REQUESTS: 'requests',
  MATERIALS: 'materials',
  CONFIG: 'config',
  EMAILS: 'emails',
  NOTIFICATIONS: 'notifications'
};

export class DatabaseService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        Object.values(STORES).forEach(store => {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: 'id' });
          }
        });
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = () => reject('Database initialization failed.');
    });
  }

  async save(store: string, data: any): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([store], 'readwrite');
        const objectStore = transaction.objectStore(store);
        
        const clearRequest = objectStore.clear();
        
        clearRequest.onsuccess = () => {
          if (Array.isArray(data)) {
            if (data.length === 0) {
              return;
            }
            data.forEach(item => {
              if (item && item.id) objectStore.put(item);
            });
          } else if (data && data.id) {
            objectStore.put(data);
          }
        };

        transaction.oncomplete = () => resolve();
        transaction.onerror = (err) => {
          console.error(`Save failed for store ${store}:`, err);
          reject(err);
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  async getAll(store: string): Promise<any[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([store], 'readonly');
        const objectStore = transaction.objectStore(store);
        const request = objectStore.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject([]);
      } catch (err) {
        reject([]);
      }
    });
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.init();
    const storeNames = Object.values(STORES);
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(storeNames, 'readwrite');
        storeNames.forEach(store => transaction.objectStore(store).clear());
        transaction.oncomplete = () => resolve();
        transaction.onerror = (err) => reject(err);
      } catch (err) {
        reject(err);
      }
    });
  }

  async exportBackup(): Promise<string> {
    const backup: any = {};
    for (const store of Object.values(STORES)) {
      backup[store] = await this.getAll(store);
    }
    return JSON.stringify(backup, null, 2);
  }

  async importBackup(json: string): Promise<void> {
    const data = JSON.parse(json);
    // Sequence processing is critical to prevent transaction collisions
    for (const store of Object.values(STORES)) {
      if (data[store] && Array.isArray(data[store])) {
        await this.save(store, data[store]);
      }
    }
  }
}

export const dbService = new DatabaseService();
