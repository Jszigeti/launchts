# Contributing to launchts

Thank you for your interest in contributing!

## Quick Start

1. **Fork and clone** the repository:

   ```bash
   git clone https://github.com/Jszigeti/launchts.git
   cd launchts
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run tests:**

   ```bash
   npm test
   ```

4. **Try the CLI locally:**
   ```bash
   npm run dev -- my-test-project
   # or build and link
   npm run build
   npm link
   launchts my-test-project
   ```

---

## Development Workflow

### Project Structure

```
src/
├── cli.ts           # CLI entry point, command parsing, prompts
├── generator.ts     # Core project generation logic
├── configs.ts       # Tool configurations (ESLint, Prettier, etc.)
├── messages.ts      # Centralized user-facing messages
└── types.ts         # TypeScript type definitions

tests/
├── cli.integration.test.ts    # CLI integration tests
├── flags.test.ts              # Flag parsing tests
├── generator.test.ts          # Generator unit tests
├── generator.error.test.ts    # Error handling tests
├── options.test.ts            # Tool injection tests
└── validation.test.ts         # Input validation tests
```

### Available Scripts

| Command             | Description                   |
| ------------------- | ----------------------------- |
| `npm run build`     | Compile TypeScript to `dist/` |
| `npm run dev`       | Run CLI directly with ts-node |
| `npm test`          | Run tests in watch mode       |
| `npm test -- --run` | Run tests once (CI mode)      |
| `npm run lint`      | Check for linting errors      |
| `npm run format`    | Format code with Prettier     |

---

## Testing Guidelines

### Writing Tests

All new features **must** include tests. We use [Vitest](https://vitest.dev/) for testing.

**Test categories:**

- **Unit tests** — Test individual functions in isolation
- **Integration tests** — Test CLI flows end-to-end
- **Error tests** — Verify error handling and edge cases

**Example test:**

```typescript
import { describe, it, expect } from 'vitest';
import { createProject } from '../src/generator';

describe('myFeature', () => {
  it('should do something specific', async () => {
    // Arrange
    const options = { name: 'test-project' };

    // Act
    await createProject(options);

    // Assert
    expect(result).toBe(expected);
  });
});
```

### Running Tests

```bash
# Watch mode (default)
npm test

# Run once (CI)
npm test -- --run

# Run specific test file
npm test -- generator.test.ts

# Run with coverage
npm test -- --coverage
```

---

## Code Style

We use **ESLint** and **Prettier** to maintain consistent code style.

### Before Committing

Run these commands to ensure your code passes CI:

```bash
npm run lint      # Check for linting errors
npm run format    # Auto-format code
npm test -- --run # Run all tests
```

### Pre-commit Hooks

If you have Husky installed, these checks run automatically on commit. If not:

```bash
npm run prepare  # Install Git hooks
```

### Style Guidelines

- **TypeScript:** Strict mode enabled, no `any` types
- **Imports:** Use absolute paths from `src/`
- **Functions:** Prefer named exports
- **Comments:** Use JSDoc for public APIs
- **Errors:** Use descriptive error messages with actionable tips

---

## Contribution Ideas

### Good First Issues

Look for issues labeled [`good first issue`](https://github.com/Jszigeti/launchts/labels/good%20first%20issue) — these are great for newcomers!

### Areas to Improve

- **New tools:** Add support for more dev tools (Jest, Vitest, etc.)
- **Templates:** Add project templates (Express, CLI, library)
- **Config options:** Expose more customization options
- **Documentation:** Improve examples, add tutorials
- **Performance:** Optimize file I/O, parallel operations
- **Error messages:** Better error handling with helpful tips

---

## Pull Request Process

1. **Create a branch:**

   ```bash
   git checkout -b feature/my-awesome-feature
   ```

2. **Make your changes:**
   - Write code
   - Add/update tests
   - Update documentation if needed

3. **Verify everything works:**

   ```bash
   npm run lint
   npm run format
   npm test -- --run
   npm run build
   ```

4. **Commit with a clear message:**

   ```bash
   git commit -m "feat: add support for Jest"
   ```

   Use [conventional commits](https://www.conventionalcommits.org/):
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `test:` Test changes
   - `refactor:` Code refactoring
   - `chore:` Maintenance tasks

5. **Push and create PR:**

   ```bash
   git push origin feature/my-awesome-feature
   ```

   Then open a Pull Request on GitHub with:
   - Clear description of changes
   - Link to related issues
   - Screenshots/examples if applicable

6. **Respond to feedback:**
   - Address review comments
   - Keep the PR focused and small

---

## Reporting Bugs

Found a bug? [Open an issue](https://github.com/Jszigeti/launchts/issues/new) with:

- **Title:** Clear, descriptive summary
- **Description:** What happened vs. what you expected
- **Steps to reproduce:** Minimal example to trigger the bug
- **Environment:** Node version, OS, package manager
- **Logs:** Any error messages or stack traces

**Example:**

```markdown
**Bug:** ESLint config not created when using --eslint

**Steps:**

1. Run `npx launchts my-app --eslint`
2. Check for `.eslintrc.json`

**Expected:** `.eslintrc.json` should exist
**Actual:** File is missing

**Environment:**

- Node: v20.10.0
- npm: 10.2.3
- OS: macOS 14.1
```

---

## Feature Requests

Have an idea? [Open a discussion](https://github.com/Jszigeti/launchts/discussions/new) or issue with:

- **Use case:** What problem does it solve?
- **Proposed solution:** How should it work?
- **Alternatives:** Other approaches you considered
- **Examples:** Similar features in other tools

---

## Code of Conduct

Be respectful, inclusive, and constructive. We're all here to build something great together!

---

## Recognition

Contributors are recognized in:

- Release notes
- GitHub contributors page
- Special shoutouts for significant contributions

Thank you for making `launchts` better! ❤️
