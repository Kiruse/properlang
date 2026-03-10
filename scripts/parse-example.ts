import * as YAML from 'yaml';
import { createProperLangParser } from '../src/parser.js';
import { marshalAST } from '../src/utils.js';

async function main() {
  const exampleName = process.argv[2];

  if (!exampleName) {
    console.error('Usage: bun run scripts/add-example.ts <example-name>');
    console.error('Example: bun run scripts/add-example.ts counter');
    process.exit(1);
  }

  const fileName = exampleName.endsWith('.pr') ? exampleName : `${exampleName}.pr`;
  const filePath = `examples/${fileName}`;

  const parser = createProperLangParser();

  let content: string;
  try {
    content = await Bun.file(filePath).text();
  } catch (error: any) {
    console.error(`Failed to read ${filePath}: ${error.message}`);
    process.exit(1);
  }

  console.log(`\n=== Parsing ${fileName} ===`);
  try {
    const result = parser.parse(content);
    if (result.parserErrors.length > 0) {
      console.error(`Parse errors:`);
      for (const error of result.parserErrors) {
        const { startLine, endLine, startColumn, endColumn, tokenType } = error.token;
        console.error(`[${startLine}:${startColumn}-${endLine}:${endColumn}] ${tokenType.name}: ${error.message}`);
      }
      process.exit(1);
    }

    console.log(`AST: ${YAML.stringify(marshalAST(result.value))}`);
  } catch (error: any) {
    console.error(`Failed to parse ${fileName}: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

await main();
