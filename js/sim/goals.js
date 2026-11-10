// Objetivos verificables de los ejercicios con Copilot. Se definen en el temario (JSON)
// y se comprueban contra el estado del simulador (peticiones, contexto, archivos), no contra un texto exacto.
import { resolvePath } from './fs.js';
import { parseFrontmatter } from './parse.js';
import { runChecks } from '../core/validate.js';
import { normalize } from '../core/util.js';

export const GOAL_TYPES = ['prompt', 'ran', 'app', 'scope', 'viewed', 'exists', 'absent', 'file', 'frontmatter', 'newchat', 'action'];

function expectMatches(actual, expected) {
  if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
    if ('exists' in expected) return expected.exists ? actual !== undefined && actual !== '' : actual === undefined;
    if ('oneOf' in expected) return expected.oneOf.includes(actual);
    if ('includes' in expected) return [].concat(actual ?? []).some(v => normalize(v).includes(normalize(expected.includes)));
    if ('pattern' in expected) return typeof actual === 'string' && new RegExp(expected.pattern, expected.flags ?? 'i').test(actual);
    if ('min' in expected) return [].concat(actual ?? []).length >= expected.min;
  }
  return JSON.stringify(actual) === JSON.stringify(expected);
}

/** ¿Cumple una petición (evento) las condiciones del objetivo? */
function promptMatches(goal, ev, cp) {
  if (goal.pattern && !new RegExp(goal.pattern, goal.flags ?? 'i').test(normalize(ev.text))) return false;
  if (goal.app && ev.app !== goal.app) return false;
  if (goal.open && ev.open !== cp.find(goal.open)) return false;
  if (goal.scope && ev.scope !== goal.scope) return false;
  if (goal.agent && ev.agent !== goal.agent) return false;
  if (goal.refs && !goal.refs.every(r => ev.refs.includes(cp.find(r)))) return false;
  if (goal.minRefs && ev.refs.length < goal.minRefs) return false;
  if (goal.gces) {
    if (typeof goal.gces === 'number' ? ev.gces.count < goal.gces : !goal.gces.every(k => ev.gces[k])) return false;
  }
  if (goal.turn && ev.turn < goal.turn) return false;
  return true;
}

export function checkGoal(goal, cp) {
  const path = goal.path ? resolvePath(goal.path, '/') : null;
  switch (goal.type) {
    case 'prompt':
      return cp.events.some(ev => ev.type === 'prompt' && promptMatches(goal, ev, cp));
    case 'ran':
      return cp.history.some(t => new RegExp(goal.pattern, goal.flags ?? 'i').test(t));
    case 'app':
      return cp.app === goal.app && (!goal.open || cp.open === cp.find(goal.open));
    case 'scope':
      return cp.scope === goal.value;
    case 'viewed':
      return cp.events.some(ev => ev.type === 'view' && ev.path === (cp.find(goal.path) || path));
    case 'exists':
      return cp.fs.isFile(path);
    case 'absent':
      return !cp.fs.exists(path);
    case 'file': {
      const text = cp.fs.read(path);
      return text !== null && runChecks(text, goal.checks).every(r => r.passed);
    }
    case 'frontmatter': {
      const text = cp.fs.read(path);
      if (text === null) return false;
      const { data, body } = parseFrontmatter(text);
      if (!data) return false;
      if (goal.body && !runChecks(body, goal.body).every(r => r.passed)) return false;
      return Object.entries(goal.expect || {}).every(([k, v]) => expectMatches(data[k], v));
    }
    case 'newchat': {
      // Un chat nuevo DESPUÉS de haber hecho al menos una petición (cambio de tema).
      const i = cp.events.findIndex(ev => ev.type === 'new');
      return i > 0 && cp.events.slice(0, i).some(ev => ev.type === 'prompt');
    }
    case 'action':
      return cp.events.some(ev => ev.type === 'prompt' && ev.action === goal.id);
    default:
      throw new Error(`Tipo de objetivo desconocido: ${goal.type}`);
  }
}

/** Evalúa todos los objetivos y devuelve [{ ...goal, passed }]. */
export function evaluateGoals(goals, cp) {
  return goals.map(g => ({ ...g, passed: checkGoal(g, cp) }));
}
