// Copilot simulado para los ejercicios y el laboratorio.
// No hay IA ni red: reproduce la FORMA de trabajar con Microsoft 365 Copilot (dónde se pregunta,
// qué contexto se aporta con /, qué agente se invoca con @, modo Trabajo o Web) y responde de forma
// determinista según lo que declare cada ejercicio. Cada respuesta lo deja claro.
import { VirtualFS, resolvePath, dirname, basename, displayPath } from './fs.js';
import { parseFrontmatter } from './parse.js';
import { normalize } from '../core/util.js';

const line = (text, kind = 'out', extra = {}) => ({ text, kind, ...extra });
export const SIM = 'Simulación: aquí no hay IA real';

/** Aplicaciones del simulador y las extensiones de archivo que abre cada una. */
export const APPS = {
  chat: { label: 'Copilot Chat', ext: [] },
  word: { label: 'Word', ext: ['.docx'] },
  excel: { label: 'Excel', ext: ['.xlsx'] },
  powerpoint: { label: 'PowerPoint', ext: ['.pptx'] },
  outlook: { label: 'Outlook', ext: ['.eml'] },
  teams: { label: 'Teams', ext: ['.meet'] },
};
export const APP_IDS = Object.keys(APPS);

/** Etiquetas de confidencialidad, de menos a más restrictiva (como las de Microsoft Purview). */
export const LABELS = ['General', 'Confidencial', 'Altamente confidencial'];
const labelRank = l => LABELS.indexOf(l);

/** Agentes integrados (además de los que el alumno define en Agentes/*.agent.md). */
export const BUILTIN_AGENTS = {
  Researcher: 'Investiga en varios pasos combinando datos de trabajo y web; pregunta antes de empezar y entrega un informe con citas.',
  Analyst: 'Razona sobre datos (Excel, CSV): ejecuta código Python para calcular y muestra cómo ha llegado al resultado.',
};

/** Tipo de archivo según su extensión (para iconos y para elegir la app). */
export function fileKind(path) {
  const name = basename(path).toLowerCase();
  if (name.endsWith('.agent.md')) return 'agent';
  const ext = name.slice(name.lastIndexOf('.'));
  return { '.docx': 'word', '.xlsx': 'excel', '.pptx': 'powerpoint', '.eml': 'outlook', '.meet': 'teams', '.page': 'page', '.loop': 'page' }[ext] || 'file';
}

export function appForFile(path) {
  const k = fileKind(path);
  return APPS[k] ? k : null;
}

// ---------- Análisis del prompt: Objetivo, Contexto, Expectativas y Fuente ----------
// Es una heurística didáctica (palabras y estructuras típicas), no una evaluación con IA.

const GOAL_RE = /\b(resume|resumir|redacta|redactar|escribe|escribir|crea|crear|prepara|preparar|analiza|analizar|compara|comparar|propon|proponer|genera|generar|enumera|lista|extrae|extraer|calcula|calcular|revisa|revisar|traduce|reescribe|reescribir|convierte|convertir|identifica|identificar|organiza|organizar|explica|explicar|sugiere|sugerir|elabora|elaborar|haz|dame|busca|buscar|encuentra|clasifica|agrupa|destaca|responde|responder|planifica|disena|anade|crea|actualiza|detecta|detectar|recomienda|mejora|mejorar|acorta|amplia|ordena|filtra|resalta|formatea|transforma|investiga|investigar|valida|comprueba|que (dice|paso|se decidio|tengo|hay)|cuales|cuantos|cuanto|como)\b/;
const CONTEXT_RE = /\b(para (que|el|la|los|las|mi|mis|un|una|nuestro|nuestra|direccion|presentar|enviar|decidir|explicar|el comite|compartir)|porque|ya que|dado que|soy |somos |mi equipo|nuestro equipo|el objetivo|contexto|audiencia|publico|dirigid[oa]s? a|destinad[oa]|el cliente|la reunion de|el comite|estamos|tenemos que|se trata de|antes de)\b/;
const EXPECT_RE = /\b(tabla|vinetas|lista|puntos|parrafos?|palabras|lineas|diapositivas|tono|formal|cercano|breve|corto|maximo|como maximo|columnas?|resumen ejecutivo|en formato|titulos?|secciones|grafico|frases|bullets|esquema|apartados|en espanol|en ingles|una pagina|negrita|ordenad[oa]s? por|con (fecha|responsable|importe)|incluye|incluir|sin (jerga|tecnicismos))\b|\b\d+\s*(palabras|lineas|puntos|ideas|diapositivas|frases|filas|preguntas|opciones|riesgos|acciones|apartados|columnas|vinetas)\b|\d+([.,]\d+)?\s*(%|€|euros)|\ben (rojo|verde|negrita|columnas|barras)\b|\b(inferior|superior|mayor|menor)(es)? (a|al|que)\b/;
const SOURCE_RE = /\b(usa|usando|utiliza|segun|basate|basandote|a partir de|con los datos|del archivo|del documento|del correo|de la reunion|adjunto|de la hoja|de la tabla|de este|de esta|en este|en esta|solo con|unicamente con)\b/;

