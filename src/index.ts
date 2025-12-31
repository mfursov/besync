import { readdirSync } from 'fs';
import { join } from 'path';
import { SyncManager } from './sync';

async function main() {
  const configPath = process.argv[2]; // Путь к конфигу, например, configs/ssh_config.json

  if (!configPath) {
    // Если путь не указан, синхронизируем все конфиги из папки configs/
    const configsDir = join(__dirname, '../configs');
    try {
      const configFiles = readdirSync(configsDir)
        .filter((file) => file.endsWith('.json'));

      if (configFiles.length === 0) {
        console.error('No configuration files found in configs/ directory');
        process.exit(1);
      }

      console.log(`Found ${configFiles.length} configuration(s) to process:`);
      for (const configFile of configFiles) {
        console.log(`- ${configFile}`);
      }

      // Process configurations sequentially (not in parallel) to avoid overwhelming SSH connections
      // eslint-disable-next-line no-await-in-loop
      for (const configFile of configFiles) {
        const fullPath = join(configsDir, configFile);
        const syncManager = new SyncManager(fullPath);
        // eslint-disable-next-line no-await-in-loop
        await syncManager.sync();
      }

      console.log('All configurations processed');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error reading configs directory:', errorMessage);
      process.exit(1);
    }
  } else {
    const syncManager = new SyncManager(configPath);
    await syncManager.sync();
  }
}

main().catch(console.error);
