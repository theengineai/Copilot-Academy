// Componente visual del Copilot simulado: barra de app y modo, conversación, selectores / y @,
// archivos de práctica y editor. La lógica vive en js/sim/copilot.js; aquí solo se pinta.
import { h, clear } from './dom.js';
import { icon } from './icons.js';
import { sheet } from './fx.js';
import { APPS, APP_IDS, fileKind, appForFile, GCES_LABELS, BUILTIN_AGENTS } from '../sim/copilot.js';
import { basename, displayPath } from '../sim/fs.js';

const KIND_ICON = { word: 'file', excel: 'chart', powerpoint: 'layers', outlook: 'chat', teams: 'agents', page: 'book', agent: 'spark', file: 'file' };
const KIND_LABEL = { word: 'Word', excel: 'Excel', powerpoint: 'PowerPoint', outlook: 'Correo', teams: 'Reunión', page: 'Página', agent: 'Agente', file: 'Archivo' };
const AGENT_TEMPLATE = name => `---\nname: ${name}\ndescription: \nknowledge:\n  - \n---\nInstrucciones:\n- \n`;

/** Texto amable para los controles «::» que se ven en la conversación. */
function controlLabel(cmd) {
  const [name, ...rest] = cmd.slice(2).trim().split(/\s+/);
  const arg = rest.join(' ');
  if (name === 'app') { const [app, ...f] = rest; return `Abres ${APPS[app]?.label || app}${f.length ? ` · ${f.join(' ')}` : ''}`; }
  if (name === 'modo') return `Modo ${arg}`;
  if (name === 'nuevo') return null;
  if (name === 'ver') return `Ver ${arg}`;
  if (name === 'agente') return arg ? `Agente: ${arg}` : 'Sin agente';
  if (name === 'pages') return `Editar en Pages${arg ? `: ${arg}` : ''}`;
  if (name === 'ayuda') return 'Ayuda';
  return null;
}

/** Resalta /referencias y @agentes en el texto del alumno. */
function richPrompt(text) {
  const parts = [];
  let last = 0;
  for (const m of text.matchAll(/(^|\s)([/@][^\s]+)/g)) {
    const start = m.index + m[1].length;
    parts.push(text.slice(last, start));
    parts.push(h('span', { class: m[2][0] === '/' ? 'cp-ref' : 'cp-at' }, m[2]));
    last = start + m[2].length;
  }
  parts.push(text.slice(last));
  return parts;
}

function meter(gces) {
  return h('div', { class: 'cp-meter', 'aria-label': `Petición: ${gces.count} de 4 elementos` },
    ...Object.entries(GCES_LABELS).map(([k, label]) => h('span', { class: `cp-el ${gces[k] ? 'on' : ''}` }, icon(gces[k] ? 'check' : 'target', { size: 12 }), label)));
}

