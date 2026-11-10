// Utilidades compartidas por los tests (Node 20+, sin dependencias).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildCourse, CONTENT_FILES } from '../js/core/course.js';
import { copilotFromSetup } from '../js/sim/copilot.js';
import { resolvePath } from '../js/sim/fs.js';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export function readJson(rel) {
  return JSON.parse(readFileSync(join(ROOT, rel), 'utf8'));
}

export function loadRaw() {
  return {
    course: readJson(CONTENT_FILES.course),
    missions: readJson(CONTENT_FILES.missions),
    lab: readJson(CONTENT_FILES.lab),
    modules: CONTENT_FILES.modules.map(readJson),
  };
}

export function loadCourse() {
  return buildCourse(loadRaw());
}

/** Todos los ejercicios del temario, incluidos los del laboratorio. */
export function allExercises(course) {
  const list = Object.values(course.exercises).map(e => e.exercise);
  for (const c of course.lab) list.push({ ...c.exercise, id: `${c.id}#ex` });
  return list;
}

/**
 * Ejecuta la solución de un ejercicio con Copilot. «::editar <ruta>» escribe el contenido de
 * solutionFiles (lo que el alumno haría en el editor).
 */
export function runSolution(ex) {
  const cp = copilotFromSetup(ex.setup);
  for (const input of ex.solution) {
    const result = cp.run(input);
    if (result.action?.type === 'edit') {
      const file = (ex.solutionFiles || []).find(f => resolvePath(f.path, '/') === result.action.path);
      if (!file) throw new Error(`${ex.id}: falta solutionFiles para ${result.action.path}`);
      const err = cp.saveFile(result.action.path, file.content);
      if (err) throw new Error(`${ex.id}: no se pudo guardar ${file.path}: ${err}`);
    }
  }
  return cp;
}
