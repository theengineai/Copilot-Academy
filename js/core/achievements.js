// Logros. Cada uno se evalúa sobre el estado real (no se desbloquean "por abrir").
import { streak, masteryLevel, competencyMastery } from './progress.js';

const count = obj => Object.values(obj).filter(v => v.completedAt).length;

export const ACHIEVEMENTS = [
  { id: 'first-lesson', icon: 'spark', title: 'Primer paso', desc: 'Completa tu primera lección.', test: s => count(s.lessons) >= 1 },
  { id: 'perfect', icon: 'target', title: 'Sin fallos', desc: 'Acierta las comprobaciones cerradas de una lección a la primera; el entregable se revisa aparte.', test: s => s.stats.perfect >= 1 },
  { id: 'first-mission', icon: 'flag', title: 'Manos a la obra', desc: 'Registra evidencia y autoevaluación de tu primera misión.', test: s => count(s.missions) >= 1 },
  { id: 'prompts-30', icon: 'chat', title: 'Conversador', desc: 'Envía 30 peticiones al Copilot simulado.', test: s => s.stats.commands >= 30 },
  { id: 'streak-3', icon: 'flame', title: 'Hábito en marcha', desc: 'Mantén una racha de 3 días.', test: s => streak(s) >= 3 },
  { id: 'streak-7', icon: 'flame', title: 'Semana completa', desc: 'Mantén una racha de 7 días.', test: s => streak(s) >= 7 },
  { id: 'review-5', icon: 'refresh', title: 'Memoria de largo plazo', desc: 'Completa 5 sesiones de repaso.', test: s => s.stats.reviews >= 5 },
  { id: 'module-1', icon: 'check', title: 'Buen comienzo', desc: 'Supera la evaluación del módulo 1.', test: (s, c) => s.exams[c.modules[0].id]?.passed },
  { id: 'f3-builder', icon: 'agents', title: 'Contrato de agente', desc: 'Supera las decisiones locales de m2; no acredita ejecución real ni valida el entregable.', test: s => Boolean(s.exams.m2?.passed) },
  { id: 'f3-knowledge', icon: 'book', title: 'Fuentes y pruebas', desc: 'Supera las decisiones locales de m3; no acredita ejecución real ni valida el entregable.', test: s => Boolean(s.exams.m3?.passed) },
  { id: 'f3-studio-topic', icon: 'agents', title: 'Conversación en Studio', desc: 'Supera las decisiones locales de m4; no acredita ejecución real ni valida el entregable.', test: s => Boolean(s.exams.m4?.passed) },
  { id: 'f3-studio-flow', icon: 'bolt', title: 'Contrato de herramienta', desc: 'Supera las decisiones locales de m5; no acredita ejecución real ni valida el entregable.', test: s => Boolean(s.exams.m5?.passed) },
  { id: 'f3-studio-life', icon: 'check', title: 'Ciclo de vida en Studio', desc: 'Supera las decisiones locales de m6; no acredita ejecución real ni valida el entregable.', test: s => Boolean(s.exams.m6?.passed) },
  { id: 'f3-excel', icon: 'chart', title: 'Decisiones en Excel', desc: 'Supera las decisiones locales de m7; no acredita ejecución real ni valida el entregable.', test: s => Boolean(s.exams.m7?.passed) },
  { id: 'f3-research', icon: 'book', title: 'Investigación con evidencia', desc: 'Supera las decisiones locales de m8; no acredita ejecución real ni valida el entregable.', test: s => Boolean(s.exams.m8?.passed) },
  { id: 'f3-documents', icon: 'file', title: 'Comunicación con evidencia', desc: 'Supera las decisiones locales de m9; no acredita ejecución real ni valida el entregable.', test: s => Boolean(s.exams.m9?.passed) },
  { id: 'f3-transfer', icon: 'target', title: 'Transferencia de método', desc: 'Supera las decisiones locales de m10; no acredita ejecución real ni valida el entregable.', test: s => Boolean(s.exams.m10?.passed) },
  { id: 'lab-5', icon: 'flask', title: 'Experimentador', desc: 'Supera 5 retos del laboratorio.', test: s => Object.keys(s.lab).length >= 5 },
  { id: 'xp-1000', icon: 'bolt', title: '1.000 XP', desc: 'Acumula 1.000 puntos de experiencia.', test: s => s.xp >= 1000 },
  { id: 'balanced', icon: 'chart', title: 'Decisiones equilibradas', desc: 'Llega al 60% de aciertos de práctica en todas las competencias.', test: (s, c) => competencyMastery(s, c).every(x => x.mastery >= 60) },
  { id: 'l4', icon: 'trophy', title: 'Práctica avanzada', desc: 'Supera las evaluaciones locales de todos los módulos. No acredita dominio profesional.', test: (s, c) => ['L4', 'L5'].includes(masteryLevel(s, c)) },
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
