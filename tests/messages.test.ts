import { describe, it, expect } from 'vitest';
import { MESSAGES } from '../src/messages';

describe('MESSAGES', () => {
  describe('Success messages', () => {
    it('formats projectCreated message correctly', () => {
      const result = MESSAGES.projectCreated('my-app');
      expect(result).toBe('✔ Project my-app created');
      expect(result).toContain('✔');
    });
  });

  describe('Error messages', () => {
    it('formats invalidProjectName message correctly', () => {
      const result = MESSAGES.invalidProjectName('invalid@name');
      expect(result).toContain('✖');
      expect(result).toContain('invalid@name');
      expect(result).toContain('alphanumeric');
    });

    it('formats invalidPackageManager message correctly', () => {
      const result = MESSAGES.invalidPackageManager('invalid', [
        'npm',
        'yarn',
        'pnpm',
      ]);
      expect(result).toContain('✖');
      expect(result).toContain('invalid');
      expect(result).toContain('npm, yarn, pnpm');
    });

    it('formats targetFolderExists message correctly', () => {
      const result = MESSAGES.targetFolderExists('/path/to/project');
      expect(result).toContain('Target folder already exists');
      expect(result).toContain('/path/to/project');
    });

    it('formats failedToCreateProject message correctly', () => {
      const result = MESSAGES.failedToCreateProject('Some error');
      expect(result).toContain('✖');
      expect(result).toContain('Failed to create project');
      expect(result).toContain('Some error');
    });

    it('formats genericError message correctly', () => {
      const result = MESSAGES.genericError('Generic error message');
      expect(result).toBe('✖ Generic error message');
    });
  });

  describe('Warning messages', () => {
    it('formats unknownPackageManager message correctly', () => {
      const result = MESSAGES.unknownPackageManager('bun');
      expect(result).toContain('⚠️');
      expect(result).toContain('bun');
      expect(result).toContain('Defaulting to npm');
    });

    it('formats unknownFlag message correctly', () => {
      const result = MESSAGES.unknownFlag('--unknown');
      expect(result).toContain('⚠️');
      expect(result).toContain('--unknown');
      expect(result).toContain('--help');
    });

    it('formats gitInitFailed message correctly', () => {
      const result = MESSAGES.gitInitFailed('git not found');
      expect(result).toContain('⚠️');
      expect(result).toContain('git not found');
      expect(result).toContain('Tip:');
    });

    it('formats gitCommitFailed message correctly', () => {
      const result = MESSAGES.gitCommitFailed('no user config');
      expect(result).toContain('⚠️');
      expect(result).toContain('no user config');
      expect(result).toContain('git config');
    });

    it('formats installFailed message correctly', () => {
      const result = MESSAGES.installFailed('npm', 'network error');
      expect(result).toContain('⚠️');
      expect(result).toContain('npm');
      expect(result).toContain('network error');
      expect(result).toContain('Tip:');
    });
  });

  describe('Message consistency', () => {
    it('uses consistent success indicator', () => {
      const successMsg = MESSAGES.projectCreated('test');
      expect(successMsg.startsWith('✔')).toBe(true);
    });

    it('uses consistent error indicator', () => {
      const errorMsg1 = MESSAGES.invalidProjectName('test');
      const errorMsg2 = MESSAGES.failedToCreateProject('test');
      expect(errorMsg1.startsWith('✖')).toBe(true);
      expect(errorMsg2.startsWith('✖')).toBe(true);
    });

    it('uses consistent warning indicator', () => {
      const warnMsg1 = MESSAGES.unknownPackageManager('test');
      const warnMsg2 = MESSAGES.unknownFlag('test');
      expect(warnMsg1.startsWith('⚠️')).toBe(true);
      expect(warnMsg2.startsWith('⚠️')).toBe(true);
    });

    it('all warning messages include helpful tips', () => {
      const warnMsg1 = MESSAGES.gitInitFailed('error');
      const warnMsg2 = MESSAGES.gitCommitFailed('error');
      const warnMsg3 = MESSAGES.installFailed('npm', 'error');

      expect(warnMsg1.toLowerCase()).toContain('tip');
      expect(warnMsg2.toLowerCase()).toContain('tip');
      expect(warnMsg3.toLowerCase()).toContain('tip');
    });
  });
});
