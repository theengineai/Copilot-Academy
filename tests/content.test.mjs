// Integridad del temario: estructura, cantidades mínimas y que cada ejercicio tenga solución válida.
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { loadCourse, loadRaw, allExercises, runSolution } from './helpers.mjs';
import { EXERCISE_TYPES, isExercise } from '../js/core/course.js';
import { validate, runChecks } from '../js/core/validate.js';
import { evaluateGoals, GOAL_TYPES } from '../js/sim/goals.js';
import { copilotFromSetup } from '../js/sim/copilot.js';
import { BLOCK_TYPES_LIST } from './block-types.mjs';

const course = loadCourse();
const exercises = allExercises(course);

test('cantidades mínimas del programa', () => {
  assert.equal(course.modules.length, 10, '10 módulos transferibles');
  // v3 deliberately devotes five full modules to agent construction and Studio, independent of finance specialty.
  assert.equal(course.lessons.length, 30, '30 lecciones, 15 de construcción de agentes/Studio');
  assert.equal(course.missions.length, 15, '15 misiones con práctica adicional de agentes/Studio');
  assert.equal(course.missions.filter(m => m.final).length, 1, 'un proyecto final');
  for (const mod of course.modules) {
    assert.ok(mod.lessons.length >= 3, `${mod.id}: 3+ lecciones`);
    assert.ok((mod.exam.extra || []).length >= 3, `${mod.id}: preguntas propias de evaluación`);
    assert.ok(course.missions.some(m => m.module === mod.id), `${mod.id}: tiene misiones`);
  }
});

test('IDs únicos y conceptos existentes', () => {
  // Se cuentan los ejercicios tal como están en los JSON: el índice del curso es un mapa y ocultaría duplicados.
  const raw = loadRaw();
  const rawIds = [
    ...raw.modules.flatMap(m => [...m.lessons.flatMap(l => l.steps.filter(s => s.id).map(s => s.id)), ...m.exam.extra.map(e => e.id)]),
    ...raw.missions.flatMap(m => m.steps.map(s => s.id)),
  ];
  const dup = rawIds.filter((id, i) => rawIds.indexOf(id) !== i);
  assert.deepEqual(dup, [], `ids de ejercicio duplicados: ${dup.join(', ')}`);
  const ids = new Set();
  for (const ex of exercises) {
    assert.ok(ex.id, 'ejercicio sin id');
    assert.ok(!ids.has(ex.id), `id duplicado: ${ex.id}`);
    ids.add(ex.id);
    assert.ok(EXERCISE_TYPES.includes(ex.type), `${ex.id}: tipo ${ex.type}`);
    assert.ok(course.concepts[ex.concept], `${ex.id}: concepto inexistente ${ex.concept}`);
    assert.ok(ex.prompt && ex.prompt.length > 5, `${ex.id}: sin enunciado`);
    assert.ok(ex.explain && ex.explain.length > 10, `${ex.id}: sin explicación`);
  }
  const lessonIds = new Set(course.lessons.map(l => l.id));
  assert.equal(lessonIds.size, course.lessons.length, 'lecciones con id único');
  for (const m of course.missions) for (const r of m.requires) assert.ok(lessonIds.has(r), `${m.id}: requiere ${r}`);
  for (const c of course.lab) for (const r of c.requires) assert.ok(lessonIds.has(r), `${c.id}: requiere ${r}`);
});

test('cada competencia tiene conceptos practicados en ejercicios', () => {
  const used = new Set(exercises.map(e => e.concept));
  for (const comp of course.competencies) {
    const concepts = Object.values(course.concepts).filter(c => c.competency === comp.id);
    assert.ok(concepts.length >= 3, `${comp.id}: pocos conceptos`);
  }
  for (const c of Object.values(course.concepts)) assert.ok(used.has(c.id), `concepto sin ejercicios: ${c.id}`);
});

test('cada lección combina explicación y práctica', () => {
  for (const l of course.lessons) {
    const cards = l.steps.filter(s => !isExercise(s));
    assert.ok(cards.length >= 2, `${l.id}: al menos 2 tarjetas`);
    assert.ok(l.exercises.length >= 3, `${l.id}: al menos 3 ejercicios`);
    assert.ok(l.exercises.some(e => e.type === 'portfolio'), `${l.id}: entregable con rúbrica`);
    assert.ok(l.exercises.some(e => e.type === 'choice'), `${l.id}: decisión contrastable`);
    // Ritmo: pocas ideas nuevas por lección y lecciones cortas.
    assert.ok(new Set(l.exercises.map(e => e.concept)).size <= 4, `${l.id}: demasiados conceptos nuevos (${[...new Set(l.exercises.map(e => e.concept))].join(', ')})`);
    assert.ok(l.steps.length <= 12, `${l.id}: lección demasiado larga (${l.steps.length} pasos)`);
    assert.ok(l.steps.at(-1).blocks?.length, `${l.id}: cierre con técnicas y decisiones`);
    for (const card of cards) for (const b of card.blocks) assert.ok(BLOCK_TYPES_LIST.includes(b.type), `${l.id}: bloque ${b.type}`);
    assert.ok(l.objectives?.length, `${l.id}: objetivos`);
  }
});

