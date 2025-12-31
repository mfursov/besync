import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { log } from './utils';

const execAsync = promisify(exec);

export class SyncManager {
  // eslint-disable-next-line no-unused-vars
  constructor(private configPath: string) {}

  async sync() {
    const config = JSON.parse(readFileSync(this.configPath, 'utf-8'));
    const { source, destinationMachines, rsyncOptions } = config;
    const configName = this.configPath.split('/').pop()?.replace('.json', '');

    log(`Starting sync for ${source}`, 'INFO', configName);

    // Ensure cache directory exists
    if (!existsSync('cache')) {
      mkdirSync('cache');
    }

    // Process machines sequentially (not in parallel) to avoid overwhelming SSH connections
    for (const machine of destinationMachines) {
      const command = `rsync ${rsyncOptions.join(' ')} -e ssh ${source} ${machine}:${source}`;
      try {
        await execAsync(command);
        log(`Synced ${source} to ${machine}`, 'SUCCESS', configName);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        log(`Failed to sync ${source} to ${machine}: ${errorMessage}`, 'ERROR', configName);
      }
    }
  }
}
