// Logros. Cada uno se evalúa sobre el estado real (no se desbloquean "por abrir").
import { streak, masteryLevel, competencyMastery } from './progress.js';

const count = obj => Object.values(obj).filter(v => v.completedAt).length;

export const ACHIEVEMENTS = [
  { id: 'first-lesson', icon: 'spark', title: 'Primer paso', desc: 'Completa tu primera lección.', test: s => count(s.lessons) >= 1 },
  { id: 'perfect', icon: 'target', title: 'Sin fallos', desc: 'Termina una lección con el 100% a la primera.', test: s => s.stats.perfect >= 1 },
  { id: 'first-mission', icon: 'flag', title: 'Manos a la obra', desc: 'Resuelve tu primera misión.', test: s => count(s.missions) >= 1 },
  { id: 'prompts-30', icon: 'chat', title: 'Conversador', desc: 'Envía 30 peticiones al Copilot simulado.', test: s => s.stats.commands >= 30 },
  { id: 'streak-3', icon: 'flame', title: 'Hábito en marcha', desc: 'Mantén una racha de 3 días.', test: s => streak(s) >= 3 },
  { id: 'streak-7', icon: 'flame', title: 'Semana completa', desc: 'Mantén una racha de 7 días.', test: s => streak(s) >= 7 },
  { id: 'review-5', icon: 'refresh', title: 'Memoria de largo plazo', desc: 'Completa 5 sesiones de repaso.', test: s => s.stats.reviews >= 5 },
  { id: 'module-1', icon: 'check', title: 'Buen comienzo', desc: 'Supera la evaluación del módulo 1.', test: (s, c) => s.exams[c.modules[0].id]?.passed },
  { id: 'prompt-pro', icon: 'target', title: 'Decisiones de modelo', desc: 'Supera las decisiones del módulo de Excel; requiere contraste del entregable.', test: (s, c) => s.exams[c.modules[1].id]?.passed },
  { id: 'modeler', icon: 'chart', title: 'Modelizador', desc: 'Supera la evaluación del módulo de modelización.', test: (s, c) => s.exams[c.modules[1].id]?.passed },
  { id: 'reporter', icon: 'file', title: 'Narrativa financiera', desc: 'Completa las decisiones de documentación; no certifica calidad del documento.', test: (s, c) => s.exams[c.modules[2].id]?.passed },
  { id: 'researcher', icon: 'book', title: 'Investigador', desc: 'Supera la evaluación del módulo de investigación.', test: (s, c) => s.exams[c.modules[3]?.id]?.passed },
  { id: 'agent-maker', icon: 'agents', title: 'Método de agentes', desc: 'Completa las decisiones de diseño; prueba el agente en tu entorno.', test: (s, c) => s.exams[c.modules[0].id]?.passed },
  { id: 'lab-5', icon: 'flask', title: 'Experimentador', desc: 'Supera 5 retos del laboratorio.', test: s => Object.keys(s.lab).length >= 5 },
  { id: 'xp-1000', icon: 'bolt', title: '1.000 XP', desc: 'Acumula 1.000 puntos de experiencia.', test: s => s.xp >= 1000 },
  { id: 'balanced', icon: 'chart', title: 'Decisiones equilibradas', desc: 'Llega al 60% de aciertos de práctica en todas las competencias.', test: (s, c) => competencyMastery(s, c).every(x => x.mastery >= 60) },
  { id: 'l4', icon: 'trophy', title: 'Práctica avanzada', desc: 'Supera las evaluaciones locales de los módulos 1 a 4. No acredita dominio profesional.', test: (s, c) => ['L4', 'L5'].includes(masteryLevel(s, c)) },
];

/** Desbloquea los logros conseguidos y devuelve los nuevos. */
export function checkAchievements(state, course) {
  const unlocked = [];
  for (const a of ACHIEVEMENTS) {
    if (!state.achievements[a.id] && a.test(state, course)) {
      state.achievements[a.id] = new Date().toISOString();
      unlocked.push(a);
    }
  }
  return unlocked;
}