test('las respuestas correctas validan y las incorrectas no', () => {
  for (const ex of exercises) {
    switch (ex.type) {
      case 'choice': {
        const correct = ex.options.map((o, i) => (o.correct ? i : -1)).filter(i => i >= 0);
        assert.equal(correct.length, 1, `${ex.id}: una sola correcta`);
        assert.ok(validate(ex, correct[0]).ok, ex.id);
        const wrong = ex.options.findIndex(o => !o.correct);
        assert.ok(!validate(ex, wrong).ok, ex.id);
        break;
      }
      case 'multi': {
        const correct = ex.options.map((o, i) => (o.correct ? i : -1)).filter(i => i >= 0);
        assert.ok(correct.length >= 1 && correct.length < ex.options.length, `${ex.id}: correctas e incorrectas`);
        assert.ok(validate(ex, correct).ok, ex.id);
        assert.ok(!validate(ex, correct.slice(1)).ok || correct.length === 1, ex.id);
        break;
      }
      case 'order':
        assert.ok(ex.items.length >= 3, ex.id);
        assert.ok(validate(ex, ex.items.map((_, i) => i)).ok, ex.id);
        assert.ok(!validate(ex, ex.items.map((_, i) => i).reverse()).ok, ex.id);
        break;
      case 'match':
        assert.ok(ex.pairs.length >= 3, ex.id);
        assert.ok(validate(ex, ex.pairs.map((_, i) => i)).ok, ex.id);
        break;
      case 'fill': {
        const slots = (ex.template.match(/\{\{\d+\}\}/g) || []).map(s => Number(s.slice(2, -2)));
        for (const i of slots) assert.ok(ex.blanks[i], `${ex.id}: hueco ${i} sin definir`);
        assert.equal(new Set(slots).size, ex.blanks.length, `${ex.id}: huecos y blanks coinciden`);
        for (const b of ex.blanks) if (b.options) assert.ok(b.options.includes(b.answer), `${ex.id}: respuesta entre opciones`);
        const answers = ex.blanks.map(b => b.answer ?? b.accept[0]);
        assert.ok(validate(ex, answers).ok, ex.id);
        break;
      }
      case 'spot':
        assert.ok(ex.faulty.length >= 1 && ex.faulty.every(i => i >= 0 && i < ex.lines.length), `${ex.id}: índices`);
        assert.ok(validate(ex, ex.faulty).ok, ex.id);
        assert.ok(!validate(ex, [...ex.faulty, ex.lines.findIndex((_, i) => !ex.faulty.includes(i))]).ok, ex.id);
        break;
      case 'editor':
        assert.ok(validate(ex, ex.solution).ok, `${ex.id}: la solución no supera los criterios: ${runChecks(ex.solution, ex.checks).filter(r => !r.passed).map(r => r.label).join(', ')}`);
        assert.ok(!validate(ex, ex.starter).ok, `${ex.id}: el texto inicial no debería aprobar`);
        break;
      case 'portfolio': {
        assert.ok(ex.rubric.length >= 4, `${ex.id}: rúbrica del entregable`);
        assert.ok(ex.solution.length > 40, `${ex.id}: solución comentada`);
        assert.ok(!validate(ex, { evidence: '', scores: [], criticalErrors: false }).ok, `${ex.id}: registro vacío`);
        const self = { evidence: 'Archivo modelo.xlsx hoja Modelo celda B10: evidencia registrada por el alumno.', scores: ex.rubric.map(() => 1), criticalErrors: true };
        const result = validate(ex, self);
        assert.ok(result.ok, `${ex.id}: registro débil pero completo permite planificar corrección`);
        assert.equal(result.detail.semanticValidation, false, ex.id);
        assert.equal(result.detail.selfAssessed, true, ex.id);
        assert.ok(!validate(ex, { ...self, scores: ex.rubric.map(() => 4) }).ok, ex.id);
        break;
      }
      case 'copilot':
        break;
      default:
        assert.fail(`tipo sin test: ${ex.type}`);
    }
  }
});

