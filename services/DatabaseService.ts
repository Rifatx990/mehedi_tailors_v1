
/**
 * ATELIER CORE DATABASE SERVICE (Virtual File System)
 * Mimics a root-level 'database.json' file.
 */

const DB_NAME = 'MehediAtelierDB';
const DB_VERSION = 11; 
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
   * Reads the entire 'database.json' file.
   * If local storage is empty, it attempts to fetch the physical /database.json seed.
   */
  async readFile(): Promise<any> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(DB_FILE_KEY);

        request.onsuccess = async () => {
          const data = request.result;
          if (data) {
            resolve(JSON.parse(data));
          } else {
            // Seed from physical file if first run
            try {
              const response = await fetch('./database.json');
              if (response.ok) {
                const seedData = await response.json();
                await this.writeFile(seedData);
                resolve(seedData);
              } else {
                resolve({});
              }
            } catch (err) {
              console.warn("Could not find database.json seed file, starting fresh.");
              resolve({});
            }
          }
        };
        request.onerror = () => reject('Failed to read database.json');
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Overwrites the 'database.json' virtual file.
   */
  async writeFile(data: any): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const jsonString = JSON.stringify(data, null, 2); // Prettify for possible future disk writes
        const request = store.put(jsonString, DB_FILE_KEY);

        request.onsuccess = () => resolve();
        request.onerror = () => reject('Failed to write to database.json');
      } catch (e) {
        reject(e);
      }
    });
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