/** Devuelve { goal, context, expectations, source, count } para un texto de petición. */
export function analyzePrompt(text, refs = []) {
  const t = normalize(text);
  const r = {
    goal: GOAL_RE.test(t),
    context: CONTEXT_RE.test(t),
    expectations: EXPECT_RE.test(t),
    source: refs.length > 0 || SOURCE_RE.test(t),
  };
  r.count = [r.goal, r.context, r.expectations, r.source].filter(Boolean).length;
  return r;
}
export const GCES_LABELS = { goal: 'Objetivo', context: 'Contexto', expectations: 'Expectativas', source: 'Fuente' };

// ---------- Simulador ----------

export class Copilot {
  /**
   * files: { 'OneDrive/Cierre/Informe.docx': 'texto' } · actions: respuestas que sabe dar este ejercicio
   * restricted: rutas que existen pero a las que el alumno NO tiene permiso (Copilot no las ve)
   */
  constructor({ files = {}, app = 'chat', open = null, scope = 'work', actions = [], restricted = [], labels = {}, snapshot = null } = {}) {
    this.actions = actions;
    /** Etiqueta de cada archivo: { ruta absoluta: 'Confidencial' }. */
    this.labels = Object.fromEntries(Object.entries(snapshot?.labels || labels).map(([k, v]) => [resolvePath(k, '/'), v]));
    this.restricted = restricted.map(p => resolvePath(p, '/'));
    if (snapshot) {
      this.fs = VirtualFS.fromJSON(snapshot.fs);
      Object.assign(this, { app: snapshot.app, open: snapshot.open, scope: snapshot.scope, history: snapshot.history || [], events: [], turns: 0, agent: null });
    } else {
      this.fs = new VirtualFS(files);
      this.app = APPS[app] ? app : 'chat';
      this.open = open ? resolvePath(open, '/') : null;
      this.scope = scope === 'web' ? 'web' : 'work';
      this.history = [];
      this.events = [];
      this.turns = 0;
      this.agent = null;
    }
    this.lastReply = null;
  }

  toJSON() {
    return { fs: this.fs.toJSON(), app: this.app, open: this.open, scope: this.scope, labels: this.labels, history: this.history.slice(-50) };
  }

  /** Texto corto de dónde estás: «Word · Informe.docx · Trabajo». */
  where() {
    const app = APPS[this.app].label;
    return `${app}${this.open ? ` · ${basename(this.open)}` : ''}${this.agent ? ` · @${this.agent}` : ''}`;
  }

  labelOf(path) {
    return this.labels[path] || null;
  }

  /** La etiqueta más restrictiva entre varias rutas (la que hereda el contenido generado a partir de ellas). */
  strongestLabel(paths) {
    return paths.map(p => this.labelOf(p)).filter(Boolean).sort((a, b) => labelRank(b) - labelRank(a))[0] || null;
  }

  /** Todos los archivos visibles (sin las rutas restringidas). */
  files() {
    return this.fs.walk('/').filter(p => !this.isRestricted(p));
  }

  isRestricted(path) {
    return this.restricted.some(r => path === r || path.startsWith(r + '/'));
  }

