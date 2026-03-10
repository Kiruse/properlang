# ProperLang API Reference

## Parser Module (`src/parser.ts`)

### `createProperLangParser(): LangiumParser`

Creates and returns a configured LangiumParser instance for ProperLang.

```ts
import { createProperLangParser } from './parser.js';

const parser = createProperLangParser();
const result = parser.parse('let x = 42;');
console.log(result.value);      // AST
console.log(result.parserErrors);     // Parser errors
console.log(result.lexerErrors);      // Lexer errors
console.log(result.validationErrors); // Validation errors
```

## Validation Module (`src/validation.ts`)

### `validate(ast: AstNode): ValidationError[]`

Validates an AST node and returns an array of validation errors. Traverses the entire AST tree.

```ts
import { validate } from './validation.js';

const errors = validate(astNode);
for (const err of errors) {
  console.log(`${err.message} at ${err.node.$type}.${err.property}`);
}
```

### `ValidationError` Interface

```ts
interface ValidationError {
  message: string;    // Error description
  node: AstNode;      // AST node where error occurred
  property: string;   // Property name on the node
}
```

### Validation Rules

| Rule | Description |
|------|-------------|
| Parameter constraints | Parameters in `FnDecl` and `ArrowExpr` must have type constraints unless used as callback arguments |
