import { rmSync, mkdirSync } from 'node:fs';

rmSync('./dist', { recursive: true, force: true});
mkdirSync('./dist');
