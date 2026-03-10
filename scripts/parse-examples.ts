import { $ } from 'bun';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import * as YAML from 'yaml';
import { createProperLangParser } from '../src/parser.js';
import { marshalAST } from '../src/utils.js';

async function main() {
  const parser = createProperLangParser();

  const examplesDir = 'examples';
  const files = await readdir(examplesDir);

  const tmpDir = path.resolve(`${import.meta.dirname}/../tmp`);
  try {
    await $`mkdir -p ${tmpDir}`;
  } catch {}

  for (const file of files) {
    if (!file.endsWith('.pr')) continue;

    const filePath = `${examplesDir}/${file}`;
    const content = await Bun.file(filePath).text();

    const logPath = `${tmpDir}/parse-${file}.log`;
    const logContent: string[] = [];

    console.log(`\n=== Parsing ${file} ===`);
    try {
      const result = parser.parse(content);
      if (result.parserErrors.length > 0) {
        logContent.push(`Parse errors:`);
        for (const error of result.parserErrors) {
          const { startLine, endLine, startColumn, endColumn, tokenType } = error.token;
          logContent.push(`---\n[${startLine}:${startColumn}-${endLine}:${endColumn}] ${tokenType.name}: ${error.message}`);
        }
        console.log(`Errors: ${logContent.length} - see ${logPath}`);
      } else {
        logContent.push(`Successfully parsed ${file}`);
        logContent.push(`AST: ${YAML.stringify(marshalAST(result.value))}`);
        console.log(`Success - see ${logPath}`);
      }
    } catch (error: any) {
      logContent.push(`Failed to parse ${file}: ${error.message}`);
      console.error(`Error - see ${logPath}`);
    }

    await Bun.write(logPath, logContent.join('\n'));
  }
}
await main();
