import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { detectPackageManager } from '../src/cli';

const tmpDir = path.join(os.tmpdir(), 'launchts-detect-pm-tests');

beforeEach(async () => {
  await fs.ensureDir(tmpDir);
  // Start each test from the temp dir with no lockfiles
  process.chdir(tmpDir);
});

afterEach(async () => {
  delete process.env.npm_config_user_agent;
  process.chdir(os.tmpdir());
  await fs.remove(tmpDir);
});

describe('detectPackageManager', () => {
  it('detects pnpm from npm_config_user_agent', () => {
    process.env.npm_config_user_agent =
      'pnpm/8.0.0 npm/? node/v20.0.0 linux x64';
    expect(detectPackageManager()).toBe('pnpm');
  });

  it('detects yarn from npm_config_user_agent', () => {
    process.env.npm_config_user_agent =
      'yarn/1.22.19 npm/? node/v20.0.0 linux x64';
    expect(detectPackageManager()).toBe('yarn');
  });

  it('detects npm from npm_config_user_agent', () => {
    process.env.npm_config_user_agent = 'npm/10.0.0 node/v20.0.0 linux x64';
    expect(detectPackageManager()).toBe('npm');
  });

  it('falls back to pnpm lockfile when no user agent', async () => {
    delete process.env.npm_config_user_agent;
    await fs.writeFile(path.join(tmpDir, 'pnpm-lock.yaml'), '');
    expect(detectPackageManager()).toBe('pnpm');
  });

  it('falls back to yarn lockfile when no user agent', async () => {
    delete process.env.npm_config_user_agent;
    await fs.writeFile(path.join(tmpDir, 'yarn.lock'), '');
    expect(detectPackageManager()).toBe('yarn');
  });

  it('falls back to npm lockfile when no user agent', async () => {
    delete process.env.npm_config_user_agent;
    await fs.writeFile(path.join(tmpDir, 'package-lock.json'), '{}');
    expect(detectPackageManager()).toBe('npm');
  });

  it('defaults to npm when no user agent and no lockfile', () => {
    delete process.env.npm_config_user_agent;
    expect(detectPackageManager()).toBe('npm');
  });
});
