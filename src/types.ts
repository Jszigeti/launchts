/** Package manager type: npm, yarn or pnpm */
export type PackageManager = 'npm' | 'yarn' | 'pnpm';

/** Options for configuring the generated project and CLI behavior */
export type ToolOptions = {
  /** Enable ESLint for code linting */
  eslint?: boolean;
  /** Enable Prettier for code formatting */
  prettier?: boolean;
  /** Enable Husky for git pre-commit hooks */
  husky?: boolean;
  /** Enable nodemon for development auto-reload */
  nodemon?: boolean;
  /** Package manager to use (defaults to auto-detection) */
  pm?: PackageManager;
  /** Initialize a git repository */
  git?: boolean;
  /** Install dependencies after project creation */
  install?: boolean;
  /** Enable verbose output */
  verbose?: boolean;
  /** Skip initial git commit (when git is enabled) */
  noCommit?: boolean;
  /** Skip all prompts and use YES_DEFAULTS (all tools enabled) */
  yes?: boolean;
  /** Skip all prompts and use DEFAULT_OPTIONS (sensible defaults) */
  useDefaults?: boolean;
};

/** Options for creating a new TypeScript project */
export type CreateOptions = {
  /** Name of the project/directory to create */
  name: string;
  /** Tool and CLI configuration options */
  options?: ToolOptions;
};

/** Root package.json structure with dependencies */
export type RootPackage = {
  /** Production dependencies */
  dependencies?: Record<string, string>;
  /** Development dependencies */
  devDependencies?: Record<string, string>;
  /** Allow additional package.json fields */
  [key: string]: unknown;
};

/** Generated package.json structure for the new project */
export type GeneratedPackage = {
  /** Project name */
  name?: string;
  /** Project version */
  version?: string;
  /** Whether the package is private */
  private?: boolean;
  /** NPM scripts */
  scripts?: Record<string, string>;
  /** Development dependencies */
  devDependencies?: Record<string, string>;
  /** Allow additional package.json fields */
  [key: string]: unknown;
};

/** Type for enquirer prompt questions */
export type PromptQuestion = {
  /** Type of prompt (input, confirm, etc.) */
  type: string;
  /** Identifier for the prompt response */
  name: string;
  /** Question text displayed to the user */
  message: string;
  /** Default value for the prompt */
  initial?: string | boolean;
};
