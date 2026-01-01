import { readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { SyncManager } from './sync';
import { DeleteManager } from './delete';

async function main() {
  const command = process.argv[2];
  const pathArg = process.argv[3];

  if (!command) {
    console.error('Usage:');
    console.error('  besync sync <folder-or-config>    Sync all configs in folder or single config');
    console.error('  besync delete <config> <file>     Delete file from cache and all machines');
    process.exit(1);
  }

  if (command === 'delete') {
    const configPath = pathArg;
    const fileToDelete = process.argv[4];
    if (!configPath || !fileToDelete) {
      console.error('Usage: besync delete <config> <file-subpath>');
      process.exit(1);
    }
    const deleteManager = new DeleteManager(configPath);
    await deleteManager.delete(fileToDelete);
    return;
  }

  if (command === 'sync') {
    if (!pathArg) {
      console.error('Usage: besync sync <folder-or-config>');
      process.exit(1);
    }

    const pathIsDir = existsSync(pathArg) && !pathArg.endsWith('.json');
    const configsDir = pathIsDir ? pathArg : null;

    if (pathIsDir) {
      // Sync all configs in folder
      try {
        const configFiles = readdirSync(configsDir!)
          .filter((file) => file.endsWith('.json'));

        if (configFiles.length === 0) {
          console.error('No configuration files found in directory');
          process.exit(1);
        }

        console.log(`Found ${configFiles.length} configuration(s) to process:`);
        for (const configFile of configFiles) {
          console.log(`- ${configFile}`);
        }

        for (const configFile of configFiles) {
          const fullPath = join(configsDir!, configFile);
          const syncManager = new SyncManager(fullPath);
          await syncManager.sync();
        }

        console.log('All configurations processed');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error reading configs directory:', errorMessage);
        process.exit(1);
      }
    } else {
      // Sync single config
      const syncManager = new SyncManager(pathArg);
      await syncManager.sync();
    }
    return;
  }

  console.error(`Unknown command: ${command}`);
  console.error('Usage:');
  console.error('  besync sync <folder-or-config>    Sync all configs in folder or single config');
  console.error('  besync delete <config> <file>     Delete file from cache and all machines');
  process.exit(1);
}

main().catch(console.error);
