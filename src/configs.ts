import type { ToolOptions } from './types';

/**
 * Default configuration when using --yes flag (all options enabled)
 */
export const YES_DEFAULTS: Omit<ToolOptions, 'yes' | 'default'> = {
  eslint: true,
  prettier: true,
  husky: true,
  nodemon: true,
  git: true,
  install: true,
};

/**
 * Default configuration when using --default flag (sensible defaults)
 */
export const DEFAULT_OPTIONS: Omit<ToolOptions, 'yes' | 'default'> = {
  eslint: false,
  prettier: true,
  husky: false,
  nodemon: false,
  git: true,
  install: true,
};

/**
 * Tool configurations for injection into generated projects
 * Note: deps will be populated from rootPkg in generator.ts
 */
export const TOOL_CONFIGS = {
  nodemon: {
    deps: ['nodemon', 'ts-node'],
    scripts: {
      dev: 'nodemon --watch src -e ts --exec "ts-node src/index.ts"',
    },
  },
  eslint: {
    deps: [
      'eslint',
      '@eslint/js',
      'typescript-eslint',
      'globals',
      'eslint-config-prettier',
    ],
    scripts: { lint: 'eslint .' },
    config: `import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
);
`,
  },
  prettier: {
    deps: ['prettier'],
    scripts: { format: 'prettier --write .' },
    config: {
      semi: true,
      singleQuote: true,
      trailingComma: 'all',
      printWidth: 80,
    },
  },
  husky: {
    deps: ['husky', 'lint-staged'],
    scripts: { prepare: 'husky install' },
    lintStaged: {
      '*.ts': ['eslint --fix', 'prettier --write'],
      '*.json': ['prettier --write'],
    },
    preCommitHook: `#!/bin/sh\n. $(dirname "$0")/_/husky.sh\nnpx lint-staged\n`,
  },
} as const;
