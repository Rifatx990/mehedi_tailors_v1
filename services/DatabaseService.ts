
/**
 * ATELIER CORE DATABASE SERVICE (Pure File Interface)
 * Interacts directly with the server-side database.json.
 */

export class DatabaseService {
  /**
   * Reads the physical 'database.json' file from the server.
   * Cache-busting ensures we never get stale data from the browser cache.
   */
  async readFile(): Promise<any> {
    try {
      const response = await fetch(`./database.json?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.status === 404) {
        // This is expected on first-time setup before the PHP sync creates the file
        console.warn("Database Ledger not yet established on server. Readiness protocol active.");
        return null;
      }

      if (!response.ok) {
        throw new Error(`Database connection failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.warn("Artisan Ledger Handshake Bypassed:", err);
      return null;
    }
  }

  /**
   * Dispatches the updated state to the PHP Sync Bridge.
   * This is what makes changes global across all devices.
   */
  async writeFile(data: any): Promise<boolean> {
    try {
      // PHP ARCHITECT: Ensure sync_db.php exists in the root to handle this POST
      const response = await fetch('./sync_db.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data, null, 2)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Sync Bridge Rejected Payload:", errorText);
        return false;
      }

      return true;
    } catch (e) {
      console.error("Sync Bridge failure. Check sync_db.php existence and write permissions.", e);
      return false;
    }
  }

  async exportBackup(): Promise<string> {
    const data = await this.readFile();
    return JSON.stringify(data || {}, null, 2);
  }

  async importBackup(json: string): Promise<void> {
    const data = JSON.parse(json);
    await this.writeFile(data);
  }
}

export const dbService = new DatabaseService();
