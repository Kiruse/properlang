# ProperLang Grammar Reference

## Overview

ProperLang is a domain-specific language with a grammar defined in Langium. This document describes the syntax elements.

## Terminals

### Literals
| Terminal | Description | Example |
|----------|-------------|---------|
| `ID` | Identifiers | `myVar`, `_private` |
| `NUMBER` | Numeric literals | `42`, `3.14`, `1e5` |
| `HEX` | Hexadecimal | `0xFF` |
| `OCT` | Octal | `0o755` |
| `BIN` | Binary | `0b1010` |
| `STRING_SINGLE` | Single-quoted strings | `'hello'` |
| `STRING_DOUBLE` | Double-quoted strings | `"world"` |

### Template Literals
| Terminal | Description |
|----------|-------------|
| `TPL_FULL` | Complete template without interpolation |
| `TPL_START` | Template opening with `${` |
| `TPL_BTWN` | Interpolation continuation |
| `TPL_END` | Template closing |

## Expressions

### Member Access

The `Accessor` rule handles member access chains:

```properlang
obj.prop
obj?.prop       // Null-safe access
obj!.prop       // Non-null assertion
obj.method()
obj.method(a, b, c)
arr[0]
obj?.method()?.chain
```

### Function Calls

The `MemberCallAccessor` rule supports function calls with comma-separated arguments:

```properlang
foo()
foo(a)
foo(a, b)
foo(a, b, c)
```

Method chaining with multiple arguments:
```properlang
program
  .command('bump')
  .option('-s, --silent')
  .option('--amount <value>', 'Amount to bump by', 1);
```

### Binary Expressions

Operator precedence (lowest to highest):
1. `or`, `xor`, `and`, `&&`, `||`
2. `in`, `is`, `!is`, `isnt`, `!in`, `instanceof`, `!instanceof`
3. `<`, `<=`, `>`, `>=`, `==`, `!=`
4. `+`, `-`
5. `*`, `/`, `%`
6. `**` (right associative)

### Prefix/Postfix

```properlang
-x
++x
x++
--x
```

## Statements

### Function Declaration

```properlang
fn name(param: constraint) {
  stmts
}

fn add(a: number, b: number): a + b;
```

### Variable Declaration

```properlang
let name = value;
const name = value;
let { a, b } = obj;
let x: number < 100;
```

### Control Flow

```properlang
if condition:
  consequent

unless condition:
  consequent

for let i in collection:
  body

while condition:
  body
```

### Return

```properlang
return;
return value;
```

## Imports

```properlang
import { Name } from 'module';
import Name from 'module';
import * as Name from 'module';
import types from 'module';
```

## Type Declarations

The `declare` keyword indicates that a definition originates from outside the current package.

### Closed Types

Closed types cannot be refined by dependent packages:

```properlang
type Window = {
  alert: fn(msg: string),
  crypto: SubtleCrypto,
};
```

### Open Types

Open types use `<` instead of `=` and can be refined by packages that depend on this one:

```properlang
// In a registry package:
type RegistryKey < string;
```

Dependent packages can then extend the type:

```properlang
// In a package that depends on the registry:
declare type RegistryKey |= 'user' | 'product' | 'order' in 'my-registry';
```

This pattern is useful for generic registries where dependent packages register specific keys.

### Declare Global Type

Declare types in the global scope, typically for runtime-provided values:

```properlang
// Closed global type
declare global type JSON = {
  parse: (text: string) -> any,
  stringify: (value: any) -> string,
};

// Open global type
declare global type EventName < string;

// Extend a global type
declare global type EventName |= 'click' | 'hover' | 'focus';
```

Use `declare global type` for types that exist at runtime and aren't bound to a specific package.

### Declare Type (Module Extension)

Extend types in another package:

```properlang
declare type Config |= { debug: boolean } in './config';
declare type Route |= '/home' | '/about' in 'my-router';
```

## Value Declarations

Declare external values and functions for type checking:

### Global Declarations

```properlang
declare global const window: Window;
declare global const document: Document;
declare global fn alert(msg: string) -> void;
```

### Module-Scoped Declarations

```properlang
declare const fs: FileSystem in 'fs';
declare fn readFile(path: string) -> string in 'fs/promises';
```

## Constraints

Type constraints for numeric values:
```properlang
let x: number < 100;
let y: 0 < number < 100;
let z: number >= 0;
```

Numeric literals are valid as constraint operands in function parameters and type annotations:
```properlang
fn clamp(value: number < 5) { ... }
fn bounded(x: 0 < number < 10) { ... }
```
