import { execa } from 'execa';
import path from 'path';
import fs from 'fs';
import net from 'net';
import { SERVICES, REAL_SERVICES, ServiceStatus } from './types';
import { controlLog } from './control-logger';
import { ROOT_DIR, LOG_DIR, START_SCRIPT } from './paths';

// Use global to persist state across HMR in development
declare global {
  var serviceProcesses: Record<string, { pid: number; startTime: Date }> | undefined;
}

if (!global.serviceProcesses) {
  global.serviceProcesses = {};
}

const processes = global.serviceProcesses!;

async function isPortOpen(port: number, service?: string): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(500); // Increased from 100ms for slower service responses
    socket.once('connect', () => {
      socket.destroy();
      if (service) controlLog.portCheck(service, port, true);
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      if (service) controlLog.portCheck(service, port, false);
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      if (service) controlLog.portCheck(service, port, false);
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

function getPidFromLog(name: string): { pid: number; startTime?: Date } | undefined {
  const pidFile = path.join(LOG_DIR, `${SERVICES[name]?.log?.replace('.log', '') || name}.pid`);
  if (fs.existsSync(pidFile)) {
    try {
      const stats = fs.statSync(pidFile);
      const pid = parseInt(fs.readFileSync(pidFile, 'utf8').trim());
      if (!isNaN(pid)) {
        // Check if process is still alive
        try {
          process.kill(pid, 0);
          return { pid, startTime: stats.mtime };
        } catch (e) {
          // Process not running, clean up stale pid file
          try {
            fs.unlinkSync(pidFile);
          } catch {}
        }
      }
    } catch (e) {}
  }
  return undefined;
}

export async function getServicesStatus(): Promise<ServiceStatus[]> {
  // Only return real services (not virtual ones like 'control')
  const statuses = await Promise.all(
    Object.keys(REAL_SERVICES).map(async (name) => {
      const config = REAL_SERVICES[name];
      const internalProc = processes[name];
      const externalInfo = getPidFromLog(name);

      // Detection priority for services with URLs: PORT CHECK is AUTHORITATIVE
      // This ensures we detect externally-started services correctly
      let running = false;
      let detectionMethod: 'port' | 'pid' | 'memory' | 'none' = 'none';

      // Port check is the primary detection method for services with URLs
      if (config.url) {
        try {
          const url = new URL(config.url);
          const port = parseInt(url.port);
          if (port) {
            const portOpen = await isPortOpen(port, name);
            if (portOpen) {
              running = true;
              detectionMethod = 'port';
            }
          }
        } catch (e) {}
      }

      // Fallback to PID/memory ONLY for services WITHOUT URLs
      // (All real services have URLs, so this is mainly for future-proofing)
      if (!running && !config.url) {
        if (internalProc) {
          running = true;
          detectionMethod = 'memory';
        } else if (externalInfo) {
          running = true;
          detectionMethod = 'pid';
        }
      }

      return {
        name,
        description: config.description,
        running,
        pid: internalProc?.pid || externalInfo?.pid,
        startTime: (internalProc?.startTime || externalInfo?.startTime)?.toISOString(),
        url: config.url,
        _detectionMethod: detectionMethod,
      };
    })
  );
  return statuses;
}

export async function startService(name: string) {
  const config = SERVICES[name];
  if (!config) {
    controlLog.startFailed(name, 'Service not found in config');
    throw new Error('Service not found');
  }

  controlLog.startAttempt(name, { flag: config.flag, url: config.url });

  // Check for externally running service via PID file
  const externalInfo = getPidFromLog(name);
  if (externalInfo) {
    controlLog.startSkipped(name, `Already running (PID: ${externalInfo.pid})`);
    return { pid: externalInfo.pid, alreadyRunning: true };
  }

  // Check if port is already in use (service started outside our tracking)
  if (config.url) {
    try {
      const url = new URL(config.url);
      const port = parseInt(url.port);
      if (port && (await isPortOpen(port, name))) {
        controlLog.startSkipped(name, `Port ${port} already in use`);
        return { pid: undefined, alreadyRunning: true };
      }
    } catch (e) {}
  }

  controlLog.scriptExec(name, START_SCRIPT, [config.flag]);
  controlLog.info('EXEC_CONTEXT', `Working directory: ${ROOT_DIR}`);

  try {
    const subprocess = execa(START_SCRIPT, [config.flag], {
      cwd: ROOT_DIR,
      detached: true,
      stdio: 'ignore',
    });

    subprocess.unref();

    // Note: We don't write PID file here - start-dev.sh handles that.
    // We also don't track the wrapper PID in-memory since it exits quickly
    // after spawning the actual service process.
    // The service will be detected as "running" via the PID file that
    // start-dev.sh writes, and via port checking.

    controlLog.startSuccess(name, subprocess.pid);
    controlLog.info('PID_DELEGATION', `PID file will be written by start-dev.sh for ${name}`);

    return { pid: subprocess.pid, delegated: true };
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    controlLog.startFailed(name, errorMsg);
    throw e;
  }
}

export async function stopService(name: string) {
  const proc = processes[name];

  // Also check for external PID if not in memory
  if (!proc) {
    let pid: number | undefined;
    const externalInfo = getPidFromLog(name);

    if (externalInfo) {
      pid = externalInfo.pid;
      controlLog.info('ADOPTING_EXTERNAL', `Found external PID ${pid} for ${name}`);
    } else {
      // Last resort: Check if running on port
      const config = SERVICES[name];
      if (config?.url) {
        try {
          const url = new URL(config.url);
          const port = parseInt(url.port);
          if (port) {
            const { stdout } = await execa('lsof', ['-ti', `:${port}`]);
            pid = parseInt(stdout.trim());
            if (!isNaN(pid)) {
              controlLog.info('ADOPTING_PORT', `Found PID ${pid} on port ${port} for ${name}`);
            }
          }
        } catch {} // Ignore errors (lsof fails if no process)
      }
    }

    if (pid) {
      processes[name] = { pid, startTime: new Date() };
    } else {
      controlLog.stopFailed(name, 'Not running (no PID in memory, file, or port)');
      throw new Error('Not running');
    }
  }

  const targetProc = processes[name];
  const config = SERVICES[name];
  controlLog.stopAttempt(name);

  // Helper to kill child processes of a given PID
  const killChildren = async (parentPid: number, signal: string) => {
    try {
      await execa('pkill', [signal === 'SIGKILL' ? '-KILL' : '-TERM', '-P', String(parentPid)]);
      controlLog.info('KILL_CHILDREN', `Sent ${signal} to children of PID ${parentPid}`);
    } catch {
      // pkill returns non-zero if no processes matched - that's OK
    }
  };

  // Helper to kill process on port (fallback for wrapper scripts)
  const killByPort = async (port: number, signal: string) => {
    try {
      const { stdout } = await execa('lsof', ['-ti', `:${port}`]);
      const pids = stdout.trim().split('\n').filter(Boolean);
      for (const pidStr of pids) {
        const pid = parseInt(pidStr);
        if (!isNaN(pid)) {
          try {
            process.kill(pid, signal === 'SIGKILL' ? 'SIGKILL' : 'SIGTERM');
            controlLog.info('KILL_BY_PORT', `Sent ${signal} to PID ${pid} on port ${port}`);
          } catch {}
        }
      }
    } catch {}
  };

  // Step 1: Try graceful SIGTERM to main process and its children
  controlLog.info('STOP_TARGET', `Sending SIGTERM to PID ${targetProc.pid} and children`);
  try {
    await killChildren(targetProc.pid, 'SIGTERM');
    process.kill(targetProc.pid, 'SIGTERM');
  } catch (error: any) {
    if (error.code === 'ESRCH') {
      // Process already dead
      controlLog.stopSuccess(name);
      delete processes[name];
      return;
    }
    controlLog.stopFailed(name, `SIGTERM error: ${error.message}`);
    throw error;
  }

  // Step 2: Wait for process to exit gracefully (max 3 seconds)
  const maxWait = 3000;
  const pollInterval = 200;
  let waited = 0;

  while (waited < maxWait) {
    await new Promise((r) => setTimeout(r, pollInterval));
    waited += pollInterval;

    try {
      process.kill(targetProc.pid, 0); // Check if still alive
    } catch {
      // Process is dead - graceful shutdown succeeded
      controlLog.stopSuccess(name);
      delete processes[name];
      return;
    }
  }

  // Step 3: Process didn't exit gracefully, escalate to SIGKILL
  controlLog.info(
    'STOP_ESCALATE',
    `Process ${targetProc.pid} didn't exit after ${maxWait}ms, sending SIGKILL`
  );
  try {
    await killChildren(targetProc.pid, 'SIGKILL');
    process.kill(targetProc.pid, 'SIGKILL');
  } catch (error: any) {
    if (error.code !== 'ESRCH') {
      controlLog.stopFailed(name, `SIGKILL error: ${error.message}`);
    }
  }

  // Step 4: If port is still in use, kill by port as last resort
  if (config?.url) {
    try {
      const url = new URL(config.url);
      const port = parseInt(url.port);
      if (port) {
        await new Promise((r) => setTimeout(r, 500));
        if (await isPortOpen(port)) {
          controlLog.info('STOP_PORT_FALLBACK', `Port ${port} still open, killing by port`);
          await killByPort(port, 'SIGKILL');
        }
      }
    } catch {}
  }

  controlLog.stopSuccess(name);
  delete processes[name];

  // Clean up PID file
  if (config) {
    const pidFile = path.join(LOG_DIR, `${config.log.replace('.log', '')}.pid`);
    try {
      if (fs.existsSync(pidFile)) {
        fs.unlinkSync(pidFile);
        controlLog.info('PID_FILE_CLEANUP', `Removed ${pidFile}`);
      }
    } catch {}
  }
}
