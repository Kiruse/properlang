# ProperLang

A domain-specific language built with Langium for Bun runtime.

## Installation

```bash
bun install
```

## Usage

Run the main entry point:
```bash
bun run src/index.ts
```

Parse a ProperLang file:
```bash
bun run src/index.ts examples/counter.pr
bun run src/index.ts examples/cli.pr
```

Parse all examples:
```bash
bun run parse:examples
```

Parse specific example:
```bash
bun run parse:example counter
bun run parse:example cli
```

## Development

Run with hot reload:
```bash
bun --hot ./src/index.ts
```

Regenerate language server from grammar:
```bash
bun run langium:generate
```

Run tests:
```bash
bun test
```

## Language Syntax

See [docs/GRAMMAR.md](docs/GRAMMAR.md) for the complete syntax reference.

## API Reference

See [docs/API.md](docs/API.md) for parser and validation module documentation.

### Function Calls

Function calls support multiple comma-separated arguments:
```properlang
console.log("Hello", "World");
program.command('bump').option('-s, --silent');
```

### Member Access

Chain property access and method calls:
```properlang
process?.argv[0]
Math.random()
obj.method("arg1", "arg2")
```

### Template Literals

String interpolation with backticks:
```properlang
console.log(`Counter: ${counter}`);
```

### Control Flow

```properlang
if condition:
  stmt

unless error:
  stmt

for let i in 0..10:
  stmt

while running:
  stmt
```

### Variable Declarations

```properlang
let counter = 0;
const name = "ProperLang";
let { prop1, prop2 } = obj;
```

### Imports

```properlang
import { Command } from 'commander';
import * as fs from 'fs/promises';
import types from './types.pr';
```

## Project Structure

```
src/
  index.ts              # Main entry point
  grammar.langium       # Grammar definition
  parser.ts             # Parser factory
  parser.spec.ts        # Parser unit tests
  validation.ts         # AST validation rules
  generated/            # Auto-generated (do not edit)
examples/
  counter.pr            # Counter example
  cli.pr                # CLI example with method chains
syntaxes/
  properlang.tmLanguage.json  # TextMate grammar
  properlang.monarch.ts       # Monarch tokenizer
```

## Examples

The `examples/` directory contains sample ProperLang programs:

- `counter.pr` - Demonstrates variables, loops, and template literals
- `cli.pr` - Demonstrates imports, method chains with multiple arguments

## Requirements

- [Bun](https://bun.com) v1.3.9 or later
