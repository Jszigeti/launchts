import { describe, it, expect, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { createProject, isValidProjectName } from '../src/generator';

const tmpRoot = path.join(os.tmpdir(), 'launchts-cli-tests');

afterEach(async () => {
  await fs.remove(tmpRoot);
});

describe('CLI integration', () => {
  it('validates project name via CLI validation', async () => {
    // Test that isValidProjectName is called and works
    expect(isValidProjectName('my-app')).toBe(true);
    expect(isValidProjectName('MyApp')).toBe(true);
    expect(isValidProjectName('my_app')).toBe(true);
    expect(isValidProjectName('my.app')).toBe(true);
    expect(isValidProjectName('my-app-123')).toBe(true);
  });

  it('rejects invalid project names in CLI', async () => {
    expect(isValidProjectName('')).toBe(false); // empty
    expect(isValidProjectName('-invalid')).toBe(false); // starts with dash
    expect(isValidProjectName('.invalid')).toBe(false); // starts with dot
    expect(isValidProjectName('invalid@name')).toBe(false); // invalid char
    expect(isValidProjectName('invalid name')).toBe(false); // space
    expect(isValidProjectName('a'.repeat(215))).toBe(false); // too long
  });

  it('creates a project with nodemon and eslint enabled', async () => {
    // Use a fresh tmp directory for this test
    const testTmpDir = path.join(tmpRoot, 'nodemon-eslint-test');
    await fs.ensureDir(testTmpDir);

    const projectName = 'test-app';
    const projectPath = path.join(testTmpDir, projectName);

    await createProject({
      name: projectPath, // Use full path directly
      options: {
        eslint: true,
        prettier: false,
        husky: false,
        nodemon: true,
        pm: 'npm',
        git: false,
        install: false,
      },
    });

    expect(await fs.pathExists(projectPath)).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, 'src', 'index.ts'))).toBe(
      true,
    );

    const pkg = JSON.parse(
      await fs.readFile(path.join(projectPath, 'package.json'), 'utf8'),
    );
    expect(pkg.devDependencies).toHaveProperty('eslint');
    expect(pkg.devDependencies).toHaveProperty('nodemon');
    expect(pkg.scripts).toHaveProperty('lint');
    expect(pkg.scripts).toHaveProperty('dev');
  });
});
