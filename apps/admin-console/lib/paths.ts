import path from 'path';

// Resolve repo root relative to this project: software/internal/console -> ../../../
export const ROOT_DIR = path.resolve(process.cwd(), '../../..');
export const LOG_DIR = path.join(ROOT_DIR, 'software/logs');
export const START_SCRIPT = path.join(ROOT_DIR, 'software/scripts/start-dev.sh');
