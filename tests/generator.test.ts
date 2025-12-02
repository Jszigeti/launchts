import { describe, it, expect, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { createProject } from '../src/generator';

const tmpDir = path.join(os.tmpdir(), 'launchts-test');

afterEach(async () => {
  await fs.remove(tmpDir);
});

describe('createProject', () => {
  it('creates a minimal project', async () => {
    await createProject({ name: tmpDir, options: { yes: true } });
    const exists = await fs.pathExists(path.join(tmpDir, 'package.json'));
    expect(exists).toBe(true);
  });
});
