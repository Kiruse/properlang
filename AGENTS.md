# ProperLang - Agent Guidelines

**IMPORTANT:** Assert that your changes function properly by running `bun parse:examples`. If the examples do not parse successfully, you may run `bun parse:example <name>` to parse a specific example and get its detailed errors.

## Build Commands

### Core Commands
- `bun install` - Install dependencies
- `bun run src/index.ts` - Run the main entry point
- `bun run langium:generate` - Regenerate language server from grammar
- `bun build <file>` - Build TypeScript files

### Testing
- `bun test` - Run all tests
- `bun test <file.test.ts>` - Run a specific test file

### Development
- `bun --hot ./src/index.ts` - Run with hot reload (HMR)
- Generated files are in `src/generated/language-server/` - DO NOT EDIT MANUALLY

### Scripts
Utility scripts in `scripts/` directory:
- `bun run scripts/parse-example.ts <name>` - Parse named example & print result
- `bun run scripts/parse-examples.ts` - Parse all `.pr` files in `examples/`, output logs to `tmp/`
- `bun run scripts/list-examples.ts` - Print contents of all example files
- `bun run scripts/watch-grammar.ts` - Watch grammar file, regenerate parser and reparse examples on change

## Code Style Guidelines

### TypeScript Configuration
- Target: ESNext with strict mode enabled
- Type checking: strict with `noUncheckedIndexedAccess` and `noImplicitOverride`
- Module system: ES modules with bundler resolution
- JSX: react-jsx (for future frontend work)
- `verbatimModuleSyntax: true` - Use `.js` extensions in imports

### Import Style
```ts
// ES module imports with .js extensions (required by verbatimModuleSyntax)
import * as langium from 'langium';
import { ProperLangAstReflection } from './ast.js';
```

### Type Definitions
- Use TypeScript interfaces for all data structures
- Leverage Langium's generated AST types from grammar
- Type imports should use `import type` when possible
- Use `satisfies` operator for type assertions instead of `as`

### Naming Conventions
- Files: kebab-case (e.g., `grammar.langium`, `properlang.monarch.ts`)
- Classes: PascalCase (e.g., `ProperLangLanguageMetaData`)
- Constants: PascalCase (e.g., `ProperLangTerminals`)
- Functions/Variables: camelCase (e.g., `langiumGenerate`)
- Interfaces: PascalCase (e.g., `LanguageMetaData`)
- Type aliases: PascalCase (e.g., `ProperLangTokenNames`)

### Grammar Definitions (.langium files)
- Use camelCase for grammar rule names
- Terminal names: SCREAMING_SNAKE_CASE (e.g., `STRING_DOUBLE`)
- Entry rule: `entry Program`
- Keep terminals at the top, parser rules below
- Use descriptive names for rules, not abbreviated

### Error Handling
- Use Langium's validation system for language-specific errors
- Return validation errors via `ValidationAcceptor`
- Type-safe error messages with proper AST node references

### Formatting
- No formal linter configured - maintain consistency with existing code
- Use meaningful indentation (follow tsconfig preferences)
- Generated files include headers with "DO NOT EDIT MANUALLY" - respect these

### Langium-Specific Patterns
- Define languages in `langium-config.json`
- File extension: `.pl` for ProperLang files
- Case-insensitive parsing
- Generate both TextMate (`.tmLanguage.json`) and Monarch (`.monarch.ts`) syntax definitions
- Use Langium's Module system for dependency injection

### Project Structure
```
src/
  index.ts              # Main entry point
  grammar.langium       # Grammar definition (EDIT THIS)
  parser.ts             # Parser factory
  parser.spec.ts        # Parser unit tests (template literals, interpolation, mode switching)
  validation.ts         # AST validation (validate, ValidationError, parameter constraints)
  generated/            # Auto-generated (DO NOT EDIT)
    language-server/
      ast.ts           # AST node definitions
      grammar.ts       # Generated parser
      module.ts        # Langium module
scripts/
  parse-example.ts      # Parse example & print result
  parse-examples.ts     # Parse all examples, write logs to tmp/
  list-examples.ts      # Print all example file contents
  watch-grammar.ts      # Watch grammar, regenerate and reparse on change
examples/
  counter.pr            # Counter example (variables, loops, templates)
  cli.pr                # CLI example (imports, method chains)
docs/
  GRAMMAR.md            # Language syntax reference
  API.md                # Parser and validation API documentation
syntaxes/
  properlang.tmLanguage.json  # TextMate grammar (generated)
  properlang.monarch.ts       # Monarch tokenizer (generated)
```

### Development Workflow
1. Edit `src/grammar.langium` to modify language syntax
2. Run `bun run langium:generate` to regenerate AST, parser, and module
3. Generated files are overwritten - never edit them manually
4. Use generated types and modules in custom language server logic

### Testing Guidelines
- Use `bun test` framework
- Test files: `*.spec.ts` suffix
- Import from `bun:test`: `import { describe, test, expect } from 'bun:test';`
- Focus on grammar correctness and parser behavior
- Test error cases and edge cases in language semantics
- Parser tests (`src/parser.spec.ts`) cover template literals, interpolation, and mode switching

### Environment
- Runtime: Bun (not Node.js)
- Auto-loads `.env` files (no dotenv needed)
- Prefer Bun APIs: `Bun.file`, `Bun.serve`, `Bun.$` over Node equivalents
- Use `bun:sqlite`, `Bun.redis`, `Bun.sql` for database operations if needed

### Git Ignore Patterns
- `node_modules/`, `out/`, `dist/`
- `*.tsbuildinfo`, `.eslintcache`, `.cache`
- `.env`, `*.log`, coverage reports
