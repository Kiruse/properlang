import { watch } from 'chokidar';
import { $ } from 'bun';

const grammarPath = 'src/grammar.langium';
const examplesDir = 'examples';

console.log(`Watching ${grammarPath} for changes...`);

const regen = debounce(async () => {
  console.log('Grammar changed, regenerating parser...');
  await $`langium generate`;
  console.log('Parser regenerated.');
  await $`bun run ${import.meta.dirname}/parse-examples.ts`;
});

const reparse = debounce(async () => {
  await $`bun run ${import.meta.dirname}/parse-examples.ts`;
});

watch(grammarPath).on('change', regen);
watch(examplesDir).on('change', reparse);
regen();

function debounce(fn: () => void, delay = 100) {
  let timeout: NodeJS.Timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(fn, delay);
  };
}
