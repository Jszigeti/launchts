/**
 * Centralized user-facing messages for better maintainability and potential i18n
 */

export const MESSAGES = {
  // Success messages
  projectCreated: (name: string) => `✔ Project ${name} created`,

  // Error messages
  invalidProjectName: (name: string) =>
    `✖ Invalid project name: ${name}. Use alphanumeric, hyphens, underscores (1-214 chars).`,
  invalidPackageManager: (pm: string, valid: string[]) =>
    `✖ Invalid package manager: ${pm}. Choose from: ${valid.join(', ')}`,
  targetFolderExists: (target: string) =>
    `Target folder already exists: ${target}`,
  failedToCreateProject: (msg: string) => `✖ Failed to create project: ${msg}`,
  genericError: (msg: string) => `✖ ${msg}`,

  // Warning messages
  unknownPackageManager: (pm: string) =>
    `⚠️  Unknown package manager: ${pm}. Defaulting to npm.`,
  unknownFlag: (flag: string) =>
    `⚠️  Unknown flag: ${flag}. Use --help to see available options.`,
  gitInitFailed: (reason: string) =>
    `⚠️  Warning: Could not initialize git.\n   Reason: ${reason}\n   Tip: Make sure git is installed ('git --version' should work)`,
  gitCommitFailed: (reason: string) =>
    `⚠️  Warning: Could not create git commit.\n   Reason: ${reason}\n   Tip: Run 'git config --global user.email "you@example.com"' and 'git config --global user.name "Your Name"'`,
  installFailed: (pm: string, reason: string) =>
    `⚠️  Warning: Could not install dependencies with ${pm}.\n   Reason: ${reason}\n   Tip: Make sure ${pm} is installed and try running '${pm} install' manually in the project directory`,
} as const;
