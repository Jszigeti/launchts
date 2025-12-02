#!/usr/bin/env node
import { cac } from 'cac';
import { createProject, isValidProjectName } from './generator';
import { ToolOptions, PromptQuestion } from './types';
import { YES_DEFAULTS, DEFAULT_OPTIONS } from './configs';
import { MESSAGES } from './messages';
import fs from 'fs';
import path from 'path';

// import enquirer dynamically to avoid typing issues in dev env
const enquirer = require('enquirer');
const { prompt } = enquirer as {
  prompt: <T extends Record<string, string | boolean>>(
    questions: PromptQuestion[],
  ) => Promise<T>;
};

const cli = cac('launchts');

cli
  .command('[name]', 'Create a new TypeScript project')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .option('--eslint', 'Add ESLint config')
  .option('--prettier', 'Add Prettier config')
  .option('--husky', 'Add Husky pre-commit hooks')
  .option('--nodemon', 'Add nodemon dev script')
  .option('--pm <pm>', 'Package manager (npm|yarn|pnpm)', { default: 'npm' })
  .option('--git', 'Initialize a git repository')
  .option('--install', 'Run package manager install in the created project')
  .option('--no-git', 'Do not initialize a git repository')
  .option('--no-install', 'Do not run package manager install')
  .option('--verbose', 'Show verbose output during scaffold')
  .option('--no-commit', 'Do not make initial git commit')
  .example(
    "  $ launchts my-app                   Create 'my-app' interactively",
  )
  .example(
    '  $ launchts my-app --yes             Create with all options enabled',
  )
  .example(
    '  $ launchts my-app --default         Create with sensible defaults',
  )
  .example('  $ launchts my-app --pm pnpm         Use pnpm as package manager')
  .action(async (name: string, options: Partial<ToolOptions>) => {
    await runCreateFlow(name, options);
  });

cli.help();

const pkg = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf8'),
);
cli.version(pkg.version);

// lightweight argv flag parser to be used when invoking the binary without
// explicit command. This allows `launchts` (no args) to start the
// interactive create flow and still respect flags like `--yes` or `--pm`.
function parseFlagsFromArgv(argv: string[]): Partial<ToolOptions> {
  const out: Partial<ToolOptions> = {};
  const args = argv.slice(2);

  // Simple boolean flag mapping
  const booleanFlags: Record<
    string,
    keyof Pick<
      ToolOptions,
      | 'yes'
      | 'useDefaults'
      | 'eslint'
      | 'prettier'
      | 'husky'
      | 'nodemon'
      | 'git'
      | 'install'
      | 'noCommit'
      | 'verbose'
    >
  > = {
    '-y': 'yes',
    '--yes': 'yes',
    '-d': 'useDefaults',
    '--default': 'useDefaults',
    '--eslint': 'eslint',
    '--prettier': 'prettier',
    '--husky': 'husky',
    '--nodemon': 'nodemon',
    '--git': 'git',
    '--install': 'install',
    '--no-commit': 'noCommit',
    '--verbose': 'verbose',
  };

  const knownFlags = new Set([
    ...Object.keys(booleanFlags),
    '--no-git',
    '--no-install',
    '--pm',
    '-h',
    '--help',
    '-v',
    '--version',
  ]);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    // Handle boolean flags
    if (arg in booleanFlags) {
      const key = booleanFlags[arg];
      (out as Record<string, boolean>)[key] = true;
    } else if (arg === '--no-git') {
      out.git = false;
    } else if (arg === '--no-install') {
      out.install = false;
    } else if (arg.startsWith('--pm=')) {
      const pmValue = arg.split('=', 2)[1];
      if (['npm', 'yarn', 'pnpm'].includes(pmValue)) {
        out.pm = pmValue as ToolOptions['pm'];
      } else {
        console.warn(MESSAGES.unknownPackageManager(pmValue));
        out.pm = 'npm';
      }
    } else if (arg === '--pm') {
      const pmValue = args[i + 1];
      if (['npm', 'yarn', 'pnpm'].includes(pmValue)) {
        out.pm = pmValue as ToolOptions['pm'];
      } else {
        console.warn(MESSAGES.unknownPackageManager(pmValue));
        out.pm = 'npm';
      }
      i++;
    } else if (
      arg.startsWith('-') &&
      !knownFlags.has(arg) &&
      !arg.startsWith('--pm=')
    ) {
      console.warn(MESSAGES.unknownFlag(arg));
    }
  }
  return out;
}

// Parse normally to register commands/options with cac
cli.parse();

// If no command was provided, start the interactive create flow by default.
// We avoid blocking the non-interactive help output when the user explicitly
// asked for `--help` or `--version` because cac handles those earlier.
if (process.argv.length <= 2) {
  (async () => {
    const flags = parseFlagsFromArgv(process.argv);
    try {
      await runCreateFlow(undefined, flags);
    } catch (e) {
      // Show error then exit non-zero
      console.error('✖', e instanceof Error ? e.message : e);
      process.exit(1);
    }
  })();
}

