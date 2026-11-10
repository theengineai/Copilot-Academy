// Tests del motor: progreso, XP, racha, desbloqueos, repaso, persistencia, validadores y Copilot simulado.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadCourse } from './helpers.mjs';
import { defaultState, loadState, saveState, exportState, importState, STORAGE_KEY } from '../js/core/state.js';
import * as P from '../js/core/progress.js';
import { recordConcept, dueConcepts, buildReviewQueue } from '../js/core/srs.js';
import { checkAchievements } from '../js/core/achievements.js';
import { validate, explainFailure } from '../js/core/validate.js';
import { normalize, addDays, shuffle, seededRandom } from '../js/core/util.js';
import { Copilot, analyzePrompt } from '../js/sim/copilot.js';
import { evaluateGoals } from '../js/sim/goals.js';
import { parseFrontmatter } from '../js/sim/parse.js';

const course = loadCourse();
const memoryStorage = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), m }; };

test('XP: completar una lección suma XP y repetir solo suma la mejora', () => {
  const s = defaultState();
  const r1 = P.completeLesson(s, 'l1-1', 0.5, '2026-11-01');
  assert.equal(r1.gained, P.lessonXp(0.5));
  const r2 = P.completeLesson(s, 'l1-1', 0.5, '2026-11-01');
  assert.equal(r2.gained, 0, 'repetir igual no suma');
  const r3 = P.completeLesson(s, 'l1-1', 1, '2026-11-02');
  assert.equal(r3.gained, P.lessonXp(1) - P.lessonXp(0.5), 'solo la mejora');
  assert.equal(s.xp, P.lessonXp(1));
  assert.equal(s.lessons['l1-1'].stars, 3);
});

test('progreso depende del aprendizaje: suspender un examen no desbloquea el módulo', () => {
  const s = defaultState();
  for (const l of course.modules[0].lessons) P.completeLesson(s, l.id, 1);
  assert.ok(P.isExamUnlocked(s, course, 'm1'));
  assert.ok(!P.isModuleUnlocked(s, course, 'm2'));
  const fail = P.completeExam(s, 'm1', 0.5);
  assert.equal(fail.passed, false);
  assert.equal(fail.gained, 0);
  assert.ok(!P.isModuleUnlocked(s, course, 'm2'));
  const pass = P.completeExam(s, 'm1', 0.75);
  assert.equal(pass.passed, true);
  assert.ok(P.isModuleUnlocked(s, course, 'm2'));
  assert.ok(P.isLessonUnlocked(s, course, 'l2-1'));
  assert.ok(!P.isLessonUnlocked(s, course, 'l2-2'), 'las lecciones se desbloquean en orden');
});

test('desbloqueo secuencial de lecciones y misiones', () => {
  const s = defaultState();
  assert.ok(P.isLessonUnlocked(s, course, 'l1-1'));
  assert.ok(!P.isLessonUnlocked(s, course, 'l1-2'));
  assert.ok(!P.isMissionUnlocked(s, course, 'ms01'));
  P.completeLesson(s, 'l1-1', 1);
  P.completeLesson(s, 'l1-2', 1);
  assert.ok(P.isMissionUnlocked(s, course, 'ms01'));
  assert.ok(!P.isMissionUnlocked(s, course, P.finalMission(course).id), 'proyecto final bloqueado');
});

test('niveles L2 → L5 y rangos de XP', () => {
  const s = defaultState();
  assert.equal(P.masteryLevel(s, course), 'L2');
  for (const m of course.modules.slice(0, 2)) s.exams[m.id] = { passed: true };
  assert.equal(P.masteryLevel(s, course), 'L3');
  for (const m of course.modules.slice(0, 4)) s.exams[m.id] = { passed: true };
  assert.equal(P.masteryLevel(s, course), 'L4');
  for (const m of course.modules) s.exams[m.id] = { passed: true };
  assert.equal(P.masteryLevel(s, course), 'L4', 'L5 exige también el proyecto final');
  s.missions[P.finalMission(course).id] = { completedAt: 'x' };
  assert.equal(P.masteryLevel(s, course), 'L5');
  assert.equal(P.rankInfo(0).rank, 1);
  assert.equal(P.rankInfo(60).rank, 2);
  assert.ok(P.rankInfo(100).progress > 0 && P.rankInfo(100).progress < 1);
});

test('racha: días consecutivos y tolerancia hasta el final del día', () => {
  const s = defaultState();
  for (const d of ['2026-11-05', '2026-11-06', '2026-11-07']) P.touchDay(s, d);
  assert.equal(P.streak(s, '2026-11-07'), 3);
  assert.equal(P.streak(s, '2026-11-08'), 3, 'hoy aún sin actividad: la racha sigue');
  assert.equal(P.streak(s, '2026-11-09'), 0, 'un día sin actividad la rompe');
  P.touchDay(s, '2026-11-01');
  assert.equal(P.bestStreak(s), 3);
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
});

