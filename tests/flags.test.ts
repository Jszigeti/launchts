import { describe, it, expect, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { createProject } from '../src/generator';

const tmpRoot = path.join(os.tmpdir(), 'launchts-flags-tests');

afterEach(async () => {
  await fs.remove(tmpRoot);
});

describe('Flag options', () => {
  it('respects --default flag (prettier only, no eslint/husky/nodemon)', async () => {
    const name = path.join(tmpRoot, 'project-default');
    await createProject({
      name,
      options: {
        useDefaults: true,
        eslint: false,
        prettier: true,
        husky: false,
        nodemon: false,
        pm: 'npm',
        git: true,
        install: false,
      },
    });

    const pkg = await fs.readJSON(path.join(name, 'package.json'));
    expect(pkg.devDependencies).toHaveProperty('prettier');
    expect(pkg.devDependencies).not.toHaveProperty('eslint');
    expect(pkg.devDependencies).not.toHaveProperty('husky');
    expect(pkg.devDependencies).not.toHaveProperty('nodemon');
    expect(pkg.scripts).toHaveProperty('format');
  });

  it('respects --yes flag (all options enabled)', async () => {
    const name = path.join(tmpRoot, 'project-yes');
    await createProject({
      name,
      options: {
        yes: true,
        eslint: true,
        prettier: true,
        husky: true,
        nodemon: true,
        pm: 'npm',
        git: true,
        install: false,
      },
    });

    const pkg = await fs.readJSON(path.join(name, 'package.json'));
    expect(pkg.devDependencies).toHaveProperty('prettier');
    expect(pkg.devDependencies).toHaveProperty('eslint');
    expect(pkg.devDependencies).toHaveProperty('husky');
    expect(pkg.devDependencies).toHaveProperty('nodemon');
  });

  it('respects --no-commit flag (git init but no commit)', async () => {
    const name = path.join(tmpRoot, 'project-no-commit');
    await createProject({
      name,
      options: {
        pm: 'npm',
        git: true,
        noCommit: true,
        install: false,
      },
    });

    // .gitignore should exist (git init was done)
    expect(await fs.pathExists(path.join(name, '.gitignore'))).toBe(true);
    // .git folder should exist (git init was done)
    expect(await fs.pathExists(path.join(name, '.git'))).toBe(true);
  });

  it('respects --verbose flag', async () => {
    const name = path.join(tmpRoot, 'project-verbose');
    // verbose doesn't affect file output, just stdio, so we just check it doesn't crash
    await createProject({
      name,
      options: {
        pm: 'npm',
        git: false,
        install: false,
        verbose: true,
      },
    });

    expect(await fs.pathExists(path.join(name, 'package.json'))).toBe(true);
  });

  it('validates package manager option', async () => {
    const name = path.join(tmpRoot, 'project-pm-validation');

    // Valid package managers should work
    await createProject({
      name: path.join(name, 'npm-test'),
      options: { pm: 'npm', install: false },
    });
    expect(
      await fs.pathExists(path.join(name, 'npm-test', 'package.json')),
    ).toBe(true);

    await createProject({
      name: path.join(name, 'yarn-test'),
      options: { pm: 'yarn', install: false },
    });
    expect(
      await fs.pathExists(path.join(name, 'yarn-test', 'package.json')),
    ).toBe(true);

    await createProject({
      name: path.join(name, 'pnpm-test'),
      options: { pm: 'pnpm', install: false },
    });
    expect(
      await fs.pathExists(path.join(name, 'pnpm-test', 'package.json')),
    ).toBe(true);
  });

  it('handles git disabled correctly', async () => {
    const name = path.join(tmpRoot, 'project-no-git');
    await createProject({
      name,
      options: {
        pm: 'npm',
        git: false,
        install: false,
      },
    });

    // .gitignore should NOT exist when git is disabled
    expect(await fs.pathExists(path.join(name, '.gitignore'))).toBe(false);
    expect(await fs.pathExists(path.join(name, '.git'))).toBe(false);
  });

  it('handles install disabled correctly', async () => {
    const name = path.join(tmpRoot, 'project-no-install');
    await createProject({
      name,
      options: {
        pm: 'npm',
        prettier: true,
        install: false,
      },
    });

    const pkg = await fs.readJSON(path.join(name, 'package.json'));
    expect(pkg.devDependencies).toHaveProperty('prettier');
    // node_modules should not exist since install was skipped
    expect(await fs.pathExists(path.join(name, 'node_modules'))).toBe(false);
  });
});
