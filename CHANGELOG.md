# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4] - 2025-12-22

### Changed

- Updated production dependencies
  - `fs-extra` from 11.3.2 to 11.3.3
- Updated development dependencies
  - `@types/node` from 25.0.2 to 25.0.3
  - `typescript-eslint` from 8.49.0 to 8.50.0
  - `vitest` updated to latest

## [1.0.3] - 2025-12-15

### Changed

- Updated development dependencies
  - `@eslint/js` from 9.39.1 to 9.39.2
  - `eslint` from 9.39.1 to 9.39.2
  - `typescript-eslint` from 8.48.1 to 8.49.0
  - `@types/node` from 24.10.1 to 25.0.2

## [1.0.2] - 2025-12-08

### Changed

- Updated dev dependencies via Dependabot
  - `eslint-config-prettier` from 9.1.2 to 10.1.8
  - `husky` from 8.0.3 to 9.1.7
  - Development dependencies group updates

## [1.0.1] - 2025-12-02

### Fixed

- Include `package-lock.json` in initial git commit
- Fix TypeScript ESM module error with nodemon by replacing `ts-node` with `tsx`

### Changed

- Dev dependency: `tsx` replaces `ts-node` in generated projects
- Updated dev script to use `tsx` instead of `ts-node`

## [1.0.0] - 2025-12-01

### Added

- **Interactive CLI** with prompts for tool selection
- **Quick modes**: `--yes` (all tools) and `--default` (sensible defaults)
- **Modern TypeScript config**: ESNext target, NodeNext modules with ESM
- **Tool integrations**:
  - ESLint with flat config (modern, non-deprecated)
  - TypeScript ESLint v8+ (unified `typescript-eslint` package)
  - Prettier with latest defaults (trailingComma: "all", printWidth: 80)
  - Husky pre-commit hooks with lint-staged
  - nodemon for dev auto-reload
- **Auto-generated README.md**: Adapts to selected tools with usage instructions
- **Git initialization** with optional first commit
- **Package manager detection**: npm, yarn, pnpm
- **Comprehensive test suite**: 39 tests with Vitest (unit, integration, e2e, messages)
- **Complete documentation**: README and CONTRIBUTING guides
- **CI/CD workflows**: GitHub Actions for quality checks and publishing
- **Dynamic version resolution**: No hardcoded dependency versions
- **Centralized messages**: All user-facing messages in `src/messages.ts` for maintainability

## [1.0.0] - 2025-12-01

### Added

- **Interactive CLI** with prompts for tool selection
- **Quick modes**: `--yes` (all tools) and `--default` (sensible defaults)
- **Modern TypeScript config**: ESNext target, NodeNext modules with ESM
- **Tool integrations**:
  - ESLint with flat config (modern, non-deprecated)
  - TypeScript ESLint v8+ (unified `typescript-eslint` package)
  - Prettier with latest defaults (trailingComma: "all", printWidth: 80)
  - Husky pre-commit hooks with lint-staged
  - nodemon for dev auto-reload
- **Auto-generated README.md**: Adapts to selected tools with usage instructions
- **Git initialization** with optional first commit
- **Package manager detection**: npm, yarn, pnpm
- **Comprehensive test suite**: 39 tests with Vitest (unit, integration, e2e, messages)
- **Complete documentation**: README and CONTRIBUTING guides
- **CI/CD workflows**: GitHub Actions for quality checks and publishing
- **Dynamic version resolution**: No hardcoded dependency versions
- **Centralized messages**: All user-facing messages in `src/messages.ts` for maintainability

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2025-12-08

### Changed

- Updated dev dependencies via Dependabot
  - `eslint-config-prettier` from 9.1.2 to 10.1.8
  - `husky` from 8.0.3 to 9.1.7
  - Development dependencies group updates

## [1.0.1] - 2025-12-02

### Fixed

- Include `package-lock.json` in initial git commit
- Fix TypeScript ESM module error with nodemon by replacing `ts-node` with `tsx`

### Changed

- Dev dependency: `tsx` replaces `ts-node` in generated projects
- Updated dev script to use `tsx` instead of `ts-node`

## [1.0.0] - 2025-12-01

### Added

- **Interactive CLI** with prompts for tool selection
- **Quick modes**: `--yes` (all tools) and `--default` (sensible defaults)
- **Modern TypeScript config**: ESNext target, NodeNext modules with ESM
- **Tool integrations**:
  - ESLint with flat config (modern, non-deprecated)
  - TypeScript ESLint v8+ (unified `typescript-eslint` package)
  - Prettier with latest defaults (trailingComma: "all", printWidth: 80)
  - Husky pre-commit hooks with lint-staged
  - nodemon for dev auto-reload
- **Auto-generated README.md**: Adapts to selected tools with usage instructions
- **Git initialization** with optional first commit
- **Package manager detection**: npm, yarn, pnpm
- **Comprehensive test suite**: 39 tests with Vitest (unit, integration, e2e, messages)
- **Complete documentation**: README and CONTRIBUTING guides
- **CI/CD workflows**: GitHub Actions for quality checks and publishing
- **Dynamic version resolution**: No hardcoded dependency versions
- **Centralized messages**: All user-facing messages in `src/messages.ts` for maintainability

### Features

- Project scaffolding with configurable options
- Smart defaults for rapid prototyping
- Auto-format and lint staged files before commits
- Type-safe configuration with strict TypeScript
- Cross-platform support (Windows, macOS, Linux)
- Parallel file I/O for optimal performance
- Silent mode for check commands (no false error logs)

### Developer Experience

- Zero configuration needed to start
- Sensible defaults that just work
- Clear error messages and helpful tips
- Fully tested and production-ready
- Modern tooling and best practices (2024-2025)

### Code Quality

- **Modular architecture**: README generation split into 6 focused functions
- **Type safety**: Strict TypeScript with no implicit `any` types
- **Performance optimized**: Parallel I/O operations (Promise.all)
- **Clean codebase**: No dead code, all imports used
- **Comprehensive testing**: Unit tests for messages, E2E workflows, edge cases

[1.0.0]: https://github.com/Jszigeti/launchts/releases/tag/v1.0.0
