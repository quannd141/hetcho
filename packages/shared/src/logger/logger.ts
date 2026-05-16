type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  tenantId?: string;
  userId?: string;
  bookingId?: string;
  requestId?: string;
  [key: string]: unknown;
}

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: unknown, context?: LogContext): void;
  child(bindings: LogContext): Logger;
}

const PII_KEYS = new Set(['phone', 'email', 'password', 'token', 'accessToken', 'refreshToken', 'hashSecret']);

function maskPII(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(maskPII);
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = PII_KEYS.has(key) && typeof value === 'string' ? maskString(value) : maskPII(value);
    }
    return result;
  }
  return obj;
}

function maskString(s: string): string {
  if (s.length <= 4) return '***';
  return `${s.slice(0, 2)}***${s.slice(-2)}`;
}

class ConsoleLogger implements Logger {
  constructor(private readonly bindings: LogContext = {}) {}

  private write(level: LogLevel, message: string, context?: LogContext, error?: unknown): void {
    const payload = {
      level,
      time: new Date().toISOString(),
      msg: message,
      ...maskPII({ ...this.bindings, ...context }) as object,
      ...(error instanceof Error ? { err: { name: error.name, message: error.message, stack: error.stack } } : {}),
    };
    const stream = level === 'error' || level === 'warn' ? console.error : console.info;
    stream(JSON.stringify(payload));
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.LOG_LEVEL === 'debug') this.write('debug', message, context);
  }
  info(message: string, context?: LogContext): void {
    this.write('info', message, context);
  }
  warn(message: string, context?: LogContext): void {
    this.write('warn', message, context);
  }
  error(message: string, error?: unknown, context?: LogContext): void {
    this.write('error', message, context, error);
  }
  child(bindings: LogContext): Logger {
    return new ConsoleLogger({ ...this.bindings, ...bindings });
  }
}

export const logger: Logger = new ConsoleLogger();
export const createLogger = (bindings: LogContext): Logger => new ConsoleLogger(bindings);
