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

test('los resultados de referencia distinguen beneficio, caja, deuda y déficit de liquidez', () => {
  const rows = JSON.parse(read('content/resources/resultados-control.json'));
  const openingNwc = 60 * (60 + .65 * 40 - .65 * 45) / 365 + 2;
  const assumptions = [[66, 9, 3, 60], [63, 8, 3, 60], [61, 7, 4, 75]];
  for (let i = 0; i < assumptions.length; i++) {
    const [sales, ebitda, capex, dso] = assumptions[i];
    const v = rows[i]['2026'];
    const nwc = sales * (dso + .65 * 40 - .65 * 45) / 365;
    const taxes = Math.max(0, (ebitda - 2 - 20 * .06) * .25);
    const cfads = ebitda - taxes - capex - (nwc - openingNwc);
    const approx = (value, expected) => assert.ok(Math.abs(value - expected) < 1e-8, `${value} != ${expected}`);
    approx(v['14'], cfads);
    approx(v['16'], 20 * .06 + 2);
    approx(v['17'], cfads / 3.2);
    approx(v['20'], 2 + cfads - 3.2);
    approx(v['22'], 18);
    approx(v['23'], 18 - v['20']);
  }
  assert.ok(rows[2]['2026']['20'] > 0 && rows[2]['2026']['20'] < 2, 'el shock conserva caja positiva pero incumple el mínimo educativo de 2');
  assert.ok(rows[2]['2026']['17'] < 1, 'CFADS insuficiente para servicio sin consumir caja');
  assert.ok(rows[1]['2026']['13'] < 0, 'base supone liberar colchón NWC: debe explicarse');
});

test('registro de capacidad incluye límites operativos y ninguna validación de tenant', () => {
  const doc = read('docs/CAPACIDADES.md');
  for (const term of ['Agent Builder', 'Analyst', 'Researcher', 'Pages', 'Notebooks', 'Cowork', 'Copilot Studio', 'Only use specified sources', 'facturación', '12-11-2026']) {
    assert.ok(doc.includes(term), `falta ${term}`);
  }
  assert.match(doc, /no una prueba en el tenant/);
  assert.match(doc, /no bloquea el conocimiento general/);
  assert.match(doc, /no exige instalar Python/i);
});