export function createChat({ copilot, suggestions = [], intro = [], onRun, compact = false }) {
  const out = h('div', { class: 'cp-out', role: 'log', 'aria-live': 'polite' });
  const input = h('textarea', {
    class: 'cp-input', rows: 2, autocapitalize: 'sentences', spellcheck: 'true', enterkeyhint: 'send',
    'aria-label': 'Petición a Copilot', placeholder: 'Pregunta a Copilot · / archivos · @ agentes',
  });
  const appBtn = h('button', { class: 'cp-app', type: 'button', onclick: () => openApps() });
  const workBtn = h('button', { type: 'button', onclick: () => exec('::modo trabajo') }, icon('briefcase', { size: 14 }), 'Trabajo');
  const webBtn = h('button', { type: 'button', onclick: () => exec('::modo web') }, icon('globe', { size: 14 }), 'Web');
  const chips = h('div', { class: 'cp-chips' });

  const el = h('div', { class: `cp ${compact ? 'cp-compact' : ''}` },
    h('div', { class: 'cp-bar' },
      appBtn,
      h('div', { class: 'cp-scope', role: 'group', 'aria-label': 'Origen de los datos' }, workBtn, webBtn),
      h('button', { class: 'cp-icon-btn', type: 'button', title: 'Nuevo chat', 'aria-label': 'Nuevo chat', onclick: () => exec('::nuevo') }, icon('plus', { size: 18 }))),
    out,
    chips,
    h('form', { class: 'cp-form', onsubmit: e => { e.preventDefault(); exec(input.value); } },
      input,
      h('div', { class: 'cp-tools' },
        h('button', { class: 'cp-tool', type: 'button', title: 'Añadir un archivo como contexto', onclick: () => pick('/') }, '/'),
        h('button', { class: 'cp-tool', type: 'button', title: 'Invocar un agente', onclick: () => pick('@') }, '@'),
        h('button', { class: 'cp-tool cp-tool-wide', type: 'button', onclick: () => openFiles() }, icon('file', { size: 15 }), 'Archivos'),
        h('span', { class: 'grow' }),
        h('button', { class: 'cp-send', type: 'submit', 'aria-label': 'Enviar' }, icon('send', { size: 16 }), 'Enviar'))),
  );

  function sys(text) { out.append(h('div', { class: 'cp-sys' }, text)); }

  function write(lines) {
    let bubble = null;
    const ensure = () => bubble || (bubble = out.appendChild(h('div', { class: 'cp-msg cp-bot' }, h('span', { class: 'cp-who' }, icon('spark', { size: 13 }), 'Copilot'))));
    let cites = null;
    for (const l of lines) {
      if (l.kind === 'meter') { ensure().append(meter(l.gces)); continue; }
      if (l.kind === 'cite') {
        if (!cites) cites = ensure().appendChild(h('div', { class: 'cp-cites' }));
        cites.append(h('span', { class: 'cp-cite' }, l.text));
        continue;
      }
      if (l.kind === 'doc' || l.kind === 'file') {
        if (l.kind === 'file') bubble = out.appendChild(h('div', { class: 'cp-doc' }, h('div', { class: 'cp-doc-name' }, icon('file', { size: 14 }), l.text.replace(/^📄\s*/, ''))));
        else bubble.append(h('div', { class: 'cp-doc-line' }, l.text || ' '));
        continue;
      }
      if (l.kind === 'dim' && !bubble) { sys(l.text); continue; }
      if (l.kind === 'err' && !bubble) { out.append(h('div', { class: 'cp-sys cp-sys-err' }, l.text)); continue; }
      ensure().append(h('div', { class: `cp-line cp-${l.kind || 'out'}` }, l.text));
    }
    out.scrollTop = out.scrollHeight;
  }

  function refresh() {
    clear(appBtn);
    appBtn.append(icon(copilot.app === 'chat' ? 'chat' : KIND_ICON[copilot.app], { size: 16 }), h('span', { class: 'cp-app-name' }, copilot.where()), h('span', { class: 'cp-caret' }, '▾'));
    workBtn.setAttribute('aria-pressed', String(copilot.scope === 'work'));
    webBtn.setAttribute('aria-pressed', String(copilot.scope === 'web'));
    el.classList.toggle('cp-web', copilot.scope === 'web');
    clear(chips);
    for (const s of suggestions) {
      // Un atajo que termina en espacio se escribe para completarlo; si no, se envía directamente.
      chips.append(h('button', { class: 'chip', type: 'button', onclick: () => { if (s.endsWith(' ')) { input.value = s; input.focus(); } else exec(s); } }, s.startsWith('::') ? (controlLabel(s) || s) : s.trim()));
    }
  }

  function exec(value) {
    const text = String(value ?? '').trim();
    if (!text) return;
    if (!text.startsWith('::')) input.value = '';
    if (text.startsWith('::')) { const label = controlLabel(text); if (label) sys(label); }
    else out.append(h('div', { class: 'cp-msg cp-user' }, ...richPrompt(text)));
    const result = copilot.run(text);
    if (result.action?.type === 'clear') clear(out);
    write(result.lines || []);
    refresh();
    if (result.action?.type === 'edit') openEditor(result.action.path);
    onRun?.(result, text);
  }

  function insert(token) {
    const v = input.value;
    input.value = `${v}${v && !/\s$/.test(v) ? ' ' : ''}${token} `;
    input.focus();
  }

  function pick(kind) {
    const items = kind === '/'
      ? copilot.files().map(p => ({ label: basename(p), sub: displayPath(p), icon: KIND_ICON[fileKind(p)], token: `/${basename(p)}` }))
      : copilot.agentNames().map(n => ({ label: n, sub: BUILTIN_AGENTS[n] || copilot.customAgents().find(a => a.name === n)?.data.description || 'Agente propio', icon: 'spark', token: `@${n}` }));
    const close = sheet(h('div', { class: 'cp-picker' },
      h('h3', {}, kind === '/' ? 'Añadir contexto' : 'Agentes'),
      h('p', { class: 'small muted' }, kind === '/' ? 'Copilot solo usa los archivos a los que tú tienes acceso.' : 'Un agente es Copilot con instrucciones, fuentes y acciones para una tarea concreta.'),
      h('div', { class: 'list' }, ...items.map(it => h('button', { class: 'list-row', type: 'button', onclick: () => { close(); insert(it.token); } },
        h('span', { class: 'list-icon k-lab' }, icon(it.icon, { size: 18 })),
        h('div', { class: 'grow' }, h('strong', {}, it.label), h('span', { class: 'small muted' }, it.sub)))))), { label: kind === '/' ? 'Archivos' : 'Agentes' });
  }

  function openApps() {
    const rows = [];
    for (const id of APP_IDS) {
      const files = copilot.files().filter(p => appForFile(p) === id);
      const go = cmd => { close(); exec(cmd); };
      rows.push(h('div', { class: 'cp-app-row' },
        h('button', { class: 'list-row', type: 'button', onclick: () => go(`::app ${id}`) },
          h('span', { class: 'list-icon k-lab' }, icon(id === 'chat' ? 'chat' : KIND_ICON[id], { size: 18 })),
          h('div', { class: 'grow' }, h('strong', {}, APPS[id].label), h('span', { class: 'small muted' }, id === 'chat' ? 'Conversación general' : 'Sin archivo abierto'))),
        ...files.map(p => h('button', { class: 'list-row cp-sub', type: 'button', onclick: () => go(`::app ${id} ${basename(p)}`) },
          h('span', { class: 'cp-sub-dot' }), h('div', { class: 'grow' }, h('span', {}, basename(p)))))));
    }
    const close = sheet(h('div', { class: 'cp-picker' }, h('h3', {}, '¿Dónde usas Copilot?'),
      h('p', { class: 'small muted' }, 'Dentro de una app, Copilot trabaja sobre el archivo abierto.'),
      h('div', { class: 'list' }, ...rows)), { label: 'Aplicaciones' });
  }

  function openFiles() {
    const go = cmd => { close(); exec(cmd); };
    const rows = copilot.files().map(p => {
      const kind = fileKind(p);
      const app = appForFile(p);
      return h('div', { class: 'cp-file' },
        h('span', { class: 'list-icon k-lab' }, icon(KIND_ICON[kind], { size: 18 })),
        h('div', { class: 'grow cp-file-name' }, h('strong', {}, basename(p)), h('span', { class: 'small muted' }, `${KIND_LABEL[kind]} · ${displayPath(p)}`)),
        h('div', { class: 'cp-file-actions' },
          h('button', { class: 'btn btn-soft btn-sm', type: 'button', onclick: () => go(`::ver ${basename(p)}`) }, 'Ver'),
          app ? h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => go(`::app ${app} ${basename(p)}`) }, 'Abrir') : null,
          kind === 'agent' || kind === 'page' ? h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => go(`::editar ${displayPath(p)}`) }, 'Editar') : null));
    });
    const name = h('input', { class: 'input', type: 'text', placeholder: 'Nombre del agente', 'aria-label': 'Nombre del nuevo agente' });
    const close = sheet(h('div', { class: 'cp-picker' },
      h('h3', {}, 'Archivos de práctica'),
      h('p', { class: 'small muted' }, 'Documentos ficticios. Ábrelos para revisar lo que Copilot escribe.'),
      h('div', { class: 'list' }, ...rows),
      h('form', { class: 'row gap cp-new-agent', onsubmit: e => { e.preventDefault(); const n = name.value.trim(); if (n) go(`::editar Agentes/${n}.agent.md`); } },
        name, h('button', { class: 'btn btn-primary btn-sm', type: 'submit' }, icon('plus', { size: 15 }), 'Nuevo agente'))), { label: 'Archivos' });
  }

  function openEditor(path) {
    const existing = copilot.fs.read(path);
    const area = h('textarea', { class: 'editor-area', spellcheck: 'false', autocapitalize: 'off', autocorrect: 'off', 'aria-label': `Contenido de ${displayPath(path)}` });
    area.value = existing ?? (path.endsWith('.agent.md') ? AGENT_TEMPLATE(basename(path).replace(/\.agent\.md$/, '')) : '');
    const closeEd = () => { overlay.classList.add('out'); setTimeout(() => overlay.remove(), 200); };
    const overlay = h('div', { class: 'editor', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Editor' },
      h('div', { class: 'editor-head' },
        h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: closeEd }, 'Cancelar'),
        h('div', { class: 'editor-name' }, icon('edit', { size: 16 }), basename(path), existing === null ? h('span', { class: 'pill' }, 'nuevo') : null),
        h('button', {
          class: 'btn btn-primary btn-sm', type: 'button', onclick: () => {
            const content = area.value.endsWith('\n') || !area.value ? area.value : area.value + '\n';
            const err = copilot.saveFile(path, content);
            sys(err ? `No se pudo guardar: ${err}` : `Guardado ${displayPath(path)}`);
            closeEd();
            refresh();
            onRun?.({ lines: [], saved: path }, `::guardar ${displayPath(path)}`);
          },
        }, 'Guardar')),
      area,
      h('div', { class: 'editor-foot muted' }, 'Editor del simulador · el archivo solo existe en esta academia'));
    document.body.append(overlay);
    setTimeout(() => area.focus(), 50);
  }

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); exec(input.value); }
  });

  for (const t of intro) sys(t.text ?? t);
  refresh();
  const pending = () => input.value.trim();
  /** Si hay algo escrito sin enviar, lo envía (evita el «lo escribí pero no pulsé enviar»). */
  const flush = () => { const v = pending(); if (v) exec(v); return Boolean(v); };
  return { el, write, focus: () => input.focus({ preventScroll: true }), exec, refresh, copilot, pending, flush };
}
