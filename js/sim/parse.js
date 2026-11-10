// Analizadores pequeños del simulador: frontmatter YAML sencillo y JSON tolerante.

/** Lee el frontmatter YAML sencillo (clave: valor) de un archivo Markdown. */
export function parseFrontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(String(text ?? ''));
  if (!m) return { data: null, body: String(text ?? '') };
  const data = {};
  let lastKey = null;
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (kv) {
      let value = kv[2].trim();
      if (/^(['"]).*\1$/.test(value)) value = value.slice(1, -1);
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      data[kv[1]] = value;
      lastKey = kv[1];
    } else if (lastKey && /^\s+-\s+/.test(line)) {
      const item = line.replace(/^\s+-\s+/, '').trim();
      data[lastKey] = Array.isArray(data[lastKey]) ? [...data[lastKey], item] : (data[lastKey] ? [data[lastKey], item] : [item]);
    }
  }
  return { data, body: String(text).slice(m[0].length) };
}

export function parseJson(text) {
  try { return { value: JSON.parse(text) }; } catch (e) { return { error: e.message }; }
}
