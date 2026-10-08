/* Minimal logger. Never pass request bodies, cookies, tokens or emails to it. */
const silent = process.env.NODE_ENV === 'test';

function write(level: 'info' | 'warn' | 'error', message: string): void {
  if (silent) return;
  const line = `${new Date().toISOString()} [${level}] ${message}`;
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.info(line);
}

export const logger = {
  info: (message: string) => write('info', message),
  warn: (message: string) => write('warn', message),
  error: (message: string) => write('error', message),
};
