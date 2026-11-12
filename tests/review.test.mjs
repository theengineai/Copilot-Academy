// Controles independientes de riesgos de la edición: una autoevaluación nunca es evidencia semántica.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validate } from '../js/core/validate.js';
import { defaultState } from '../js/core/state.js';
import { recordAnswer } from '../js/core/progress.js';
import { ROOT } from './helpers.mjs';

const read = path => readFileSync(`${ROOT}/${path}`, 'utf8');

test('una rúbrica completa registra revisión propia sin elevar aciertos o dominio', () => {
  const ex = { id: 'review-portfolio', type: 'portfolio', concept: 'review.figures', rubric: ['Consistencia', 'Trazabilidad'] };
  const answer = { evidence: 'He revisado las celdas del libro y queda pendiente corregir la fuente del EBITDA.', scores: [0, 1], criticalErrors: true };
  const result = validate(ex, answer);
  assert.equal(result.ok, true, 'se puede registrar trabajo incompleto sin acreditarlo');
  assert.equal(result.detail.semanticValidation, false);
  assert.equal(result.detail.selfAssessed, true);
  const state = defaultState();
  const before = JSON.stringify({ stats: state.stats, concepts: state.concepts });
  recordAnswer(state, ex, true);
  assert.equal(JSON.stringify({ stats: state.stats, concepts: state.concepts }), before);
  assert.equal(validate(ex, { ...answer, scores: [4, 3] }).ok, false);
  assert.equal(validate(ex, { ...answer, criticalErrors: undefined }).ok, false);
});

test('los escenarios distinguen resultado, flujo y caja de forma consistente', () => {
  const rows = JSON.parse(read('content/resources/resultados-control.json'));
  const assumptions = [[.10,.16,6,.15],[.15,.18,6,.15],[.05,.14,8,.18]];
  for (let i=0;i<assumptions.length;i++) {
    const [growth,margin,capex,nwcRatio]=assumptions[i], v=rows[i]['2026'];
    const sales=110*(1+growth), ebitda=sales*margin, tax=Math.max(0,(ebitda-5-1.5)*.25);
    const delta=sales*nwcRatio-16.5, cfo=ebitda-tax-1.5-delta;
    const eq=(a,b)=>assert.ok(Math.abs(a-b)<1e-8, `${a} != ${b}`);
    eq(v['12'],cfo);eq(v['13'],cfo-capex);eq(v['17'],8+cfo-capex-3);eq(v['19'],27);eq(v['20'],27-v['17']);
  }
  assert.ok(rows[2]['2026']['17']<rows[0]['2026']['17']);
  assert.notEqual(rows[0]['2026']['3'],rows[0]['2026']['17'],'EBITDA is not cash');
});

test('registro de capacidad incluye límites operativos y ninguna validación de tenant', () => {
  const doc = read('docs/CAPACIDADES.md');
  for (const term of ['Agent Builder', 'Analyst', 'Researcher', 'Pages', 'Notebooks', 'Cowork', 'Copilot Studio', 'Only use specified sources', 'facturación', '12-11-2026']) {
    assert.ok(doc.includes(term), `falta ${term}`);
  }
  assert.match(doc, /tenant/i);
  assert.match(doc, /conocimiento general/i);
  assert.match(doc, /Python/i);
});
