// ── Simple Logger ───────────────────────────────────────────────────────
// Uses console under the hood. Each message is prefixed with ISO timestamp
// and level tag so server logs are easy to grep.

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

function formatMessage(level: LogLevel, message: string, meta?: unknown): string {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level}] ${message}`;
  if (meta !== undefined) {
    return `${base} ${typeof meta === "string" ? meta : JSON.stringify(meta)}`;
  }
  return base;
}

export const logger = {
  info(message: string, meta?: unknown): void {
    console.log(formatMessage("INFO", message, meta));
  },

  warn(message: string, meta?: unknown): void {
    console.warn(formatMessage("WARN", message, meta));
  },

  error(message: string, meta?: unknown): void {
    console.error(formatMessage("ERROR", message, meta));
  },

  debug(message: string, meta?: unknown): void {
    if (process.env.NODE_ENV !== "production") {
      console.debug(formatMessage("DEBUG", message, meta));
    }
  },
} as const;

export default logger;
