import { appendFileSync, existsSync, mkdirSync } from 'fs';

export function log(message: string, type: 'INFO' | 'SUCCESS' | 'ERROR' = 'INFO', configName?: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type}] ${message}`;

  // Общий лог
  appendFileSync('besync.log', logMessage + '\n');

  // Лог по конфигурации
  if (configName) {
    if (!existsSync('configs')) {
      mkdirSync('configs');
    }
    appendFileSync(`configs/${configName}.log`, logMessage + '\n');
  }

  console.log(logMessage);
}
