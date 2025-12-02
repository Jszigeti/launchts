import path from 'path';
import fs from 'fs-extra';
import { spawnSync } from 'child_process';
import type { CreateOptions, RootPackage, GeneratedPackage } from './types';
import { TOOL_CONFIGS } from './configs';
import { MESSAGES } from './messages';

// Helper to run commands with consistent behavior
function runCommand(
  command: string,
  args: string[],
  cwd: string,
  verbose: boolean,
  silent = false,
): boolean {
  const result = spawnSync(command, args, {
    cwd,
    stdio: verbose ? 'inherit' : 'pipe',
  });

  // Log errors even in non-verbose mode for better debugging
  // Skip logging if silent=true (for check commands like git rev-parse)
  if (result.status !== 0 && !verbose && !silent && result.stderr) {
    const stderrOutput = result.stderr.toString().trim();
    if (stderrOutput) {
      console.error(`Error running ${command}: ${stderrOutput}`);
    }
  }

  return result.status === 0;
}

// Validate project name: alphanumeric, hyphens, underscores, 1-214 characters
export function isValidProjectName(name: string): boolean {
  if (!name || name.length > 214) return false;
  // Allow alphanumeric, hyphens, underscores, dots (but not starting with dot or dash)
  if (/^[.-]/.test(name)) return false;
  return /^[a-zA-Z0-9._-]+$/.test(name);
}

function minimalPackageJson(projectName: string) {
  return {
    name: projectName,
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: {
      build: 'tsc -p tsconfig.json',
    },
  };
}

function baseTsconfig() {
  return {
    compilerOptions: {
      target: 'ESNext',
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      declaration: true,
      outDir: 'dist',
      rootDir: 'src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      isolatedModules: true,
    },
  };
}

// Helper functions for README generation
function generateReadmeHeader(projectName: string): string {
  return `# ${projectName}

TypeScript project generated with [launchts](https://github.com/Jszigeti/launchts).

## Getting Started
`;
}

function generateReadmeScripts(toolOptions: CreateOptions['options']): string {
  let scripts = `### Development

\`\`\`bash
npm run build    # Compile TypeScript to JavaScript
`;

  if (toolOptions?.nodemon) {
    scripts += `npm run dev      # Start development server with auto-reload\n`;
  }

  if (toolOptions?.eslint) {
    scripts += `npm run lint     # Run ESLint\n`;
  }

  if (toolOptions?.prettier) {
    scripts += `npm run format   # Format code with Prettier\n`;
  }

  scripts += `\`\`\`
`;
  return scripts;
}

function generateReadmeStructure(
  projectName: string,
  toolOptions: CreateOptions['options'],
): string {
  let structure = `### Project Structure

\`\`\`
${projectName}/
├── src/
│   └── index.ts       # Entry point
├── dist/              # Compiled output (generated)
├── tsconfig.json      # TypeScript configuration
├── package.json       # Project dependencies and scripts
`;

  if (toolOptions?.eslint) {
    structure += `├── eslint.config.js   # ESLint configuration (flat config)\n`;
  }

  if (toolOptions?.prettier) {
    structure += `├── .prettierrc        # Prettier configuration\n`;
  }

  if (toolOptions?.husky) {
    structure += `└── .husky/            # Git hooks\n`;
  } else {
    structure += `└── ...\n`;
  }

  structure += `\`\`\`
`;
  return structure;
}

function generateReadmeTechStack(
  toolOptions: CreateOptions['options'],
): string {
  let techStack = `## Technology Stack

- **TypeScript** - Type-safe JavaScript with ESNext target
- **Node.js** - Runtime environment with ESM modules
`;

  if (toolOptions?.eslint) {
    techStack += `- **ESLint** - Code quality and consistency with TypeScript support\n`;
  }

  if (toolOptions?.prettier) {
    techStack += `- **Prettier** - Code formatting\n`;
  }

  if (toolOptions?.nodemon) {
    techStack += `- **Nodemon** - Auto-reload during development\n`;
  }

  if (toolOptions?.husky) {
    techStack += `- **Husky + lint-staged** - Pre-commit hooks for code quality\n`;
  }

  return techStack;
}

