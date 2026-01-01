import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import { log } from './utils';

const execAsync = promisify(exec);

interface SyncConfig {
  source: string;
  sourceMachines: string[];
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
  
  if (!Array.isArray(c['sourceMachines'])) {
    return false;
  }
  
  if ((c['sourceMachines'] as string[]).length === 0) {
    return false;
  }
  
  if (typeof c['cachePath'] !== 'string' || (c['cachePath'] as string).trim() === '') {
    return false;
  }
  
  return true;
}

export class DeleteManager {
  // eslint-disable-next-line no-unused-vars
  constructor(private configPath: string) {}

  async delete(filePath: string) {
    let configData: unknown;
    try {
      configData = JSON.parse(readFileSync(this.configPath, 'utf-8'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to parse config file: ${errorMessage}`);
    }

    if (!validateConfig(configData)) {
      throw new Error('Invalid configuration: missing required fields (source, sourceMachines, cachePath)');
    }

    const { source, sourceMachines } = configData;
    const configName = this.configPath.split('/').pop()?.replace('.json', '');
    
    // Check if filePath is relative to source
    const relativePath = filePath.startsWith(source) 
      ? filePath.slice(source.length).replace(/^\//, '')
      : filePath;
    
    log(`Deleting ${relativePath} from cache and ${sourceMachines.length} machines`, 'INFO', configName);
    
    // Delete from cache
    const cacheFilePath = join(process.cwd(), configData.cachePath as string, relativePath);
    if (existsSync(cacheFilePath)) {
      rmSync(cacheFilePath, { recursive: true, force: true });
      log(`Deleted from cache: ${cacheFilePath}`, 'SUCCESS', configName);
    } else {
      log(`Not found in cache: ${relativePath}`, 'INFO', configName);
    }

    // Delete from each machine
    for (const machine of sourceMachines) {
      const deleteScript = `rm -rf ${source}/${relativePath}`;
      try {
        await execAsync(`ssh ${machine} "${deleteScript}"`);
        log(`Deleted ${relativePath} from ${machine}`, 'SUCCESS', configName);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        log(`Failed to delete ${relativePath} from ${machine}: ${errorMessage}`, 'ERROR', configName);
      }
    }

    log(`Done deleting ${relativePath}`, 'INFO', configName);
  }
}
