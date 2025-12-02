# launchts

[![npm version](https://img.shields.io/npm/v/launchts.svg)](https://www.npmjs.com/package/launchts)
[![npm downloads](https://img.shields.io/npm/dm/launchts.svg)](https://www.npmjs.com/package/launchts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/Jszigeti/launchts/actions/workflows/ci.yml/badge.svg)](https://github.com/Jszigeti/launchts/actions/workflows/ci.yml)

**Fast, interactive CLI to scaffold production-ready TypeScript projects.**

Inspired by Vite's developer experience, `launchts` gets you from zero to coding in seconds with optional tooling, sensible defaults, and zero configuration.

---

## Quick Start

```bash
# Interactive mode (recommended)
npx launchts my-app

# Skip all prompts with sensible defaults
npx launchts my-app --default

# Enable everything instantly
npx launchts my-app --yes
```

That's it! Your TypeScript project is ready. Run `cd my-app && npm run dev` to start coding.

---

## Features

- **Zero Config** — Start coding immediately with TypeScript configured
- **Interactive Prompts** — Choose what you need (ESLint, Prettier, Husky, nodemon)
- **Smart Detection** — Auto-detects your package manager (npm/yarn/pnpm)
- **Optional Tooling** — Add linting, formatting, and git hooks on demand
- **Git Ready** — Optional git initialization with first commit
- **Battle Tested** — Comprehensive test suite with 39 passing tests

---

## Usage

### Interactive Mode

Simply run the command and answer the prompts:

```bash
npx launchts my-project
```

You'll be asked about:

- **ESLint** — TypeScript linting with recommended rules
- **Prettier** — Code formatting with opinionated defaults
- **Husky** — Pre-commit hooks with lint-staged
- **nodemon** — Auto-reload dev script with ts-node
- **Git** — Initialize repository with .gitignore
- **Install** — Run `npm install` automatically

### Quick Modes

**Use sensible defaults** (Prettier only, git + install):

```bash
npx launchts my-app --default
# or
npx launchts my-app -d
```

**Enable everything** (all tools: ESLint + Prettier + Husky + nodemon + git + install):

```bash
npx launchts my-app --yes
# or
npx launchts my-app -y
```

### Custom Configuration

Mix and match options for your perfect setup:

```bash
# Minimal: just TypeScript
npx launchts my-app --no-git --no-install

# Linting only
npx launchts my-app --eslint --prettier

# Full stack with specific package manager
npx launchts my-app --eslint --prettier --husky --nodemon --pm pnpm

# Git without initial commit
npx launchts my-app --git --no-commit
```

---

## CLI Options

### Flags

| Flag           | Alias | Description                                                          | Default     |
| -------------- | ----- | -------------------------------------------------------------------- | ----------- |
| `--yes`        | `-y`  | Enable all tools (ESLint + Prettier + Husky + nodemon), skip prompts | `false`     |
| `--default`    | `-d`  | Use sensible defaults (Prettier only), skip prompts                  | `false`     |
| `--eslint`     |       | Add ESLint with TypeScript config                                    | interactive |
| `--prettier`   |       | Add Prettier code formatter                                          | interactive |
| `--husky`      |       | Add Husky pre-commit hooks                                           | interactive |
| `--nodemon`    |       | Add nodemon dev script                                               | interactive |
| `--git`        |       | Initialize git repository                                            | `true`\*    |
| `--no-git`     |       | Skip git initialization                                              |             |
| `--install`    |       | Install dependencies                                                 | `true`\*    |
| `--no-install` |       | Skip dependency installation                                         |             |
| `--no-commit`  |       | Skip initial git commit (when git enabled)                           | `false`     |
| `--pm <name>`  |       | Package manager: npm, yarn, or pnpm                                  | auto-detect |
| `--verbose`    |       | Show detailed command output                                         | `false`     |

\* _In interactive mode, you'll be asked. In non-interactive mode (`--yes`/`--default`), defaults to `true`._

### Package Manager

The CLI auto-detects your package manager based on:

1. The `npm_config_user_agent` environment variable
2. Lockfiles in the current directory (`pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`)
3. Falls back to `npm`

Override detection:

```bash
npx launchts my-app --pm yarn
npx launchts my-app --pm pnpm
```

---

## What You Get

### Base Project Structure

Every project includes:

```
my-app/
├── src/
│   └── index.ts          # Entry point with "Hello TypeScript"
├── package.json          # With scripts and metadata
├── tsconfig.json         # Sensible TypeScript config (ESNext, strict)
└── .gitignore            # (if --git) Ignores node_modules, dist, .env
```

**Scripts included:**

- `npm run build` — Compile TypeScript to `dist/`
- `npm start` — Run compiled code from `dist/index.js`

### With ESLint (`--eslint`)

Adds TypeScript linting with best practices:

```
my-app/
├── eslint.config.js      # Modern flat config with TypeScript support
└── package.json          # + eslint dependencies
```

**Additional scripts:**

- `npm run lint` — Check for linting errors

**Packages:**

- `eslint`
- `@eslint/js`
- `typescript-eslint` (unified package)
- `globals`
- `eslint-config-prettier` (if Prettier also enabled)

### With Prettier (`--prettier`)

Adds code formatting with opinionated defaults:

```
my-app/
├── .prettierrc           # Config: semi, singleQuote, trailingComma
└── package.json          # + prettier dependency
```

**Additional scripts:**

- `npm run format` — Format all files

**Configuration:**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 80
}
```

### With Husky (`--husky`)

Adds Git hooks for quality control:

```
my-app/
├── .husky/
│   └── pre-commit        # Runs lint-staged before commits
└── package.json          # + husky, lint-staged config
```

**Additional scripts:**

- `npm run prepare` — Install Git hooks

**Behavior:**

- Automatically runs `eslint --fix` and `prettier --write` on staged `.ts` files
- Formats staged `.json` files with Prettier

### With nodemon (`--nodemon`)

Adds development auto-reload:

**Additional scripts:**

- `npm run dev` — Watch `src/` and auto-restart on changes

**Packages:**

- `nodemon`
- `ts-node`

---

## Requirements

- **Node.js** 18.0.0 or higher
- **npm** 7+ (or **yarn** 1.22+, **pnpm** 7+)

---

## Examples

### Minimal TypeScript Project

```bash
npx launchts my-app --no-git --no-install
cd my-app
npm install
npm run build
npm start
```

### Full Stack with Code Quality

```bash
npx launchts my-api --eslint --prettier --husky --nodemon
cd my-api
npm run dev  # Start coding with auto-reload
```

### Quick Prototype

```bash
npx launchts prototype -y
cd prototype
npm run dev
```

### Monorepo Package

```bash
cd my-monorepo/packages
npx launchts new-package --no-git --pm pnpm
```

---

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## License

MIT © [Jonas](https://github.com/Jszigeti)

---

## Issues & Support

- **Bug reports:** [Open an issue](https://github.com/Jszigeti/launchts/issues)
- **Questions:** [GitHub Discussions](https://github.com/Jszigeti/launchts/discussions)
- **Star the repo** if you find it useful!

---

**Made with ❤️ for the TypeScript community**