function generateReadmeScriptsDetails(
  toolOptions: CreateOptions['options'],
): string {
  let scriptsDetails = `
## Scripts

- \`npm run build\` - Compiles TypeScript files to JavaScript in the \`dist/\` directory
`;

  if (toolOptions?.nodemon) {
    scriptsDetails += `- \`npm run dev\` - Starts the development server with auto-reload on file changes\n`;
  }

  if (toolOptions?.eslint) {
    scriptsDetails += `- \`npm run lint\` - Checks code quality with ESLint\n`;
  }

  if (toolOptions?.prettier) {
    scriptsDetails += `- \`npm run format\` - Formats all files with Prettier\n`;
  }

  return scriptsDetails;
}

function generateReadmeGitHooks(toolOptions: CreateOptions['options']): string {
  if (!toolOptions?.husky) return '';

  return `
## Git Hooks

This project uses Husky to run quality checks before commits:

- **Pre-commit**: Automatically runs ESLint and Prettier on staged files
`;
}

function generateReadme(
  projectName: string,
  toolOptions: CreateOptions['options'],
) {
  let readme = generateReadmeHeader(projectName);
  readme += generateReadmeScripts(toolOptions);
  readme += generateReadmeStructure(projectName, toolOptions);
  readme += generateReadmeTechStack(toolOptions);
  readme += generateReadmeScriptsDetails(toolOptions);
  readme += generateReadmeGitHooks(toolOptions);
  readme += `
## License

MIT
`;

  return readme;
}

// Helper to get dependency version from root package.json or fallback
function getDependencyVersion(
  rootPkg: RootPackage,
  depName: string,
  fallback: string,
): string {
  return (
    rootPkg.devDependencies?.[depName] ??
    rootPkg.dependencies?.[depName] ??
    fallback
  );
}

// Helper to add a tool's dependencies and scripts to package.json
function addToolToPackage(
  pkg: GeneratedPackage,
  rootPkg: RootPackage,
  config: {
    deps: readonly string[];
    scripts: Record<string, string>;
  },
): void {
  pkg.devDependencies = pkg.devDependencies || {};

  // Add dependencies - resolve versions from rootPkg
  for (const depName of config.deps) {
    pkg.devDependencies[depName] = getDependencyVersion(
      rootPkg,
      depName,
      'latest',
    );
  }

  // Add scripts
  pkg.scripts = pkg.scripts || {};
  for (const [scriptName, scriptCmd] of Object.entries(config.scripts)) {
    pkg.scripts[scriptName] = scriptCmd;
  }
}

