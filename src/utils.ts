import { appendFileSync, existsSync, mkdirSync } from 'fs';

// Note: configName is optional and comes after required params for better readability
export function log(message: string, type: 'INFO' | 'SUCCESS' | 'ERROR' = 'INFO', configName?: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type}] ${message}`;

  // Общий лог
  appendFileSync('besync.log', `${logMessage}\n`);

  // Лог по конфигурации
  if (configName) {
    if (!existsSync('configs')) {
      mkdirSync('configs', { recursive: true });
    }
    appendFileSync(`configs/${configName}.log`, `${logMessage}\n`);
  }

  console.log(logMessage);
}
