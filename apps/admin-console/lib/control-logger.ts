import fs from 'fs';
import path from 'path';
import { LOG_DIR } from './paths';

const CONTROL_LOG_FILE = path.join(LOG_DIR, 'console-control.log');

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  action: string;
  service?: string;
  message: string;
  details?: Record<string, unknown>;
}

function formatLogEntry(entry: LogEntry): string {
  const parts = [
    `[${entry.timestamp}]`,
    `[${entry.level}]`,
    entry.service ? `[${entry.service}]` : null,
    `[${entry.action}]`,
    entry.message,
    entry.details ? JSON.stringify(entry.details) : null,
  ].filter(Boolean);
  return parts.join(' ');
}

function writeLog(entry: LogEntry) {
  const line = formatLogEntry(entry) + '\n';

  // Append to log file
  try {
    fs.appendFileSync(CONTROL_LOG_FILE, line);
  } catch (e) {
    console.error('Failed to write to control log:', e);
  }

  // Also output to console for Next.js server logs
  const consoleMethod =
    entry.level === 'ERROR' ? console.error : entry.level === 'WARN' ? console.warn : console.log;
  consoleMethod(`[CONTROL] ${line.trim()}`);
}

function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Console Control Logger
 * Logs all service control actions for debugging
 */
export const controlLog = {
  startAttempt(service: string, details?: Record<string, unknown>) {
    writeLog({
      timestamp: getTimestamp(),
      level: 'INFO',
      action: 'START_ATTEMPT',
      service,
      message: 'Attempting to start service',
      details,
    });
  },

  startSuccess(service: string, pid?: number) {
    writeLog({
      timestamp: getTimestamp(),
      level: 'INFO',
      action: 'START_SUCCESS',
      service,
      message: pid ? `Service started with PID ${pid}` : 'Service started',
      details: pid ? { pid } : undefined,
    });
  },

  startSkipped(service: string, reason: string) {
    writeLog({
      timestamp: getTimestamp(),
      level: 'WARN',
      action: 'START_SKIPPED',
      service,
      message: `Start skipped: ${reason}`,
    });
  },

  startFailed(service: string, error: string) {
    writeLog({
      timestamp: getTimestamp(),
      level: 'ERROR',
      action: 'START_FAILED',
      service,
      message: `Failed to start: ${error}`,
    });
  },

  stopAttempt(service: string) {
    writeLog({
      timestamp: getTimestamp(),
      level: 'INFO',
      action: 'STOP_ATTEMPT',
      service,
      message: 'Attempting to stop service',
    });
  },

  stopSuccess(service: string) {
    writeLog({
      timestamp: getTimestamp(),
      level: 'INFO',
      action: 'STOP_SUCCESS',
      service,
      message: 'Service stopped successfully',
    });
  },

  stopFailed(service: string, error: string) {
    writeLog({
      timestamp: getTimestamp(),
      level: 'ERROR',
      action: 'STOP_FAILED',
      service,
      message: `Failed to stop: ${error}`,
    });
  },

  forceKill(service: string, pid: number) {
    writeLog({
      timestamp: getTimestamp(),
      level: 'WARN',
      action: 'FORCE_KILL',
      service,
      message: `Force killing process ${pid}`,
      details: { pid },
    });
  },

  scriptExec(service: string, command: string, args: string[]) {
    writeLog({
      timestamp: getTimestamp(),
      level: 'DEBUG',
      action: 'SCRIPT_EXEC',
      service,
      message: `Executing: ${command} ${args.join(' ')}`,
      details: { command, args },
    });
  },

  pidFileWrite(service: string, pid: number, path: string) {
    writeLog({
      timestamp: getTimestamp(),
      level: 'DEBUG',
      action: 'PID_FILE_WRITE',
      service,
      message: `Wrote PID ${pid} to ${path}`,
    });
  },

  pidFileRead(service: string, pid: number | null, path: string) {
    writeLog({
      timestamp: getTimestamp(),
      level: 'DEBUG',
      action: 'PID_FILE_READ',
      service,
      message: pid ? `Read PID ${pid} from ${path}` : `No PID found at ${path}`,
    });
  },

  portCheck(service: string, port: number, isOpen: boolean) {
    writeLog({
      timestamp: getTimestamp(),
      level: 'DEBUG',
      action: 'PORT_CHECK',
      service,
      message: `Port ${port} is ${isOpen ? 'OPEN' : 'CLOSED'}`,
      details: { port, isOpen },
    });
  },

  stateChange(service: string, from: string, to: string) {
    writeLog({
      timestamp: getTimestamp(),
      level: 'INFO',
      action: 'STATE_CHANGE',
      service,
      message: `State: ${from} → ${to}`,
    });
  },

  error(action: string, message: string, details?: Record<string, unknown>) {
    writeLog({
      timestamp: getTimestamp(),
      level: 'ERROR',
      action,
      message,
      details,
    });
  },

  info(action: string, message: string, details?: Record<string, unknown>) {
    writeLog({
      timestamp: getTimestamp(),
      level: 'INFO',
      action,
      message,
      details,
    });
  },
};

// Export the log file path for streaming
export { CONTROL_LOG_FILE };
