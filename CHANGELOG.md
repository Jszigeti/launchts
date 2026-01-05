# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.6] - 2026-01-05

### Changed

- Updated development dependencies
  - `typescript-eslint` from 8.50.1 to 8.51.0
  - `globals` from 16.5.0 to 17.0.0 (major version with new environments: audioWorklet, paintWorklet, sharedWorker, bunBuiltin, denoBuiltin)

## [1.0.5] - 2025-12-30

### Changed

- Updated development dependencies
  - `typescript-eslint` from 8.50.0 to 8.50.1

## [1.0.4] - 2025-12-22

### Changed

- Updated development dependencies
  - `typescript-eslint` from 8.49.0 to 8.50.0
  - `vitest` from 4.0.5 to 4.0.14
  - `@types/node` from 24.10.1 to 25.0.3
  - `fs-extra` from 11.3.2 to 11.3.3

## [1.0.3] - 2025-12-16

### Changed

- Updated development dependencies
  - `@eslint/js` from 9.39.1 to 9.39.2
  - `eslint` from 9.39.1 to 9.39.2
  - `typescript-eslint` from 8.48.1 to 8.49.0

## [1.0.2] - 2025-12-08

### Changed

- Updated development dependencies
  - `prettier` from 3.7.3 to 3.7.4
  - `typescript-eslint` from 8.18.0 to 8.48.1
  - `typescript` from 5.7.3 to 5.9.3
- Package maintenance and security updates

## [1.0.1] - 2025-12-02

### Fixed

- Include `package-lock.json` in initial git commit
- Fix TypeScript ESM module error with nodemon by replacing `ts-node` with `tsx`

## [1.0.0] - 2025-12-01

### Added

- Initial release
- Interactive CLI for TypeScript project scaffolding
- Support for npm, yarn, pnpm, and bun
- Optional ESLint and Prettier configuration
- Optional Husky and lint-staged setup
- Optional nodemon for development
- Optional git initialization
- TypeScript 5.7+ with modern ESM configuration