test('los ejercicios con Copilot: el estado inicial no aprueba y la solución sí', () => {
  for (const ex of exercises.filter(e => e.type === 'copilot')) {
    for (const g of ex.goals) {
      assert.ok(GOAL_TYPES.includes(g.type), `${ex.id}: objetivo ${g.type}`);
      assert.ok(g.label, `${ex.id}: objetivo sin etiqueta`);
    }
    const initial = copilotFromSetup(ex.setup);
    assert.ok(evaluateGoals(ex.goals, initial).some(g => !g.passed), `${ex.id}: aprueba sin hacer nada`);
    const cp = runSolution(ex);
    const failed = evaluateGoals(ex.goals, cp).filter(g => !g.passed);
    assert.deepEqual(failed.map(f => f.label), [], `${ex.id}: la solución no cumple todos los objetivos`);
  }
});

test('las acciones simuladas: cada una se activa en la solución y los archivos citados existen', () => {
  for (const ex of exercises.filter(e => e.type === 'copilot')) {
    const cp = runSolution(ex);
    const done = new Set(cp.events.filter(ev => ev.type === 'prompt' && ev.action).map(ev => ev.action));
    for (const a of ex.setup.actions || []) {
      assert.ok(a.id, `${ex.id}: acción sin id`);
      assert.ok(done.has(a.id), `${ex.id}: la solución no llega a completar la acción ${a.id}`);
      for (const c of [...(a.cites || []), ...(a.needs?.refs || [])]) assert.ok(cp.find(c), `${ex.id}: ${a.id} cita ${c}, que no existe`);
    }
  }
});

test('misiones: pasos con título y recompensa', () => {
  for (const m of course.missions) {
    assert.ok(m.steps.length >= 3, `${m.id}: al menos 3 pasos`);
    assert.ok(m.xp > 0 && m.brief && m.scenario && m.summary, `${m.id}: campos`);
    for (const s of m.steps) assert.ok(s.title, `${m.id}/${s.id}: título del paso`);
  }
});

test('las evaluaciones tienen suficientes preguntas', () => {
  for (const mod of course.modules) {
    const pool = mod.lessons.flatMap(l => l.exercises).filter(e => e.type !== 'copilot' && e.type !== 'editor' && e.type !== 'portfolio').length + mod.exam.extra.length;
    assert.ok(pool >= mod.exam.size, `${mod.id}: banco ${pool} < ${mod.exam.size}`);
  }
});

test('sin datos sensibles reales en el contenido', () => {
  const text = JSON.stringify(loadCourse());
  assert.ok(!/ES\d{22}/.test(text), 'sin IBAN');
  assert.ok(!/\b\d{8}[A-HJ-NP-TV-Z]\b/.test(text), 'sin DNI');
  assert.ok(!/sk-ant-|sk-live-/.test(text), 'sin claves de API');
  assert.ok(!/@(?!Researcher|Analyst)[\w.-]+\.(com|es|net|org)\b/.test(text), 'sin direcciones de correo');
});

test('el alumno dirige y revisa: los editores son peticiones o instrucciones, no código', () => {
  for (const ex of exercises.filter(e => e.type === 'editor')) {
    assert.ok(['Tu petición a Copilot', 'Instrucciones del agente', 'Instrucciones personalizadas', 'Tu respuesta'].includes(ex.file), `${ex.id}: editor inesperado (${ex.file})`);
    assert.ok(!ex.checks.some(c => c.json), `${ex.id}: no debe exigir JSON`);
  }
  for (const ex of exercises.filter(e => e.type === 'copilot')) {
    for (const f of ex.solutionFiles || []) assert.ok(/\.agent\.md$|\.page$/.test(f.path), `${ex.id}: solo se editan agentes o páginas (${f.path})`);
  }
});

test('una petición vaga no basta en los ejercicios que dependen de acciones', () => {
  for (const ex of exercises.filter(e => e.type === 'copilot' && e.setup?.actions?.length)) {
    const cp = copilotFromSetup(ex.setup);
    cp.run('haz lo que tengas que hacer');
    assert.ok(evaluateGoals(ex.goals, cp).some(g => !g.passed), `${ex.id}: una petición vaga no debería bastar`);
  }
});

test('las lecciones y misiones apuntan a lecciones que existen y las misiones se desbloquean', () => {
  const ids = new Set(course.lessons.map(l => l.id));
  for (const m of course.missions) for (const r of m.requires) assert.ok(ids.has(r), `${m.id}: requiere ${r}`);
});