export async function createProject(opts: CreateOptions) {
  const { name, options: toolOptions = {} } = opts;
  const target = path.resolve(process.cwd(), name);

  if (await fs.pathExists(target)) {
    throw new Error(MESSAGES.targetFolderExists(target));
  }

  await fs.ensureDir(target);

  const projectName = path.basename(name);

  // Create initial package.json object in memory
  const pkg: GeneratedPackage = minimalPackageJson(projectName);

  // Write minimal project layout in parallel
  await Promise.all([
    fs.outputFile(
      path.join(target, 'src', 'index.ts'),
      `console.log('Hello TypeScript')\n`,
    ),
    fs.outputFile(
      path.join(target, 'tsconfig.json'),
      JSON.stringify(baseTsconfig(), null, 2),
    ),
  ]);

  // Read versions from this generator's package.json
  const rootPkg: RootPackage = JSON.parse(
    await fs.readFile(path.resolve(__dirname, '..', 'package.json'), 'utf8'),
  );

  pkg.scripts = pkg.scripts || {};

  // TypeScript is always required for a TypeScript project
  pkg.devDependencies = pkg.devDependencies || {};
  pkg.devDependencies['typescript'] = getDependencyVersion(
    rootPkg,
    'typescript',
    'latest',
  );

  if (toolOptions.nodemon) {
    addToolToPackage(pkg, rootPkg, TOOL_CONFIGS.nodemon);
  }

  // Prepare all config files to write
  const configFilesToWrite: Promise<void>[] = [];

  if (toolOptions.eslint) {
    addToolToPackage(pkg, rootPkg, TOOL_CONFIGS.eslint);
    configFilesToWrite.push(
      fs.outputFile(
        path.join(target, 'eslint.config.js'),
        TOOL_CONFIGS.eslint.config,
        'utf8',
      ),
    );
  }

  if (toolOptions.prettier) {
    addToolToPackage(pkg, rootPkg, TOOL_CONFIGS.prettier);
    configFilesToWrite.push(
      fs.outputFile(
        path.join(target, '.prettierrc'),
        JSON.stringify(TOOL_CONFIGS.prettier.config, null, 2),
        'utf8',
      ),
    );
  }

  if (toolOptions.husky) {
    addToolToPackage(pkg, rootPkg, TOOL_CONFIGS.husky);
    pkg['lint-staged'] = pkg['lint-staged'] || TOOL_CONFIGS.husky.lintStaged;

    const huskyDir = path.join(target, '.husky');
    await fs.ensureDir(huskyDir);
    configFilesToWrite.push(
      fs.outputFile(
        path.join(huskyDir, 'pre-commit'),
        TOOL_CONFIGS.husky.preCommitHook,
        { mode: 0o755 },
      ),
    );
  }

  // Generate README content
  const readmeContent = generateReadme(projectName, toolOptions);

  // Write package.json and README, plus all config files in parallel
  configFilesToWrite.push(
    fs.outputFile(
      path.join(target, 'package.json'),
      JSON.stringify(pkg, null, 2),
      'utf8',
    ),
    fs.outputFile(path.join(target, 'README.md'), readmeContent, 'utf8'),
  );

  await Promise.all(configFilesToWrite);

  // optionally initialize git and install dependencies
  if (toolOptions.git ?? true) {
    try {
      const gitAvailable = runCommand(
        'git',
        ['--version'],
        target,
        false,
        true,
      );
      if (gitAvailable) {
        const insideRepo = runCommand(
          'git',
          ['rev-parse', '--is-inside-work-tree'],
          target,
          false,
          true, // silent check - don't log error if not in a repo
        );

        if (!insideRepo) {
          runCommand('git', ['init'], target, toolOptions.verbose ?? false);
          await fs.outputFile(
            path.join(target, '.gitignore'),
            'node_modules\ndist\n.env\n',
            'utf8',
          );
          if (!(toolOptions.noCommit ?? false)) {
            try {
              runCommand(
                'git',
                ['add', '-A'],
                target,
                toolOptions.verbose ?? false,
              );
              runCommand(
                'git',
                ['commit', '-m', 'chore: initial commit'],
                target,
                toolOptions.verbose ?? false,
              );
            } catch (e) {
              const errMsg = e instanceof Error ? e.message : String(e);
              console.warn(MESSAGES.gitCommitFailed(errMsg));
            }
          }
        }
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.warn(MESSAGES.gitInitFailed(errMsg));
    }
  }

  if (toolOptions.install ?? true) {
    const pm = (toolOptions && toolOptions.pm) || 'npm';
    try {
      if (pm === 'pnpm') {
        runCommand('pnpm', ['install'], target, toolOptions.verbose ?? false);
      } else if (pm === 'yarn') {
        runCommand('yarn', ['install'], target, toolOptions.verbose ?? false);
      } else {
        runCommand('npm', ['install'], target, toolOptions.verbose ?? false);
      }

      if (toolOptions.husky) {
        runCommand(
          'npx',
          ['husky', 'install'],
          target,
          toolOptions.verbose ?? false,
        );
        const preCommitHook = path.join(target, '.husky', 'pre-commit');
        if (!(await fs.pathExists(preCommitHook))) {
          runCommand(
            'npx',
            ['husky', 'add', '.husky/pre-commit', 'npx lint-staged'],
            target,
            toolOptions.verbose ?? false,
          );
        }
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.warn(MESSAGES.installFailed(pm, errMsg));
    }
  }
}
