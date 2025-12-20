/**
 * ATELIER CORE DATABASE SERVICE (Virtual File System)
 * Mimics a root-level 'database.json' file accessible only by code.
 */

const DB_NAME = 'MehediAtelierDB';
const DB_VERSION = 10; 
const STORE_NAME = 'filesystem';
const DB_FILE_KEY = 'database.json';

export class DatabaseService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };

        request.onsuccess = (event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          resolve();
        };

        request.onerror = (event) => {
          console.error('Database initialization error:', event);
          reject('Virtual File System initialization failed.');
        };
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Reads the entire 'database.json' file
   */
  async readFile(): Promise<any> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(DB_FILE_KEY);

        request.onsuccess = () => {
          const data = request.result;
          resolve(data ? JSON.parse(data) : {});
        };
        request.onerror = () => reject('Failed to read database.json');
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Overwrites the 'database.json' file
   */
  async writeFile(data: any): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const jsonString = JSON.stringify(data);
        const request = store.put(jsonString, DB_FILE_KEY);

        request.onsuccess = () => resolve();
        request.onerror = () => reject('Failed to write to database.json');
      } catch (e) {
        reject(e);
      }
    });
  }

  async getAll(key: string): Promise<any[]> {
    const fullDb = await this.readFile();
    return Array.isArray(fullDb[key]) ? fullDb[key] : [];
  }

  async save(key: string, data: any): Promise<void> {
    const fullDb = await this.readFile();
    fullDb[key] = data;
    await this.writeFile(fullDb);
  }

  async clearAll(): Promise<void> {
    await this.writeFile({});
  }

  async exportBackup(): Promise<string> {
    const fullDb = await this.readFile();
    return JSON.stringify(fullDb, null, 2);
  }

  async importBackup(json: string): Promise<void> {
    const data = JSON.parse(json);
    await this.writeFile(data);
  }
}

export const dbService = new DatabaseService();