test('caso, simulación y entregables con límites explícitos', () => {
  const text = JSON.stringify(loadRaw());
  assert.match(text, /Aurora|Boreal/, 'ejemplos financieros transferibles presentes');
  assert.doesNotMatch(text, /Brisa Alimentación|Levante Envases|Murcia Pack|FARE|Cierre octubre|Monte Carlo obligatorio/, 'sin restos del caso antiguo');
  for (const ex of exercises.filter(e => e.type === 'copilot')) {
    assert.match(ex.prompt + ex.explain, /simulad|guiad/i, `${ex.id}: simulación explícita`);
    const cp = copilotFromSetup(ex.setup);
    for (const action of ex.setup.actions || []) for (const ref of action.needs?.refs || []) assert.ok(cp.find(ref), `${ex.id}: fuente ${ref}`);
  }
  for (const m of course.missions) {
    assert.match(m.scenario, /Entradas|Entrad|modelo|caso|Herramientas|Agent Builder|Copilot Studio/i, `${m.id}: herramienta y materiales`);
    assert.ok(m.steps.every(s => s.type === 'portfolio'), `${m.id}: entregables abiertos, no repetición del simulador`);
  }
});

test('un agente simulado puede fallar por fuente ausente, con razón útil', () => {
  for (const ex of exercises.filter(e => e.type === 'copilot')) {
    const cp = copilotFromSetup(ex.setup);
    // Same task but no selected source: the prepared action must not run.
    const action = ex.setup.actions[0];
    cp.run(action.when[0][0]);
    assert.ok(evaluateGoals(ex.goals, cp).some(g => !g.passed), `${ex.id}: acción no debe completar sin referencias`);
  }
});

test('fixtures de agentes cubren fallos útiles sin fingir ejecución de Copilot', () => {
  const fixtures = JSON.parse(readFileSync(new URL('../content/resources/pruebas-agentes.json', import.meta.url), 'utf8'));
  for (const family of ['normal', 'ambiguo', 'incompleto', 'contradictorio', 'fuera de alcance']) {
    assert.ok(fixtures.tests.some(t => t.family === family), `familia ${family}`);
  }
  for (const f of fixtures.tests) {
    assert.ok(f.input.length > 40 && f.assertions.length >= 2 && f.criticalFail.length > 20, f.id);
    assert.ok(Object.keys(f.files || {}).length >= 1 && Object.values(f.files).every(x => x.length > 40), `${f.id}: paquete reproducible`);
    assert.equal(f.status, 'pending', `${f.id}: no fingir ejecución real`);
  }
  assert.match(fixtures.purpose, /No ejecutadas/, 'fixtures no son validación real de Copilot');
});

test('portfolio se conserva como autoevaluación y queda fuera de examen y repaso', async () => {
  const { examPool } = await import('../js/core/course.js');
  const { defaultState } = await import('../js/core/state.js');
  const { recordAnswer } = await import('../js/core/progress.js');
  const { buildReviewQueue } = await import('../js/core/srs.js');
  const state = defaultState();
  const portfolio = exercises.find(e => e.type === 'portfolio');
  recordAnswer(state, portfolio, true);
  assert.equal(state.stats.answers, 0);
  assert.deepEqual(state.concepts, {});
  for (const mod of course.modules) assert.ok(examPool(course, mod.id).every(e => e.type !== 'portfolio'));
  for (const l of course.lessons) state.lessons[l.id] = { completedAt: '2026-11-12' };
  state.mistakes[portfolio.id] = { count: 1 };
  for (const c of Object.keys(course.concepts)) state.concepts[c] = { due: '2026-11-12', score: 0, box: 0 };
  assert.ok(buildReviewQueue(state, course, { today: '2026-11-12' }).every(e => e.type !== 'portfolio'));
});


test('Studio desarrolla construcción ejecutable y pruebas propias, no solo prompts', () => {
  for (const id of ['m4','m5','m6']) {
    const m=course.moduleById[id];
    assert.equal(m.lessons.length,3);
    assert.ok(m.lessons.every(l=>l.exercises.some(e=>e.type==='portfolio')));
  }
  const text=JSON.stringify(course.moduleById.m5);
  for (const term of ['When an agent calls the flow','Respond to the agent','BaseValue','CurrentValue','Flow checker','403','unicidad']) assert.ok(text.includes(term),term);
  const lab=readFileSync(new URL('../content/resources/studio-lab.md',import.meta.url),'utf8');
  for (const term of ['standard harness','Dataverse','RelativeAvailable','base-negative',"variables('CurrentValue')",'test panel','pending']) assert.ok(lab.includes(term),term);
});
