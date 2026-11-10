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
  { id: 'prompt-pro', icon: 'target', title: 'Prompts con método', desc: 'Supera la evaluación del módulo de prompts.', test: (s, c) => s.exams[c.modules[1].id]?.passed },
  { id: 'analyst', icon: 'chart', title: 'Analista', desc: 'Supera la evaluación del módulo de Excel.', test: (s, c) => s.exams[c.modules[3].id]?.passed },
  { id: 'researcher', icon: 'book', title: 'Investigador', desc: 'Supera la evaluación del módulo de investigación.', test: (s, c) => s.exams[c.modules[5]?.id]?.passed },
  { id: 'agent-maker', icon: 'agents', title: 'Creador de agentes', desc: 'Supera la evaluación del módulo de Copilot Studio.', test: (s, c) => s.exams[c.modules.at(-1).id]?.passed },
  { id: 'lab-5', icon: 'flask', title: 'Experimentador', desc: 'Supera 5 retos del laboratorio.', test: s => Object.keys(s.lab).length >= 5 },
  { id: 'xp-1000', icon: 'bolt', title: '1.000 XP', desc: 'Acumula 1.000 puntos de experiencia.', test: s => s.xp >= 1000 },
  { id: 'balanced', icon: 'chart', title: 'Perfil equilibrado', desc: 'Llega al 60% de dominio en todas las competencias.', test: (s, c) => competencyMastery(s, c).every(x => x.mastery >= 60) },
  { id: 'l4', icon: 'trophy', title: 'Nivel L4', desc: 'Supera las evaluaciones de los módulos 1 a 4.', test: (s, c) => ['L4', 'L5'].includes(masteryLevel(s, c)) },
  { id: 'l5', icon: 'crown', title: 'Nivel L5', desc: 'Supera todas las evaluaciones y el proyecto final.', test: (s, c) => masteryLevel(s, c) === 'L5' },
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
