import { NextRequest, NextResponse } from 'next/server';
import treeKill from 'tree-kill';
import path from 'path';
import fs from 'fs';
import { SERVICES } from '@/lib/types';
import { LOG_DIR } from '@/lib/paths';

// Helper to kill with timeout fallback
async function killWithTimeout(
  pid: number,
  timeoutMs: number
): Promise<{ timedOut: boolean; error?: Error }> {
  const { execa } = await import('execa');
  return new Promise((resolve) => {
    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        // Fallback: use direct process.kill and pkill for children
        try {
          process.kill(pid, 'SIGKILL');
        } catch {
          // Ignore - process may already be dead
        }
        // Also try to kill any children via pkill
        execa('pkill', ['-KILL', '-P', String(pid)]).catch(() => {});
        resolve({ timedOut: true });
      }
    }, timeoutMs);

    treeKill(pid, 'SIGKILL', (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve({ timedOut: false, error: err ?? undefined });
      }
    });
  });
}

export async function POST(request: NextRequest) {
  const { service } = await request.json();

  const config = SERVICES[service];
  if (!config) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  }

  const pidFile = path.join(LOG_DIR, `${config.log.replace('.log', '')}.pid`);

  let pid: number | undefined;
  if (fs.existsSync(pidFile)) {
    const filePid = parseInt(fs.readFileSync(pidFile, 'utf8').trim());
    if (!isNaN(filePid)) pid = filePid;
  }

  // Fallback: Check port if no PID file
  if (!pid && config.url) {
    try {
      const { execa } = await import('execa');
      const url = new URL(config.url);
      const port = parseInt(url.port);
      if (port) {
        const { stdout } = await execa('lsof', ['-ti', `:${port}`]);
        const portPid = parseInt(stdout.trim());
        if (!isNaN(portPid)) pid = portPid;
      }
    } catch {}
  }

  if (!pid) {
    return NextResponse.json({ error: 'Service not running (no PID found)' }, { status: 400 });
  }

  // Use timeout to prevent treeKill from hanging indefinitely
  const result = await killWithTimeout(pid, 3000);

  // Clean up PID file regardless of result
  try {
    if (fs.existsSync(pidFile)) fs.unlinkSync(pidFile);
  } catch {}

  if (result.error && (result.error as any).code !== 'ESRCH') {
    return NextResponse.json({ error: 'Failed to force kill process' }, { status: 500 });
  }
  return NextResponse.json({ success: true, message: `Force killed process ${pid}` });
}
