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
  .option('-d, --default', 'Skip prompts and use sensible defaults')
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
  .action(
    async (
      name: string,
      options: Partial<ToolOptions> & { default?: boolean },
    ) => {
      const { default: useDefaultsAlias, ...rest } = options;
      await runCreateFlow(name, {
        ...rest,
        useDefaults: useDefaultsAlias ?? rest.useDefaults,
      });
    },
  );

cli.help();

const pkg = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf8'),
);
cli.version(pkg.version);

// Parse normally to register commands/options with cac
cli.parse();

// cac does not fire the action for the no-args case — trigger the interactive
// flow manually. --help and --version are handled by cac before this point.
if (process.argv.length <= 2) {
  (async () => {
    try {
      await runCreateFlow(undefined, {});
    } catch (e) {
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