test('repaso espaciado: fallar programa repaso hoy; acertar lo espacia', () => {
  const s = defaultState();
  recordConcept(s, 'ctx.claude-md', false, '2026-11-01');
  assert.equal(s.concepts['ctx.claude-md'].due, '2026-11-01');
  assert.deepEqual(dueConcepts(s, '2026-11-01'), ['ctx.claude-md']);
  recordConcept(s, 'ctx.claude-md', true, '2026-11-01');
  recordConcept(s, 'ctx.claude-md', true, '2026-11-02');
  assert.ok(s.concepts['ctx.claude-md'].due > '2026-11-02');
  assert.ok(s.concepts['ctx.claude-md'].score > 0.3);
});

test('repaso inteligente: prioriza errores y solo usa lecciones vistas', () => {
  const s = defaultState();
  P.completeLesson(s, 'l1-1', 0.5);
  const ex = course.exercises.m1l1e1.exercise;
  P.recordAnswer(s, ex, false);
  const queue = buildReviewQueue(s, course);
  assert.equal(queue[0].id, 'm1l1e1');
  assert.ok(queue.every(e => course.exercises[e.id].source.id === 'l1-1'));
  P.clearMistake(s, 'm1l1e1');
  assert.ok(!s.mistakes.m1l1e1);
});

test('dominio por competencia refleja aciertos y fallos', () => {
  const s = defaultState();
  const before = P.competencyMastery(s, course).find(c => c.id === 'prompt').mastery;
  assert.equal(before, 0);
  for (const c of Object.values(course.concepts).filter(c => c.competency === 'prompt')) recordConcept(s, c.id, true);
  const after = P.competencyMastery(s, course).find(c => c.id === 'prompt').mastery;
  assert.equal(after, 70);
  for (const c of Object.values(course.concepts).filter(c => c.competency === 'prompt')) recordConcept(s, c.id, false);
  assert.ok(P.competencyMastery(s, course).find(c => c.id === 'prompt').mastery < after);
});

test('recomendaciones y siguiente paso', () => {
  const s = defaultState();
  assert.equal(P.nextStep(s, course).id, 'l1-1');
  for (const l of course.modules[0].lessons) P.completeLesson(s, l.id, 1);
  assert.equal(P.nextStep(s, course).kind, 'exam');
  const recs = P.recommendations(s, course);
  assert.ok(recs.some(r => r.kind === 'exam'));
  assert.ok(recs.some(r => r.kind === 'mission'));
});

test('logros se desbloquean por hechos reales', () => {
  const s = defaultState();
  assert.deepEqual(checkAchievements(s, course), []);
  P.completeLesson(s, 'l1-1', 1);
  const got = checkAchievements(s, course).map(a => a.id);
  assert.ok(got.includes('first-lesson') && got.includes('perfect'));
  assert.deepEqual(checkAchievements(s, course), [], 'no se repiten');
});

test('persistencia: guardar, recargar, exportar e importar', () => {
  const storage = memoryStorage();
  const s = defaultState();
  P.completeLesson(s, 'l1-1', 1);
  assert.ok(saveState(storage, s));
  const loaded = loadState(storage);
  assert.equal(loaded.xp, s.xp);
  assert.ok(loaded.lessons['l1-1'].completedAt);

  storage.setItem(STORAGE_KEY, '{roto');
  assert.equal(loadState(storage).xp, 0, 'datos corruptos → estado nuevo');

  const exported = exportState(s);
  const tampered = JSON.parse(exported);
  tampered.state.xp = 999999;
  const imported = importState(JSON.stringify(tampered), P.recomputeXp);
  assert.ok(imported.ok);
  assert.equal(imported.state.xp, s.xp, 'la XP se recalcula, no se acepta la de la copia');
  assert.equal(importState('no json', P.recomputeXp).ok, false);
  assert.equal(importState('{"version":99}', P.recomputeXp).ok, false);
});

