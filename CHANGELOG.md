# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.8] - 2026-01-19

### Changed

- Updated development dependencies
- Migrated Husky hooks to v10+ (no legacy sourcing)
- Fixed npm audit vulnerabilities
- Validated local project generation (minimal template)

## [1.0.7] - 2026-01-16

### Changed

- Updated development dependencies
  - @types/node from 25.0.3 to 25.0.6
  - typescript-eslint from 8.51.0 to 8.52.0
- Fixed all npm audit vulnerabilities

## [1.0.6] - 2026-01-05

### Changed

- Updated development dependencies
  - typescript-eslint from 8.50.1 to 8.51.0
  - globals from 16.5.0 to 17.0.0 (major version with new environments: audioWorklet, paintWorklet, sharedWorker, bunBuiltin, denoBuiltin)

## [1.0.5] - 2025-12-30

### Changed

- Updated development dependencies
  - typescript-eslint from 8.50.0 to 8.50.1

## [1.0.4] - 2025-12-22

### Changed

- Updated development dependencies
  - typescript-eslint from 8.49.0 to 8.50.0

## [1.0.3] - 2025-12-16

### Changed

- Updated development dependencies
  - @eslint/js from 9.39.1 to 9.39.2
  - eslint from 9.39.1 to 9.39.2
  - typescript-eslint from 8.48.1 to 8.49.0

## [1.0.2] - 2025-12-08

### Changed

- Updated development dependencies
  - prettier from 3.7.3 to 3.7.4
  - typescript-eslint from 8.18.0 to 8.48.1
  - typescript from 5.7.3 to 5.9.3
- Package maintenance and security updates

### Fixed

- Resolved Jest and ts-jest dependency compatibility issue

## [1.0.1] - 2025-12-02

### Changed

- Dev dependency: tsx replaces ts-node in generated projects
- Updated dev script to use tsx instead of ts-node

### Fixed

- Include package-lock.json in initial git commit
- Fix TypeScript ESM module error with nodemon by replacing ts-node with tsx

## [1.0.0] - 2025-12-02

### Added

- Prettier 3.7.3 for code formatting
- Husky 9.1.7 + lint-staged 16.2.7 for pre-commit hooks
- GitHub Actions v6 (checkout, setup-node)
- Publish workflow for GitHub Release-based npm publishing
- Issue and PR templates
- Dependabot configuration
- CONTRIBUTING.md guide
- Comprehensive README badges (CI, npm downloads, license)

### Changed

- Upgraded all dependencies to latest versions
- Removed semantic-release in favor of GitHub Release workflow
- Simplified CI workflow (removed matrix, added format check)
- Formatted all code with Prettier
- Improved package.json with format script, engines, and lint-staged config
- Cleaned up README and removed duplicates

### Fixed

- Fixed 15 security vulnerabilities by upgrading dependencies
