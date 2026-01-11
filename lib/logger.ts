export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  [key: string]: any;
}

const formatLog = (level: LogLevel, message: string, meta: Record<string, any> = {}): string => {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };
  return JSON.stringify(entry);
};

export const logger = {
  info: (message: string, meta?: Record<string, any>) => {
    console.log(formatLog("info", message, meta));
  },
  warn: (message: string, meta?: Record<string, any>) => {
    console.warn(formatLog("warn", message, meta));
  },
  error: (message: string, meta?: Record<string, any>) => {
    console.error(formatLog("error", message, meta));
  },
  debug: (message: string, meta?: Record<string, any>) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(formatLog("debug", message, meta));
    }
  },
};
