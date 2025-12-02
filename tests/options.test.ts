import { describe, it, expect, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { createProject } from '../src/generator';

const tmpRoot = path.join(os.tmpdir(), 'launchts-tests');

afterEach(async () => {
  await fs.remove(tmpRoot);
});

describe('createProject options', () => {
  it('injects ESLint and Prettier configs and scripts', async () => {
    const name = path.join(tmpRoot, 'project-eslint-prettier');
    await createProject({
      name,
      options: {
        eslint: true,
        prettier: true,
        husky: false,
        nodemon: false,
        pm: 'npm',
        install: false,
      },
    });

    const pkg = await fs.readJSON(path.join(name, 'package.json'));
    expect(pkg.scripts).toHaveProperty('lint');
    expect(pkg.scripts).toHaveProperty('format');

    // files
    expect(await fs.pathExists(path.join(name, 'eslint.config.js'))).toBe(true);
    expect(await fs.pathExists(path.join(name, '.prettierrc'))).toBe(true);
  });

  it('injects husky and lint-staged and creates hook', async () => {
    const name = path.join(tmpRoot, 'project-husky');
    await createProject({
      name,
      options: {
        eslint: true,
        prettier: true,
        husky: true,
        nodemon: false,
        pm: 'npm',
        install: false,
      },
    });

    const pkg = await fs.readJSON(path.join(name, 'package.json'));
    expect(pkg.scripts).toHaveProperty('prepare');
    expect(pkg['lint-staged']).toBeDefined();
    expect(pkg['lint-staged']['*.ts']).toBeDefined();
    expect(pkg['lint-staged']['*.json']).toBeDefined();
    expect(await fs.pathExists(path.join(name, '.husky', 'pre-commit'))).toBe(
      true,
    );
  });

  it('adds nodemon dev script when requested', async () => {
    const name = path.join(tmpRoot, 'project-nodemon');
    await createProject({
      name,
      options: { nodemon: true, pm: 'npm', install: false },
    });

    const pkg = await fs.readJSON(path.join(name, 'package.json'));
    expect(pkg.scripts).toHaveProperty('dev');
    expect(pkg.devDependencies).toHaveProperty('nodemon');
  });

  it('creates .gitignore when git option is enabled', async () => {
    const name = path.join(tmpRoot, 'project-git');
    await createProject({
      name,
      options: { git: true, pm: 'npm', install: false },
    });

    // .gitignore should exist
    expect(await fs.pathExists(path.join(name, '.gitignore'))).toBe(true);
    const gitignore = await fs.readFile(path.join(name, '.gitignore'), 'utf8');
    expect(gitignore).toContain('node_modules');
    expect(gitignore).toContain('dist');
  });

  it('creates project without tooling options', async () => {
    const name = path.join(tmpRoot, 'project-minimal-clean');
    await createProject({
      name,
      options: { pm: 'npm', install: false },
    });

    const pkg = await fs.readJSON(path.join(name, 'package.json'));
    expect(pkg.scripts).toEqual({ build: 'tsc -p tsconfig.json' });
    expect(pkg.devDependencies).toEqual({ typescript: expect.any(String) });
  });

  it('includes correct TypeScript config', async () => {
    const name = path.join(tmpRoot, 'project-tsconfig');
    await createProject({ name, options: { pm: 'npm', install: false } });

    const tsconfig = await fs.readJSON(path.join(name, 'tsconfig.json'));
    expect(tsconfig.compilerOptions).toHaveProperty('target');
    expect(tsconfig.compilerOptions.target).toBe('ESNext');
    expect(tsconfig.compilerOptions.module).toBe('NodeNext');
    expect(tsconfig.compilerOptions.strict).toBe(true);
  });

  it('combines multiple options correctly', async () => {
    const name = path.join(tmpRoot, 'project-full');
    await createProject({
      name,
      options: {
        eslint: true,
        prettier: true,
        husky: true,
        nodemon: true,
        pm: 'npm',
        install: false,
      },
    });

    const pkg = await fs.readJSON(path.join(name, 'package.json'));
    expect(pkg.scripts).toHaveProperty('lint');
    expect(pkg.scripts).toHaveProperty('format');
    expect(pkg.scripts).toHaveProperty('dev');
    expect(pkg.scripts).toHaveProperty('prepare');
    expect(pkg.devDependencies).toHaveProperty('eslint');
    expect(pkg.devDependencies).toHaveProperty('prettier');
    expect(pkg.devDependencies).toHaveProperty('husky');
    expect(pkg.devDependencies).toHaveProperty('nodemon');
  }, 10000);
});
