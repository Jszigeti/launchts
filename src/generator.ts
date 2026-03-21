import path from 'path';
import fs from 'fs-extra';
import { spawn } from 'child_process';
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
): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      stdio: verbose ? 'inherit' : 'pipe',
    });

    let stderr = '';
    if (!verbose && child.stderr) {
      child.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });
    }

    child.on('close', (code) => {
      if (code !== 0 && !verbose && !silent && stderr) {
        const trimmed = stderr.trim();
        if (trimmed) console.error(`Error running ${command}: ${trimmed}`);
      }
      resolve(code === 0);
    });

    child.on('error', () => resolve(false));
  });
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
      start: 'node dist/index.js',
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

type ScriptEntry = { cmd: string; short: string; desc: string };

function getActiveScripts(
  toolOptions: CreateOptions['options'],
): ScriptEntry[] {
  const scripts: ScriptEntry[] = [
    {
      cmd: 'npm run build',
      short: 'build  ',
      desc: 'Compiles TypeScript files to JavaScript in the `dist/` directory',
    },
  ];
  if (toolOptions?.nodemon) {
    scripts.push({
      cmd: 'npm run dev',
      short: 'dev    ',
      desc: 'Starts the development server with auto-reload on file changes',
    });
  }
  if (toolOptions?.eslint) {
    scripts.push({
      cmd: 'npm run lint',
      short: 'lint   ',
      desc: 'Checks code quality with ESLint',
    });
  }
  if (toolOptions?.prettier) {
    scripts.push({
      cmd: 'npm run format',
      short: 'format ',
      desc: 'Formats all files with Prettier',
    });
  }
  return scripts;
}

function generateReadmeHeader(projectName: string): string {
  return `# ${projectName}

TypeScript project generated with [launchts](https://github.com/Jszigeti/launchts).

## Getting Started
`;
}

function generateReadmeScripts(toolOptions: CreateOptions['options']): string {
  const lines = getActiveScripts(toolOptions)
    .map(
      ({ cmd, short }) => `npm run ${short} # ${cmd.replace('npm run ', '')}`,
    )
    .join('\n');
  return `### Development

\`\`\`bash
${lines}
\`\`\`
`;
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

  structure += toolOptions?.husky
    ? `└── .husky/            # Git hooks\n`
    : `└── ...\n`;

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

  if (toolOptions?.eslint)
    techStack += `- **ESLint** - Code quality and consistency with TypeScript support\n`;
  if (toolOptions?.prettier) techStack += `- **Prettier** - Code formatting\n`;
  if (toolOptions?.nodemon)
    techStack += `- **Nodemon** - Auto-reload during development\n`;
  if (toolOptions?.husky)
    techStack += `- **Husky + lint-staged** - Pre-commit hooks for code quality\n`;

  return techStack;
}

function generateReadmeScriptsDetails(
  toolOptions: CreateOptions['options'],
): string {
  const lines = getActiveScripts(toolOptions)
    .map(({ cmd, desc }) => `- \`${cmd}\` - ${desc}`)
    .join('\n');
  return `\n## Scripts\n\n${lines}\n`;
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
  return [
    generateReadmeHeader(projectName),
    generateReadmeScripts(toolOptions),
    generateReadmeStructure(projectName, toolOptions),
    generateReadmeTechStack(toolOptions),
    generateReadmeScriptsDetails(toolOptions),
    generateReadmeGitHooks(toolOptions),
    '\n## License\n\nMIT\n',
  ].join('');
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
      const gitAvailable = await runCommand(
        'git',
        ['--version'],
        target,
        false,
        true,
      );
      if (gitAvailable) {
        const insideRepo = await runCommand(
          'git',
          ['rev-parse', '--is-inside-work-tree'],
          target,
          false,
          true,
        );

        if (!insideRepo) {
          await runCommand(
            'git',
            ['init'],
            target,
            toolOptions.verbose ?? false,
          );
          await fs.outputFile(
            path.join(target, '.gitignore'),
            [
              '# Dependencies',
              'node_modules/',
              '',
              '# Build output',
              'dist/',
              '',
              '# Environment',
              '.env',
              '.env.local',
              '',
              '# Logs',
              '*.log',
              'npm-debug.log*',
              '',
              '# Test coverage',
              'coverage/',
              '',
              '# OS',
              '.DS_Store',
            ].join('\n') + '\n',
            'utf8',
          );
        }
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.warn(MESSAGES.gitInitFailed(errMsg));
    }
  }

  if (toolOptions.install ?? true) {
    const pm = toolOptions.pm ?? 'npm';
    try {
      await runCommand(pm, ['install'], target, toolOptions.verbose ?? false);

      if (toolOptions.husky) {
        await runCommand(
          'npx',
          ['husky', 'install'],
          target,
          toolOptions.verbose ?? false,
        );
        const preCommitHook = path.join(target, '.husky', 'pre-commit');
        if (!(await fs.pathExists(preCommitHook))) {
          await runCommand(
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

  // Git initial commit AFTER install to include lockfile
  if ((toolOptions.git ?? true) && !(toolOptions.noCommit ?? false)) {
    try {
      const gitAvailable = await runCommand(
        'git',
        ['--version'],
        target,
        false,
        true,
      );
      if (gitAvailable) {
        const insideRepo = await runCommand(
          'git',
          ['rev-parse', '--is-inside-work-tree'],
          target,
          false,
          true,
        );
        const hasCommits = await runCommand(
          'git',
          ['rev-parse', 'HEAD'],
          target,
          false,
          true,
        );

        if (insideRepo && !hasCommits) {
          try {
            await runCommand(
              'git',
              ['add', '-A'],
              target,
              toolOptions.verbose ?? false,
            );
            await runCommand(
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
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.warn(MESSAGES.gitCommitFailed(errMsg));
    }
  }
}
