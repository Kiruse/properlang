import { describe, expect, test } from 'bun:test';
import { createProperLangParser } from './parser';
import { unindent } from './utils';

describe('ProperLang Parser', () => {
  const parser = createProperLangParser();

  describe('Template Literals', () => {
    describe('Simple templates (no interpolation)', () => {
      test('parses empty template', () => {
        const result = parser.parse('let x = ``;');
        expect(result.parserErrors).toHaveLength(0);
      });

      test('parses simple template with text', () => {
        const result = parser.parse('let x = `hello world`;');
        expect(result.parserErrors).toHaveLength(0);
      });

      test('parses multiline template', () => {
        const result = parser.parse(unindent(`
          let x = \`line 1
          line 2\`;`));
        expect(result.parserErrors).toHaveLength(0);
      });

      test('parses template with escaped characters', () => {
        const result = parser.parse('let x = `hello\\nworld`;');
        expect(result.parserErrors).toHaveLength(0);
      });
    });

    describe('Templates with interpolation', () => {
      test('parses template with single interpolation', () => {
        const result = parser.parse('let x = `hello ${name}`;');
        expect(result.parserErrors).toHaveLength(0);

        const stmts = (result.value as any).stmts;
        const stmt = stmts[0];
        expect(stmt.name).toBe('x');
        expect(stmt.value?.value?.$type).toBe('TemplateLit');
      });

      test('parses template with multiple interpolations', () => {
        const result = parser.parse('let x = `a ${x} b ${y} c`;');
        expect(result.parserErrors).toHaveLength(0);

        const stmts = (result.value as any).stmts;
        const stmt = stmts[0];
        const vals = stmt.value?.value?.vals;
        expect(vals.length).toBe(5);
      });
    });

    describe('Mode switching behavior', () => {
      test('braces outside templates are parsed as regular tokens', () => {
        const result = parser.parse('let x = 5; let y = 10;');
        expect(result.parserErrors).toHaveLength(0);
      });

      test('template start switches to interpolation mode', () => {
        const result = parser.parse('let msg = `Counter: ${counter}`;');
        expect(result.parserErrors).toHaveLength(0);

        const stmts = (result.value as any).stmts;
        const stmt = stmts[0];
        const templateLit = stmt.value?.value;

        expect(templateLit.$type).toBe('TemplateLit');
        expect(templateLit.vals.length).toBe(3);
        expect(typeof templateLit.vals[0]).toBe('string');
        expect(typeof templateLit.vals[1]).toBe('object');
        expect(typeof templateLit.vals[2]).toBe('string');
        expect(templateLit.vals[1].$type).toBe('PrimaryExpr');
      });
    });

    describe('Invalid syntax (TPL_END/TPL_BTWN outside interpolation mode)', () => {
      test('fails on TPL_END pattern at top level', () => {
        const result = parser.parse('}foobar`;');
        expect(result.lexerErrors.length).toBeGreaterThan(0);
      });

      test('fails on TPL_END pattern after statement', () => {
        const result = parser.parse('let x = 5; } text`;');
        expect(result.lexerErrors.length).toBeGreaterThan(0);
      });

      test('fails on TPL_BTWN pattern at top level', () => {
        const result = parser.parse('} text ${y};');
        expect(result.parserErrors.length).toBeGreaterThan(0);
      });

      test('fails on TPL_BTWN pattern after statement', () => {
        const result = parser.parse('let x = 1; } foo ${bar};');
        expect(result.parserErrors.length).toBeGreaterThan(0);
      });
    });
  });
});