function detectPackageManager(): 'npm' | 'yarn' | 'pnpm' {
  const ua = process.env.npm_config_user_agent;
  if (ua) {
    if (ua.startsWith('pnpm')) return 'pnpm';
    if (ua.startsWith('yarn')) return 'yarn';
    if (ua.startsWith('npm')) return 'npm';
  }
  // fallback: check lockfiles in cwd
  const cwd = process.cwd();
  if (fs.existsSync(`${cwd}/pnpm-lock.yaml`)) return 'pnpm';
  if (fs.existsSync(`${cwd}/yarn.lock`)) return 'yarn';
  if (fs.existsSync(`${cwd}/package-lock.json`)) return 'npm';
  return 'npm';
}

async function promptForName(nameArg: string | undefined): Promise<string> {
  if (nameArg) return nameArg;

  const nameResp = (await prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Project name:',
      initial: 'my-ts-app',
    },
  ])) as { name: string };
  return nameResp.name;
}

async function promptForTools(
  opts: Partial<ToolOptions>,
): Promise<Pick<ToolOptions, 'eslint' | 'prettier' | 'husky' | 'nodemon'>> {
  const resp = (await prompt([
    {
      type: 'confirm',
      name: 'eslint',
      message: 'Add ESLint?',
      initial: !!opts.eslint,
    },
    {
      type: 'confirm',
      name: 'prettier',
      message: 'Add Prettier?',
      initial: !!opts.prettier,
    },
    {
      type: 'confirm',
      name: 'husky',
      message: 'Add Husky (pre-commit hooks)?',
      initial: !!opts.husky,
    },
    {
      type: 'confirm',
      name: 'nodemon',
      message: 'Add nodemon dev script?',
      initial: !!opts.nodemon,
    },
  ])) as {
    eslint: boolean;
    prettier: boolean;
    husky: boolean;
    nodemon: boolean;
  };
  return resp;
}

async function promptForGitAndInstall(
  gitInitial: boolean,
  installInitial: boolean,
): Promise<{ git: boolean; install: boolean }> {
  const g = (await prompt([
    {
      type: 'confirm',
      name: 'git',
      message: 'Initialize a git repository?',
      initial: gitInitial,
    },
  ])) as { git: boolean };

  const inst = (await prompt([
    {
      type: 'confirm',
      name: 'install',
      message: 'Install dependencies now?',
      initial: installInitial,
    },
  ])) as { install: boolean };

  return { git: g.git, install: inst.install };
}

async function runCreateFlow(
  nameArg: string | undefined,
  optionsArg: Partial<ToolOptions>,
) {
  const globalYes = optionsArg?.yes === true;
  const globalUseDefaults = optionsArg?.useDefaults === true;

  let opts: ToolOptions = optionsArg || {};

  // Validate --pm option
  const validPMs = ['npm', 'yarn', 'pnpm'] as const;
  if (opts.pm && !validPMs.includes(opts.pm)) {
    console.error(MESSAGES.invalidPackageManager(opts.pm, [...validPMs]));
    process.exit(1);
  }

  // Always prompt for name if not provided
  const name = await promptForName(nameArg);

  // Validate project name (both in interactive and CLI mode)
  if (!name || !isValidProjectName(name)) {
    console.error(MESSAGES.invalidProjectName(name));
    process.exit(1);
  }

  // Always determine package manager first
  const detectedPM = opts.pm || detectPackageManager();

  // If --yes, use defaults for options. Otherwise, prompt for options
  if (globalYes) {
    opts = { ...YES_DEFAULTS, pm: detectedPM };
  } else if (globalUseDefaults) {
    opts = { ...DEFAULT_OPTIONS, pm: detectedPM };
  } else {
    const toolsResp = await promptForTools(opts);
    opts = {
      ...opts,
      ...toolsResp,
      pm: detectedPM,
    };
  }

  // Default behavior: enable git init and dependency install unless explicitly disabled
  opts.git = opts.git !== undefined ? opts.git : true;
  opts.install = opts.install !== undefined ? opts.install : true;

  // If interactive (not --yes or --useDefaults), confirm git/install separately
  if (!globalYes && !globalUseDefaults) {
    const gitInstallResp = await promptForGitAndInstall(opts.git, opts.install);
    opts.git = gitInstallResp.git;
    opts.install = gitInstallResp.install;
  }

  try {
    await createProject({
      name: name,
      options: opts,
    });
    console.log(MESSAGES.projectCreated(name));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(MESSAGES.failedToCreateProject(msg));
    process.exit(1);
  }
}
