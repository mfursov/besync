import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { log } from './utils';

const execAsync = promisify(exec);

function expandHome(path: string): string {
  if (path.startsWith('~/')) {
    return join(homedir(), path.slice(2));
  }
  return path;
}

interface SyncConfig {
  source: string;
  sourceMachines: string[];
  cachePath: string;
  rsyncOptions?: string[];
  exclude?: string[];
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
  
  if (c['exclude'] !== undefined && !Array.isArray(c['exclude'])) {
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
      throw new Error('Invalid configuration: missing required fields (source, sourceMachines, cachePath)');
    }

    const { source, sourceMachines, rsyncOptions = ['-avz'], exclude = [] } = configData;
    const configName = this.configPath.split('/').pop()?.replace('.json', '');

    // Build rsync options and exclude args
    const rsyncOpts = rsyncOptions.join(' ');
    const excludeArgs = exclude.map((pattern: string) => `--exclude=${pattern}`).join(' ');

    log(`Starting sync for ${source} with ${sourceMachines.length} machines`, 'INFO', configName);

    // Ensure cache directory exists
    const cacheDir = join(process.cwd(), expandHome(configData.cachePath as string));
    if (!existsSync(cacheDir)) {
      try {
        mkdirSync(cacheDir, { recursive: true, mode: 0o755 });
      } catch {
        log(`Failed to create cache directory: ${cacheDir}`, 'ERROR', configName);
        return;
      }
    }

    // Stage 1: Pull - update local cache from each machine
    log(`Stage 1: Pulling updates from ${sourceMachines.length} machines to cache`, 'INFO', configName);
    for (const machine of sourceMachines) {
      // rsync from remote to cache: machine:~/.ssh/ → cache/
      // --update: newer files on remote replace older files in cache
      // --ignore-existing: don't overwrite newer files in cache
      const command = `rsync ${rsyncOpts} ${excludeArgs} --update --ignore-existing -e "ssh -o ConnectTimeout=30" ${machine}:${source}/ ${cacheDir}/`;
      try {
        await execAsync(command);
        log(`Pulled updates from ${machine}`, 'SUCCESS', configName);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        log(`Failed to pull from ${machine}: ${errorMessage}`, 'WARNING', configName);
      }
    }

    // Stage 2: Push - update each machine from local cache
    log(`Stage 2: Pushing updates from cache to ${sourceMachines.length} machines`, 'INFO', configName);
    for (const machine of sourceMachines) {
      // rsync from cache to remote: cache/ → machine:~/.ssh/
      // --update: replace older files on remote
      const command = `rsync ${rsyncOpts} ${excludeArgs} --update -e "ssh -o ConnectTimeout=30" ${cacheDir}/ ${machine}:${source}/`;
      try {
        await execAsync(command);
        log(`Pushed updates to ${machine}`, 'SUCCESS', configName);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        log(`Failed to push to ${machine}: ${errorMessage}`, 'WARNING', configName);
      }
    }

    log(`Sync completed for ${source}`, 'INFO', configName);
  }
}
