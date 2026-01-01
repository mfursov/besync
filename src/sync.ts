import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { log } from './utils';

const execAsync = promisify(exec);

interface SyncConfig {
  source: string;
  destinationMachines: string[];
  cachePath: string;
  rsyncOptions?: string[];
}

function validateConfig(config: unknown): config is SyncConfig {
  if (!config || typeof config !== 'object') {
    return false;
  }

  const c = config as Record<string, unknown>;
  
  if (typeof c['source'] !== 'string' || (c['source'] as string).trim() === '') {
    return false;
  }
  
  if (!Array.isArray(c['destinationMachines'])) {
    return false;
  }
  
  if ((c['destinationMachines'] as string[]).length === 0) {
    return false;
  }
  
  if (typeof c['cachePath'] !== 'string' || (c['cachePath'] as string).trim() === '') {
    return false;
  }
  
  return true;
}

export class SyncManager {
  // eslint-disable-next-line no-unused-vars
  constructor(private configPath: string) {}

  async sync() {
    let configData: unknown;
    try {
      configData = JSON.parse(readFileSync(this.configPath, 'utf-8'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to parse config file: ${errorMessage}`);
    }

    if (!validateConfig(configData)) {
      throw new Error('Invalid configuration: missing required fields (source, destinationMachines, cachePath)');
    }

    const { source, destinationMachines, rsyncOptions = ['-avz', '--delete'] } = configData;
    const configName = this.configPath.split('/').pop()?.replace('.json', '');

    log(`Starting sync for ${source}`, 'INFO', configName);

    // Ensure cache directory exists
    if (!existsSync('cache')) {
      mkdirSync('cache', { recursive: true });
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
