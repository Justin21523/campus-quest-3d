// apps/api/src/utils/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  msg: string;
  ts: string;
  [key: string]: any;
}

const isProd = process.env.NODE_ENV === 'production';

function formatEntry(level: LogLevel, msg: string, meta?: Record<string, any>): LogEntry {
  return {
    level,
    msg,
    ts: new Date().toISOString(),
    ...(meta || {}),
  };
}

function log(level: LogLevel, msg: string, meta?: Record<string, any>): void {
  const entry = formatEntry(level, msg, meta);
  
  if (isProd) {
    // JSON output for production log aggregators
    console.log(JSON.stringify(entry));
  } else {
    // Pretty console for development
    const color = level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : '\x1b[36m';
    const reset = '\x1b[0m';
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    console.log(`${color}[${level.toUpperCase()}]${reset} ${msg}${metaStr}`);
  }
}

export const logger = {
  debug: (msg: string, meta?: Record<string, any>) => log('debug', msg, meta),
  info: (msg: string, meta?: Record<string, any>) => log('info', msg, meta),
  warn: (msg: string, meta?: Record<string, any>) => log('warn', msg, meta),
  error: (msg: string, meta?: Record<string, any>) => log('error', msg, meta),
};

// Attach to Express error handler
export function expressErrorLogger(err: Error, req: any, res: any, next: any): void {
  logger.error(`Unhandled error`, { 
    method: req.method, 
    url: req.originalUrl, 
    ip: req.ip, 
    error: err.message,
    stack: err.stack 
  });
  next(err);
}