import { readdir } from 'node:fs/promises';

async function main() {
  const examplesDir = 'examples';
  const files = await readdir(examplesDir);

  for (const file of files) {
    if (!file.endsWith('.pr')) continue;

    const filePath = `${examplesDir}/${file}`;
    const content = await Bun.file(filePath).text();

    console.log(`\n=== ${file} ===`);
    console.log(content);
  }
}

main();
