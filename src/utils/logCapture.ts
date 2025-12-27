/**
 * Log capture utility for debugging in preview/production builds
 * Captures all console logs and makes them accessible via UI
 */

export interface LogEntry {
  timestamp: string;
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
}

class LogCapture {
  private logs: LogEntry[] = [];
  private maxLogs = 500; // Keep last 500 logs to prevent memory issues
  private originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
  };

  constructor() {
    this.interceptConsole();
  }

  private interceptConsole() {
    console.log = (...args: any[]) => {
      this.addLog('log', args);
      this.originalConsole.log(...args);
    };

    console.warn = (...args: any[]) => {
      this.addLog('warn', args);
      this.originalConsole.warn(...args);
    };

    console.error = (...args: any[]) => {
      this.addLog('error', args);
      this.originalConsole.error(...args);
    };

    console.info = (...args: any[]) => {
      this.addLog('info', args);
      this.originalConsole.info(...args);
    };
  }

  private addLog(level: LogEntry['level'], args: any[]) {
    const timestamp = new Date().toISOString();
    const message = args
      .map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      })
      .join(' ');

    this.logs.push({timestamp, level, message});

    // Trim logs if exceeding max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
  }

  public getLogsAsText(): string {
    return this.logs
      .map(log => `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`)
      .join('\n');
  }
}

// Singleton instance
export const logCapture = new LogCapture();
