import { describe, it, expect, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { createProject } from '../src/generator';

const tmpDir = path.join(os.tmpdir(), 'launchts-error-test');

afterEach(async () => {
  await fs.remove(tmpDir);
});

describe('createProject errors', () => {
  it('throws if target folder already exists', async () => {
    // Ensure the directory exists first
    await fs.ensureDir(tmpDir);

    let threw = false;
    try {
      await createProject({ name: tmpDir, options: { yes: true } });
    } catch (_e) {
      threw = true;
    }
    expect(threw).toBe(true);
  });
});
