import { SyncManager } from './sync';

async function main() {
  const configPath = process.argv[2]; // Путь к конфигу, например, configs/ssh_config.json
  if (!configPath) {
    console.error('Usage: node dist/index.js <config-path>');
    process.exit(1);
  }
  
  const syncManager = new SyncManager(configPath);
  await syncManager.sync();
}

main().catch(console.error);
