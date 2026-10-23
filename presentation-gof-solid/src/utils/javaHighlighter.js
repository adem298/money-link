const JAVA_KEYWORDS = new Set([
  'public', 'private', 'protected', 'class', 'interface', 'abstract',
  'extends', 'implements', 'static', 'final', 'volatile', 'synchronized',
  'void', 'return', 'new', 'this', 'super', 'if', 'else', 'for', 'while',
  'switch', 'case', 'default', 'break', 'throw', 'throws', 'try', 'catch',
  'boolean', 'int', 'double', 'long', 'float', 'true', 'false', 'null',
  'enum', 'record', 'package', 'import'
]);

const JAVA_TYPES = new Set([
  'String', 'List', 'ArrayList', 'Map', 'HashMap', 'Set', 'Optional',
  'System', 'Runtime', 'Thread', 'IllegalArgumentException',
  'UnsupportedOperationException', 'Objects', 'Collections', 'Comparator',
  'InputStream', 'BufferedInputStream', 'DataInputStream', 'FileInputStream'
]);

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Single-pass tokenizer for Java syntax highlighting.
 * Never mutates already-emitted HTML tags, guaranteeing safe rendering of Java generics (<T>).
 */
export function highlightJava(code) {
  const tokenRegex =
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*")|(@[A-Za-z_]\w*)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_]\w*\b)/g;

  const lines = code.trim().split('\n');
  const rowsHtml = lines
    .map((line, idx) => {
      let result = '';
      let lastIndex = 0;
      tokenRegex.lastIndex = 0;
      let match;

      while ((match = tokenRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          result += escapeHtml(line.slice(lastIndex, match.index));
        }

        const [full, comment, stringLit, annotation, numberLit, ident] = match;

        if (comment !== undefined) {
          result += `<span class="tok-com">${escapeHtml(full)}</span>`;
        } else if (stringLit !== undefined) {
          result += `<span class="tok-str">${escapeHtml(full)}</span>`;
        } else if (annotation !== undefined) {
          result += `<span class="tok-ann">${escapeHtml(full)}</span>`;
        } else if (numberLit !== undefined) {
          result += `<span class="tok-num">${escapeHtml(full)}</span>`;
        } else if (ident !== undefined) {
          if (JAVA_KEYWORDS.has(ident)) {
            result += `<span class="tok-kw">${escapeHtml(ident)}</span>`;
          } else if (JAVA_TYPES.has(ident) || /^[A-Z][A-Za-z0-9_]*$/.test(ident)) {
            result += `<span class="tok-type">${escapeHtml(ident)}</span>`;
          } else {
            const nextChar = line[match.index + ident.length];
            if (nextChar === '(') {
              result += `<span class="tok-fn">${escapeHtml(ident)}</span>`;
            } else {
              result += escapeHtml(ident);
            }
          }
        }

        lastIndex = tokenRegex.lastIndex;
      }

      if (lastIndex < line.length) {
        result += escapeHtml(line.slice(lastIndex));
      }

      return `<tr><td class="code-ln">${idx + 1}</td><td class="code-line">${result || ' '}</td></tr>`;
    })
    .join('');

  return `<table class="code-table" role="presentation"><tbody>${rowsHtml}</tbody></table>`;
}