  /** Busca un archivo por nombre (sin ruta) o por ruta. Devuelve la ruta absoluta o null. */
  find(name) {
    const clean = String(name).replace(/[.,;:)»"?!]+$/, '');
    const direct = resolvePath(clean, '/');
    if (this.fs.isFile(direct)) return direct;
    const all = this.fs.walk('/');
    const lower = clean.toLowerCase();
    return all.find(p => basename(p).toLowerCase() === lower)
      || all.find(p => basename(p).toLowerCase().replace(/\.[^.]+$/, '') === lower)
      || null;
  }

  customAgents() {
    return this.fs.walk('/').filter(p => p.endsWith('.agent.md')).map(path => {
      const { data, body } = parseFrontmatter(this.fs.read(path));
      return { name: data?.name || basename(path).replace(/\.agent\.md$/, ''), data: data || {}, body, path };
    });
  }

  agentNames() {
    return [...Object.keys(BUILTIN_AGENTS), ...this.customAgents().map(a => a.name)];
  }

  /** Guarda lo escrito en el editor. Devuelve un mensaje de error o null. */
  saveFile(path, content) {
    if (this.isRestricted(path)) return 'no tienes permiso';
    const err = this.fs.mkdir(dirname(path), { parents: true }) || this.fs.write(path, content);
    if (!err) this.events.push({ type: 'save', path });
    return err;
  }

  /** Entrada del alumno: una petición o un control de la interfaz (prefijo «::»). */
  run(raw) {
    const text = String(raw ?? '').trim();
    if (!text) return { lines: [] };
    this.history.push(text);
    if (text.startsWith('::')) return this.control(text.slice(2).trim());
    return this.prompt(text);
  }

  // ---------- Controles de la interfaz ----------

  control(cmd) {
    const [name, ...rest] = cmd.split(/\s+/);
    const arg = rest.join(' ');
    switch (name) {
      case 'app': {
        const [appId, ...fileParts] = rest;
        if (!APPS[appId]) return { lines: [line(`Aplicación desconocida: ${appId}`, 'err')] };
        let open = null;
        if (fileParts.length) {
          open = this.find(fileParts.join(' '));
          if (!open || this.isRestricted(open)) return { lines: [line(`No encuentras «${fileParts.join(' ')}» entre tus archivos.`, 'err')] };
          if (appForFile(open) !== appId) return { lines: [line(`${basename(open)} no se abre con ${APPS[appId].label}.`, 'err')] };
        }
        this.app = appId;
        this.open = open;
        this.agent = null;
        this.events.push({ type: 'app', app: appId, open });
        return { lines: [line(`Abierto: ${this.where()}. ${appId === 'chat' ? 'Copilot Chat trabaja con lo que le pidas y adjuntes.' : `Copilot en ${APPS[appId].label} trabaja sobre ${open ? 'el archivo abierto' : 'el archivo que abras'}.`}`, 'dim')] };
      }
      case 'modo': {
        const scope = normalize(arg) === 'web' ? 'web' : normalize(arg) === 'trabajo' ? 'work' : null;
        if (!scope) return { lines: [line('Usa ::modo trabajo o ::modo web.', 'err')] };
        this.scope = scope;
        this.events.push({ type: 'scope', scope });
        return {
          lines: [line(scope === 'web'
            ? 'Modo Web: las respuestas se basan en la web. Copilot no busca en tu correo, chats ni archivos de trabajo.'
            : 'Modo Trabajo: Copilot puede usar tu correo, reuniones, chats y archivos de trabajo a los que ya tienes acceso.', 'dim')],
        };
      }
      case 'nuevo':
        this.turns = 0;
        this.agent = null;
        this.lastReply = null;
        this.events.push({ type: 'new' });
        return { lines: [line('Nuevo chat: la conversación anterior ya no forma parte del contexto.', 'dim')], action: { type: 'clear' } };
      case 'ver': {
        const path = this.find(arg);
        if (!path) return { lines: [line(`No existe «${arg}».`, 'err')] };
        if (this.isRestricted(path)) return { lines: [line(`No tienes permiso para abrir ${basename(path)}.`, 'err')] };
        this.events.push({ type: 'view', path });
        const label = this.labelOf(path);
        return { lines: [line(`📄 ${displayPath(path)}${label ? ` · 🔒 ${label}` : ''}`, 'file'), ...this.fs.read(path).replace(/\n$/, '').split('\n').map(t => line(t, 'doc'))] };
      }
      case 'editar': {
        const path = arg ? (this.find(arg) || resolvePath(arg, '/')) : null;
        if (!path) return { lines: [line('Indica el archivo: ::editar Agentes/Mi agente.agent.md', 'err')] };
        if (this.isRestricted(path)) return { lines: [line(`No tienes permiso para editar ${basename(path)}.`, 'err')] };
        return { lines: [], action: { type: 'edit', path } };
      }
      case 'agente': {
        if (!arg) { this.agent = null; return { lines: [line('Sin agente: vuelves a Copilot.', 'dim')] }; }
        const name = this.agentNames().find(n => normalize(n) === normalize(arg));
        if (!name) return { lines: [line(`No hay ningún agente llamado «${arg}».`, 'err')] };
        this.agent = name;
        this.events.push({ type: 'agent', agent: name });
        return { lines: [line(`Agente seleccionado: ${name}.`, 'dim')] };
      }
      case 'pages': {
        if (!this.lastReply) return { lines: [line('Primero necesitas una respuesta de Copilot para llevarla a Pages.', 'err')] };
        const title = arg || 'Página de Copilot';
        const path = resolvePath(`Pages/${title}.page`, '/');
        this.fs.mkdir(dirname(path), { parents: true });
        this.fs.write(path, this.lastReply.join('\n') + '\n');
        this.events.push({ type: 'pages', path });
        return { lines: [line(`✎ Creada la página ${displayPath(path)}: un lienzo editable que puedes compartir y seguir trabajando.`, 'ok')] };
      }
      case 'programar': {
        const last = [...this.events].reverse().find(ev => ev.type === 'prompt');
        if (!last) return { lines: [line('Primero escribe la petición que quieres programar.', 'err')] };
        const freq = arg || 'cada semana';
        this.events.push({ type: 'schedule', text: last.text, freq, action: last.action || null });
        return { lines: [line(`⏰ Prompt programado (${freq}): «${last.text}». Cada ejecución dejará su resultado en tus chats.`, 'ok')] };
      }
      case 'ayuda':
        return { lines: this.helpLines() };
      default:
        return { lines: [line(`Control desconocido: ${name}`, 'err')] };
    }
  }

  helpLines() {
    return [
      line('Cómo usar este Copilot simulado:', 'dim'),
      line('• Escribe tu petición como lo harías en Copilot.'),
      line('• / + nombre de archivo lo añade como contexto: «resume /Informe_octubre.docx».'),
      line('• @ + agente lo invoca: «@Researcher …» o un agente propio.'),
      line('• Arriba eliges la app (Chat, Word, Excel…), el modo Trabajo/Web y «Nuevo chat».'),
      line('• En Archivos puedes ver cada documento (y editar los agentes).'),
      line(SIM, 'dim'),
    ];
  }

  // ---------- Peticiones ----------

  /** Referencias «/Archivo» de una petición (las que existen y las que no). */
  parseRefs(text) {
    const found = [];
    const missing = [];
    for (const m of text.matchAll(/(?:^|\s)\/([^\s/][^\s]*)/g)) {
      const path = this.find(m[1]);
      if (path) found.push(path); else missing.push(m[1]);
    }
    return { found: [...new Set(found)], missing };
  }

  parseAgent(text) {
    const m = /(?:^|\s)@([\wÁÉÍÓÚÑáéíóúñ-]+)/.exec(text);
    if (!m) return { name: this.agent, unknown: null };
    const name = this.agentNames().find(n => normalize(n) === normalize(m[1]));
    // Como en el producto, el agente invocado sigue activo en esa conversación hasta abrir un chat nuevo.
    if (name) this.agent = name;
    return name ? { name, unknown: null } : { name: this.agent, unknown: m[1] };
  }

  prompt(text) {
    this.turns += 1;
    const out = [];
    const { found, missing } = this.parseRefs(text);
    const { name: agent, unknown } = this.parseAgent(text);
    const refs = [];
    const blocked = [];
    for (const p of found) (this.isRestricted(p) ? blocked : refs).push(p);
    // En el modo Web no se usan los datos de trabajo.
    const usable = this.scope === 'web' ? [] : refs;
    const gces = analyzePrompt(text, refs);
    const event = { type: 'prompt', text, refs: usable, webRefs: this.scope === 'web' ? refs : [], agent, app: this.app, open: this.open, scope: this.scope, gces, turn: this.turns };
    this.events.push(event);

    out.push(line('', 'meter', { gces }));
    if (unknown) out.push(line(`@${unknown}: no hay ningún agente con ese nombre. Disponibles: ${this.agentNames().join(', ')}.`, 'warn'));
    for (const m of missing) out.push(line(`/${m}: no aparece entre tus archivos.`, 'warn'));
    for (const p of blocked) out.push(line(`${basename(p)}: no tienes permiso sobre ese archivo, así que Copilot tampoco puede leerlo.`, 'warn'));
    if (this.scope === 'web' && refs.length) out.push(line('Estás en modo Web: Copilot no usará tus archivos de trabajo. Cambia a Trabajo si los necesitas.', 'warn'));
    for (const p of usable) out.push(line(`→ Contexto: ${displayPath(p)}`, 'ctx'));
    if (this.open && this.app !== 'chat') out.push(line(`→ Contexto: el archivo abierto en ${APPS[this.app].label} (${basename(this.open)})`, 'ctx'));

    const action = this.matchAction(text);
    if (action) out.push(...this.perform(action, event));
    else out.push(...this.generic(event));
    out.push(line('Contenido generado por IA: revísalo antes de usarlo. · ' + SIM, 'dim'));
    return { lines: out };
  }

  matchAction(text) {
    const t = normalize(text);
    const matches = this.actions.filter(a => (a.when || []).every(group => group.some(p => new RegExp(p, 'i').test(t))));
    // Si encajan varias, se prefiere una que aún no se haya completado en esta conversación.
    const done = new Set(this.events.filter(ev => ev.type === 'prompt' && ev.action).map(ev => ev.action));
    return matches.find(a => !done.has(a.id)) || matches[0] || null;
  }

  /** Qué le falta a una petición para que la acción se pueda hacer. */
  unmet(action, event) {
    const n = action.needs || {};
    const miss = [];
    if (n.app && event.app !== n.app) miss.push(n.say?.app || `Esto se hace con Copilot en ${APPS[n.app].label}${n.open ? ` con ${basename(resolvePath(n.open, '/'))} abierto` : ''}.`);
    else if (n.open && event.open !== this.find(n.open)) miss.push(n.say?.open || `Abre ${basename(resolvePath(n.open, '/'))} en ${APPS[appForFile(n.open)]?.label || 'su app'}.`);
    if (n.scope && event.scope !== n.scope) miss.push(n.say?.scope || (n.scope === 'web' ? 'Esta pregunta es sobre información pública: usa el modo Web.' : 'Necesitas el modo Trabajo para usar datos de tu organización.'));
    for (const ref of n.refs || []) {
      const path = this.find(ref);
      if (event.webRefs.includes(path)) miss.push(`Cambia al modo Trabajo para que Copilot pueda usar ${basename(path)}.`);
      else if (!event.refs.includes(path)) miss.push(n.say?.refs || `¿Sobre qué archivo? Escribe / y elige ${basename(ref)} para que forme parte del contexto.`);
    }
    if (n.agent && event.agent !== n.agent) miss.push(n.say?.agent || `Este trabajo encaja con el agente ${n.agent}: invócalo con @${n.agent}.`);
    for (const el of n.gces || []) if (!event.gces[el]) miss.push(n.say?.[el] || `Falta ${GCES_LABELS[el].toLowerCase()}: ${GCES_HINTS[el]}`);
    if (n.turn && event.turn < n.turn) miss.push(n.say?.turn || 'Esta petición se apoya en la respuesta anterior: hazla en la misma conversación.');
    return [...new Set(miss)];
  }

  perform(action, event) {
    const miss = this.unmet(action, event);
    const who = event.agent || 'Copilot';
    if (miss.length) {
      return [line(`${who} (simulado): ${action.vague || 'puedo ayudarte, pero me falta información.'}`, 'warn'), ...miss.map(m => line(`• ${m}`, 'warn'))];
    }
    const out = [];
    event.action = action.id || true;
    const reply = Array.isArray(action.reply) ? action.reply : [action.reply || 'Hecho.'];
    reply.forEach((t, i) => out.push(line(i === 0 ? `${who} (simulado): ${t}` : t, 'copilot')));
    for (const c of action.cites || []) {
      const path = this.find(c);
      out.push(line(`[${(action.cites.indexOf(c) + 1)}] ${path ? displayPath(path) : c}`, 'cite'));
    }
    // El contenido generado hereda la etiqueta más restrictiva de sus fuentes (archivos citados y archivo abierto).
    const inherited = this.strongestLabel([...event.refs, ...(event.open ? [event.open] : [])]);
    for (const w of action.writes || []) {
      const path = resolvePath(w.path, '/');
      this.fs.mkdir(dirname(path), { parents: true });
      const prev = w.append ? (this.fs.read(path) || '') : '';
      this.fs.write(path, prev + w.content);
      out.push(line(`✎ ${w.append ? 'Añadido a' : 'Creado'} ${displayPath(path)} · ábrelo en Archivos para revisarlo`, 'ok'));
      const current = this.labelOf(path);
      if (inherited && (!current || labelRank(inherited) > labelRank(current))) {
        this.labels[path] = inherited;
        out.push(line(`🔒 Etiqueta heredada: ${inherited} (la más restrictiva de sus fuentes)`, 'ctx'));
      }
    }
    this.lastReply = reply;
    return out;
  }

  generic(event) {
    const who = event.agent || 'Copilot';
    const out = [];
    const custom = this.customAgents().find(a => a.name === event.agent);
    if (custom) {
      if (!custom.data.description) out.push(line(`El agente ${custom.name} no tiene descripción: a las personas les costará saber para qué sirve.`, 'warn'));
      const knowledge = [].concat(custom.data.knowledge || []);
      if (/deriv|no (lo )?se|fuera de|no est[aá] cubiert/i.test(custom.body)) {
        out.push(line(`${who} (simulado): esa pregunta no está cubierta por mis fuentes${knowledge.length ? ` (${knowledge.join(', ')})` : ''}. Sigo mis instrucciones: no invento y te indico a quién acudir.`, 'copilot'));
      } else {
        out.push(line(`${who} (simulado): no encuentro la respuesta en mis fuentes, pero mis instrucciones no dicen qué hacer en ese caso. Podría improvisar: añade una regla de derivación.`, 'warn'));
      }
      this.lastReply = [out.at(-1).text];
      return out;
    }
    if (event.agent === 'Researcher') {
      out.push(line('Researcher (simulado): antes de empezar te haría 2–3 preguntas para acotar el alcance, después investigaría varios minutos y entregaría un informe con citas.', 'copilot'));
    } else if (event.agent === 'Analyst') {
      const data = event.refs.filter(p => /\.(xlsx|csv)$/i.test(p));
      out.push(line(data.length
        ? `Analyst (simulado): cargaría ${data.map(basename).join(', ')}, escribiría código Python para calcular lo que pides y te enseñaría el código y los pasos.`
        : 'Analyst (simulado): ¿con qué datos trabajo? Referencia una hoja de cálculo con /.', data.length ? 'copilot' : 'warn'));
    } else if (event.gces.count <= 1) {
      out.push(line(`${who} (simulado): tu petición es muy abierta; la respuesta sería genérica y difícil de comprobar.`, 'warn'));
      for (const el of Object.keys(GCES_LABELS).filter(k => !event.gces[k])) out.push(line(`• Añade ${GCES_LABELS[el].toLowerCase()}: ${GCES_HINTS[el]}`, 'warn'));
    } else {
      const where = event.app !== 'chat' ? ` en ${APPS[event.app].label}` : '';
      const base = event.refs.length ? ` a partir de ${event.refs.map(basename).join(', ')}` : event.scope === 'web' ? ' con información de la web' : '';
      out.push(line(`${who} (simulado): prepararía una respuesta${where}${base}. Como esto es una simulación, no hay un resultado preparado para esta petición concreta.`, 'copilot'));
      const gaps = Object.keys(GCES_LABELS).filter(k => !event.gces[k]);
      if (gaps.length) out.push(line(`Para afinarla: ${gaps.map(k => GCES_LABELS[k].toLowerCase()).join(' y ')}.`, 'dim'));
    }
    this.lastReply = out.map(l => l.text);
    return out;
  }
}

/** Crea el simulador a partir del «setup» de un ejercicio del temario. */
export function copilotFromSetup(setup = {}) {
  return new Copilot({ files: setup.files || {}, app: setup.app, open: setup.open, scope: setup.scope, actions: setup.actions || [], restricted: setup.restricted || [], labels: setup.labels || {} });
}

export const GCES_HINTS = {
  goal: 'qué quieres exactamente (resume, compara, redacta…).',
  context: 'para quién o para qué es y por qué lo necesitas.',
  expectations: 'formato, extensión y tono (tabla, 5 viñetas, 150 palabras…).',
  source: 'qué información debe usar (/archivo, el correo, la reunión…).',
};
