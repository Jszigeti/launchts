import { describe, it, expect, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { createProject } from '../src/generator';

const tmpRoot = path.join(os.tmpdir(), 'launchts-e2e-tests');

afterEach(async () => {
  await fs.remove(tmpRoot);
});

describe('End-to-End Workflows', () => {
  it('creates a complete full-stack project with all features', async () => {
    const projectPath = path.join(tmpRoot, 'fullstack-app');

    // Create project with all options enabled
    await createProject({
      name: projectPath,
      options: {
        eslint: true,
        prettier: true,
        husky: true,
        nodemon: true,
        pm: 'npm',
        git: true,
        install: false, // Skip install for speed
        noCommit: false,
      },
    });

    // Verify all files were created
    expect(await fs.pathExists(projectPath)).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, 'package.json'))).toBe(
      true,
    );
    expect(await fs.pathExists(path.join(projectPath, 'tsconfig.json'))).toBe(
      true,
    );
    expect(await fs.pathExists(path.join(projectPath, 'src', 'index.ts'))).toBe(
      true,
    );
    expect(await fs.pathExists(path.join(projectPath, 'README.md'))).toBe(true);

    // Verify ESLint flat config
    expect(
      await fs.pathExists(path.join(projectPath, 'eslint.config.js')),
    ).toBe(true);
    const eslintConfig = await fs.readFile(
      path.join(projectPath, 'eslint.config.js'),
      'utf8',
    );
    expect(eslintConfig).toContain('typescript-eslint');
    expect(eslintConfig).toContain('@eslint/js');

    // Verify Prettier config
    expect(await fs.pathExists(path.join(projectPath, '.prettierrc'))).toBe(
      true,
    );
    const prettierConfig = await fs.readJSON(
      path.join(projectPath, '.prettierrc'),
    );
    expect(prettierConfig).toHaveProperty('semi', true);
    expect(prettierConfig).toHaveProperty('singleQuote', true);
    expect(prettierConfig).toHaveProperty('trailingComma', 'all');
    expect(prettierConfig).toHaveProperty('printWidth', 80);

    // Verify Husky setup
    expect(
      await fs.pathExists(path.join(projectPath, '.husky', 'pre-commit')),
    ).toBe(true);

    // Verify Git repository
    expect(await fs.pathExists(path.join(projectPath, '.git'))).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, '.gitignore'))).toBe(
      true,
    );
    const gitignore = await fs.readFile(
      path.join(projectPath, '.gitignore'),
      'utf8',
    );
    expect(gitignore).toContain('node_modules');
    expect(gitignore).toContain('dist');

    // Verify package.json has all expected scripts and dependencies
    const pkg = await fs.readJSON(path.join(projectPath, 'package.json'));
    expect(pkg.name).toBe('fullstack-app');
    expect(pkg.type).toBe('module');
    expect(pkg.scripts).toHaveProperty('build');
    expect(pkg.scripts).toHaveProperty('dev');
    expect(pkg.scripts).toHaveProperty('lint');
    expect(pkg.scripts).toHaveProperty('format');
    expect(pkg.scripts).toHaveProperty('prepare');
    expect(pkg.devDependencies).toHaveProperty('typescript');
    expect(pkg.devDependencies).toHaveProperty('eslint');
    expect(pkg.devDependencies).toHaveProperty('prettier');
    expect(pkg.devDependencies).toHaveProperty('husky');
    expect(pkg.devDependencies).toHaveProperty('nodemon');
    expect(pkg['lint-staged']).toBeDefined();

    // Verify README content is comprehensive
    const readme = await fs.readFile(
      path.join(projectPath, 'README.md'),
      'utf8',
    );
    expect(readme).toContain('# fullstack-app');
    expect(readme).toContain('ESLint');
    expect(readme).toContain('Prettier');
    expect(readme).toContain('Nodemon');
    expect(readme).toContain('Husky');
    expect(readme).toContain('npm run build');
    expect(readme).toContain('npm run dev');
    expect(readme).toContain('npm run lint');
    expect(readme).toContain('npm run format');
    expect(readme).toContain('eslint.config.js');
    expect(readme).toContain('.prettierrc');

    // Verify TypeScript config is modern
    const tsconfig = await fs.readJSON(path.join(projectPath, 'tsconfig.json'));
    expect(tsconfig.compilerOptions.target).toBe('ESNext');
    expect(tsconfig.compilerOptions.module).toBe('NodeNext');
    expect(tsconfig.compilerOptions.moduleResolution).toBe('NodeNext');
    expect(tsconfig.compilerOptions.strict).toBe(true);
  }, 10000);

  it('creates a minimal project without any tooling', async () => {
    const projectPath = path.join(tmpRoot, 'minimal-project');

    await createProject({
      name: projectPath,
      options: {
        eslint: false,
        prettier: false,
        husky: false,
        nodemon: false,
        pm: 'npm',
        git: false,
        install: false,
      },
    });

    // Verify only essential files exist
    expect(await fs.pathExists(projectPath)).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, 'package.json'))).toBe(
      true,
    );
    expect(await fs.pathExists(path.join(projectPath, 'tsconfig.json'))).toBe(
      true,
    );
    expect(await fs.pathExists(path.join(projectPath, 'src', 'index.ts'))).toBe(
      true,
    );
    expect(await fs.pathExists(path.join(projectPath, 'README.md'))).toBe(true);

    // Verify tooling files do NOT exist
    expect(
      await fs.pathExists(path.join(projectPath, 'eslint.config.js')),
    ).toBe(false);
    expect(await fs.pathExists(path.join(projectPath, '.prettierrc'))).toBe(
      false,
    );
    expect(await fs.pathExists(path.join(projectPath, '.husky'))).toBe(false);
    expect(await fs.pathExists(path.join(projectPath, '.git'))).toBe(false);
    expect(await fs.pathExists(path.join(projectPath, '.gitignore'))).toBe(
      false,
    );

    // Verify package.json is minimal
    const pkg = await fs.readJSON(path.join(projectPath, 'package.json'));
    expect(pkg.scripts).toEqual({ build: 'tsc -p tsconfig.json' });
    expect(pkg.devDependencies).toEqual({ typescript: expect.any(String) });

    // Verify README is minimal
    const readme = await fs.readFile(
      path.join(projectPath, 'README.md'),
      'utf8',
    );
    expect(readme).toContain('# minimal-project');
    expect(readme).not.toContain('ESLint');
    expect(readme).not.toContain('Prettier');
    expect(readme).not.toContain('Husky');
    expect(readme).not.toContain('nodemon');
  });
});
