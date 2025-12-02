import { describe, it, expect } from 'vitest';
import { isValidProjectName } from '../src/generator';

describe('Validation', () => {
  describe('isValidProjectName', () => {
    it('accepts valid project names', () => {
      expect(isValidProjectName('my-app')).toBe(true);
      expect(isValidProjectName('my_app')).toBe(true);
      expect(isValidProjectName('myApp')).toBe(true);
      expect(isValidProjectName('my-app-2')).toBe(true);
      expect(isValidProjectName('my.app')).toBe(true);
      expect(isValidProjectName('a')).toBe(true);
      expect(isValidProjectName('MyApp')).toBe(true);
      expect(isValidProjectName('MY_APP')).toBe(true);
      expect(isValidProjectName('myapp2')).toBe(true);
      expect(isValidProjectName('2myapp')).toBe(true);
      expect(isValidProjectName('my.app.project')).toBe(true);
    });

    it('rejects invalid project names', () => {
      expect(isValidProjectName('')).toBe(false);
      expect(isValidProjectName('-my-app')).toBe(false); // starts with dash
      expect(isValidProjectName('--app')).toBe(false);
      expect(isValidProjectName('.my-app')).toBe(false); // starts with dot
      expect(isValidProjectName('..app')).toBe(false);
      expect(isValidProjectName('my app')).toBe(false); // spaces
      expect(isValidProjectName(' myapp')).toBe(false);
      expect(isValidProjectName('myapp ')).toBe(false);
      expect(isValidProjectName('my@app')).toBe(false); // special chars
      expect(isValidProjectName('my#app')).toBe(false);
      expect(isValidProjectName('my$app')).toBe(false);
      expect(isValidProjectName('my%app')).toBe(false);
      expect(isValidProjectName('my&app')).toBe(false);
      expect(isValidProjectName('my*app')).toBe(false);
      expect(isValidProjectName('my(app)')).toBe(false);
      expect(isValidProjectName('my[app]')).toBe(false);
      expect(isValidProjectName('my{app}')).toBe(false);
      expect(isValidProjectName('my/app')).toBe(false); // slash
      expect(isValidProjectName('my\\app')).toBe(false);
      expect(isValidProjectName('a'.repeat(215))).toBe(false); // too long
      expect(isValidProjectName('a'.repeat(300))).toBe(false);
    });

    it('accepts names at the boundary (214 chars)', () => {
      expect(isValidProjectName('a'.repeat(214))).toBe(true);
    });
  });
});