test('validadores y feedback específico', () => {
  const multi = { type: 'multi', options: [{ text: 'a', correct: true }, { text: 'b', correct: true }, { text: 'c' }] };
  assert.ok(validate(multi, [1, 0]).ok);
  const r = validate(multi, [0, 2]);
  assert.ok(!r.ok);
  assert.match(explainFailure(multi, r), /faltado/);
  assert.match(explainFailure(multi, r), /no aplica/);
  const fill = { type: 'fill', blanks: [{ accept: ['plan'] }] };
  assert.ok(validate(fill, ['  PLAN ']).ok);
  const editor = { type: 'editor', checks: [{ label: 'JSON', json: true }, { label: 'sin X', pattern: 'X', negate: true }] };
  assert.ok(validate(editor, '{"a":1}').ok);
  assert.ok(!validate(editor, '{"a":1,}').ok);
  assert.equal(normalize('  Árbol   "limpio" '), 'arbol limpio');
  const shuffled = shuffle([1, 2, 3, 4], seededRandom(1));
  assert.notDeepEqual(shuffled, [1, 2, 3, 4]);
  assert.deepEqual([...shuffled].sort(), [1, 2, 3, 4]);
});

const FILES = {
  'OneDrive/Cierre/Informe.docx': 'Ventas: 412.000 €\nMargen: 31,5 %\n',
  'OneDrive/Cierre/Ventas.xlsx': 'Región | Ventas\nNorte | 118.000\n',
  'Teams/Comite.meet': 'Acuerdo: Luis presenta la comparativa.\n',
  'RRHH/Nominas.xlsx': 'secreto\n',
};

test('Copilot simulado: medidor de la petición (objetivo, contexto, expectativas y fuente)', () => {
  assert.equal(analyzePrompt('hola').count, 0);
  const full = analyzePrompt('Resume el informe para el comité de dirección en 5 viñetas', ['/x']);
  assert.deepEqual([full.goal, full.context, full.expectations, full.source], [true, true, true, true]);
  assert.ok(analyzePrompt('Resalta en rojo los márgenes inferiores al 30 %').expectations);
  assert.ok(!analyzePrompt('Resume esto').context);
});

test('Copilot simulado: referencias con /, permisos y modo Web', () => {
  const cp = new Copilot({ files: FILES, restricted: ['RRHH'] });
  const out = cp.run('Resume /Informe.docx en 3 viñetas').lines.map(l => l.text).join('\n');
  assert.match(out, /Contexto: OneDrive\/Cierre\/Informe\.docx/);
  assert.match(out, /Contenido generado por IA/);
  assert.match(cp.run('mira /Nominas.xlsx').lines.map(l => l.text).join('\n'), /no tienes permiso/);
  assert.ok(!cp.files().some(p => p.includes('Nominas')), 'lo restringido no aparece en Archivos');
  assert.match(cp.run('mira /NoExiste.docx').lines.map(l => l.text).join('\n'), /no aparece/);
  cp.run('::modo web');
  const web = cp.run('Resume /Informe.docx').lines.map(l => l.text).join('\n');
  assert.match(web, /modo Web/);
  assert.deepEqual(cp.events.at(-1).refs, [], 'en Web no se usan archivos de trabajo');
  assert.equal(cp.run('¿fin?').lines.length > 0, true);
});

test('Copilot simulado: apps, archivo abierto, agentes y chat nuevo', () => {
  const cp = new Copilot({ files: { ...FILES, 'Agentes/Viajes.agent.md': '---\nname: Viajes\ndescription: Dudas de viajes\n---\nSi no está cubierto, deriva.\n' } });
  assert.equal(cp.run('::app excel Informe.docx').lines[0].kind, 'err', 'un .docx no se abre en Excel');
  cp.run('::app excel Ventas.xlsx');
  assert.equal(cp.app, 'excel');
  assert.equal(cp.open, '/OneDrive/Cierre/Ventas.xlsx');
  assert.match(cp.where(), /Excel · Ventas\.xlsx/);
  assert.deepEqual(cp.agentNames(), ['Researcher', 'Analyst', 'Viajes']);
  assert.match(cp.run('@Viajes ¿cuándo cobro la nómina?').lines.map(l => l.text).join('\n'), /no invento/);
  assert.equal(cp.agent, 'Viajes', 'el agente sigue activo en la conversación');
  assert.match(cp.run('@Desconocido hola').lines.map(l => l.text).join('\n'), /no hay ningún agente/);
  cp.run('::nuevo');
  assert.equal(cp.agent, null);
  assert.equal(cp.turns, 0);
  assert.ok(evaluateGoals([{ type: 'newchat' }, { type: 'app', app: 'excel', open: 'Ventas.xlsx' }], cp).every(g => g.passed));
  const page = cp.run('::pages');
  assert.equal(page.lines[0].kind, 'err', 'sin respuesta previa no hay página');
});

