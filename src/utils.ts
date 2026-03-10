export function marshalAST(obj: unknown): unknown {
  const seen = new WeakSet();

  function transform(value: unknown): unknown {
    if (value === null || value === undefined) return value;
    if (typeof value !== 'object') return value;

    if (seen.has(value)) return '[cyclic]';
    seen.add(value);

    if (Array.isArray(value)) {
      return value.map(transform);
    }

    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      if (key.startsWith('$') && key !== '$type') continue;
      result[key] = transform(val);
    }
    return result;
  }

  return transform(obj);
}

/** Unindent the given template to root level, and reindent the interpolations to their respective
 * current levels.
 *
 * **Example:**
 *
 * ```ts
 * const getItem = (content: string) => reindent`
 *   <item>
 *     ${unindent(content)}
 *   </item>
 * `;
 *
 * console.log(reindent`
 *   <list>
 *     ${items.map(getItem)}
 *   </list>
 * `);
 * ```
 *
 * Note: XML is not needed, but is used here to illustrate the structure of the indentations.
 */
export function reindent(strings: TemplateStringsArray, ...interpolations: any[]) {
  // skip first line if it starts with non-whitespace
  const skipFirstLine = !!strings[0]!.match(/^[^\s]/);

  // detect the current smallest indent
  let baseLevel = detectIndent(strings[0]!, skipFirstLine);
  for (let i = 1; i < strings.length; i++) {
    baseLevel = Math.min(baseLevel, detectIndent(strings[i]!, true));
  }

  const reindent = (value: unknown, mode: 'default' | 'skip-first' | 'interpolation', currIndent = 0): string => {
    const text = value + '';
    const lines = text.split('\n');
    const indent = ' '.repeat(currIndent);
    return lines.map((line, i) => {
      if ((mode === 'skip-first' || mode === 'interpolation') && i === 0) return line;
      const matches = line.match(/^\s*/);
      if (mode !== 'interpolation') {
        if (matches![0]!.length < baseLevel) line = line.trimStart();
        else line = line.slice(baseLevel);
      }
      return indent + line;
    }).join('\n');
  }

  let result = reindent(strings[0]!.trimStart(), 'default', 0);
  for (let i = 0; i < interpolations.length; i++) {
    const lastLine = result.substring(result.lastIndexOf('\n') + 1);
    const matches = lastLine.match(/^\s*$/);
    if (matches) {
      result += reindent(interpolations[i]!, 'interpolation', Math.max(0, matches[0]!.length));
    } else {
      result += reindent(interpolations[i]!, 'interpolation');
    }
    result += reindent(strings[i + 1]!, 'skip-first');
  }
  return result.trimEnd();
}

/** Simple version of `reindent` that reduces root indent to 0, but has no awareness of interpolated
 * values.
 */
export function unindent(text: string) {
  const indent = detectIndent(text, true);
  if (indent === 0) return text;
  const lines = text.split('\n');
  return lines.map(line => line.slice(indent)).join('\n');
}

function detectIndent(text: string, skipFirstLine: boolean): number {
  const lines = text.split('\n');
  if (lines.length < 1) return 0;
  if (skipFirstLine) lines.shift();
  let minIndent = Infinity;
  for (const line of lines) {
    if (line.trim() === '') continue;
    const match = line.match(/^\s*/);
    const size = match?.[0]?.length ?? 0;
    minIndent = Math.min(minIndent, size);
  }
  return minIndent;
}