test('Copilot simulado: una acción exige lo que declara y escribe archivos', () => {
  const actions = [{ id: 'nota', when: [['nota']], reply: ['Hecho.'], needs: { app: 'word', refs: ['Informe.docx'], gces: ['expectations'] }, writes: [{ path: 'OneDrive/Nota.docx', content: 'Nota\n' }] }];
  const cp = new Copilot({ files: FILES, actions });
  const vague = cp.run('Haz una nota').lines.map(l => l.text).join('\n');
  assert.match(vague, /Word/);
  assert.ok(!cp.fs.isFile('/OneDrive/Nota.docx'), 'la petición incompleta no escribe');
  cp.run('::app word');
  cp.run('Redacta una nota en 5 apartados a partir de /Informe.docx');
  assert.ok(cp.fs.isFile('/OneDrive/Nota.docx'));
  const goals = evaluateGoals([
    { type: 'action', id: 'nota' }, { type: 'exists', path: 'OneDrive/Nota.docx' },
    { type: 'prompt', app: 'word', refs: ['Informe.docx'], gces: ['expectations'] },
    { type: 'ran', pattern: '^::app word' },
  ], cp);
  assert.ok(goals.every(g => g.passed), JSON.stringify(goals.filter(g => !g.passed)));
  cp.run('::pages Mi página');
  assert.ok(cp.fs.isFile('/Pages/Mi página.page'));
  cp.run('::ver Nota.docx');
  assert.ok(evaluateGoals([{ type: 'viewed', path: 'Nota.docx' }], cp)[0].passed);
});

test('Copilot simulado: el editor guarda agentes y el estado del laboratorio se restaura', () => {
  const cp = new Copilot({ files: FILES });
  assert.equal(cp.run('::editar Agentes/Gastos.agent.md').action.type, 'edit');
  assert.equal(cp.saveFile('/Agentes/Gastos.agent.md', '---\nname: Gastos\ndescription: x\nknowledge:\n  - Politica.docx\n---\nDeriva lo que no sepas.\n'), null);
  const fm = evaluateGoals([{ type: 'frontmatter', path: 'Agentes/Gastos.agent.md', expect: { description: { exists: true }, knowledge: { includes: 'politica' } }, body: [{ label: 'd', pattern: 'deriv' }] }], cp);
  assert.ok(fm[0].passed);
  assert.equal(parseFrontmatter('---\nname: a\nx: true\n---\nbody').data.x, true);
  cp.run('::app teams Comite.meet');
  cp.run('::modo web');
  const copy = new Copilot({ snapshot: JSON.parse(JSON.stringify(cp.toJSON())) });
  assert.equal(copy.app, 'teams');
  assert.equal(copy.scope, 'web');
  assert.ok(copy.fs.isFile('/Agentes/Gastos.agent.md'));
});

test('Copilot simulado: etiquetas de confidencialidad heredadas por el contenido generado', () => {
  const actions = [{ id: 'p', when: [['propuesta']], reply: 'ok', writes: [{ path: 'OneDrive/Propuesta.docx', content: 'x\n' }] }];
  const cp = new Copilot({ files: FILES, actions, labels: { 'OneDrive/Cierre/Informe.docx': 'Confidencial', 'OneDrive/Cierre/Ventas.xlsx': 'Altamente confidencial' } });
  const out = cp.run('Redacta la propuesta con /Informe.docx y /Ventas.xlsx').lines.map(l => l.text).join('\n');
  assert.match(out, /Etiqueta heredada: Altamente confidencial/);
  assert.ok(evaluateGoals([{ type: 'label', path: 'Propuesta.docx', value: 'Altamente confidencial' }], cp)[0].passed);
  assert.match(cp.run('::ver Propuesta.docx').lines[0].text, /Altamente confidencial/);
  const copy = new Copilot({ snapshot: JSON.parse(JSON.stringify(cp.toJSON())) });
  assert.equal(copy.labelOf('/OneDrive/Propuesta.docx'), 'Altamente confidencial', 'la etiqueta se conserva');
  const plain = new Copilot({ files: FILES, actions });
  plain.run('Redacta la propuesta con /Informe.docx');
  assert.equal(plain.labelOf('/OneDrive/Propuesta.docx'), null, 'sin etiquetas en las fuentes no se inventa ninguna');
});

test('Copilot simulado: si encajan varias respuestas, prefiere la que aún no ha dado', () => {
  const actions = [{ id: 'a', when: [['plan']], reply: 'preguntas' }, { id: 'b', when: [['adelante']], reply: 'resultado', needs: { turn: 2 } }];
  const cp = new Copilot({ files: FILES, actions });
  cp.run('Hazme un plan');
  cp.run('Adelante con el plan');
  assert.deepEqual(cp.events.filter(e => e.action).map(e => e.action), ['a', 'b']);
});
