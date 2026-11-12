// Pantalla de inicio: continuar, objetivo diario, racha, nivel y recomendaciones.
import { h } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { ring } from '../ui/fx.js';
import { localDay, addDays, formatNumber } from '../core/util.js';
import {
  nextStep, recommendations, streak, todayXp, rankInfo, masteryLevel, overallMastery, moduleProgress,
} from '../core/progress.js';
import { dueConcepts } from '../core/srs.js';
import { savedProgress } from './session.js';

const DAY_NAMES = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

export function renderHome(page, ctx) {
  const { course, state } = ctx;
  const next = nextStep(state, course);
  const s = streak(state);
  const today = todayXp(state);
  const goal = state.settings.dailyGoal;
  const rank = rankInfo(state.xp);
  const level = masteryLevel(state, course);
  const levelInfo = course.levels.find(l => l.id === level);
  const due = dueConcepts(state).length + Object.keys(state.mistakes).length;

  page.append(
    h('header', { class: 'top' },
      h('div', { class: 'brand' }, h('img', { src: 'icons/icon.svg', alt: '', width: 34, height: 34 }), h('div', {}, h('strong', {}, 'Copilot'), h('span', {}, 'Academy'))),
      h('div', { class: 'top-stats' },
        h('span', { class: `pill pill-flame ${s ? 'on' : ''}`, title: 'Racha de días' }, icon('flame', { size: 16 }), String(s)),
        h('span', { class: 'pill pill-xp', title: 'Experiencia' }, icon('bolt', { size: 16 }), formatNumber(state.xp)))),
  );

  page.append(h('section', { class: 'card' },
    h('h2', {}, 'Dominar Copilot · edición 3'),
    h('p', {}, 'Aprende a elegir herramientas, construir agentes y trabajar con Copilot Studio. Ejemplos financieros que puedes trasladar a tu especialidad. Las prácticas locales no acreditan ejecución real.'),
    h('p', { class: 'small muted' }, 'Construcción de agentes: módulos 2–6. Copilot Studio: 9 lecciones con temas, variables, herramientas, flujos y ciclo de vida. Adapta los ejemplos a tu función.'),
    state.history?.length ? h('p', { class: 'callout' }, 'Tu edición anterior se ha archivado sin trasladar competencias. Puedes exportarla junto al progreso actual desde Perfil.') : null,
    h('details', {}, h('summary', {}, 'Materiales y laboratorios · descargar'),
    h('p', { class: 'small muted' }, 'Disponibles sin conexión tras completar la descarga inicial.'),
    h('div', { class: 'stack' },
      ...[['capacidades.md','Herramientas, licencias y alternativas'],['agentes.md','Guía para construir agentes'],['studio-lab.md','Laboratorios de Copilot Studio'],['pruebas-agentes.json','Pruebas y fallos de agentes'],['modelo.xlsx','Libro para prácticas de Excel y Analyst'],['expediente.docx','Fuentes financieras de ejemplo'],['documento-trabajo.docx','Documento profesional para mejorar'],['presentacion.pptx','Presentación editable'],['historicos.csv','Históricos para reconciliar'],['comparables.csv','Datos comparables de ejemplo'],['actualizacion.eml','Información nueva para incorporar'],['aclaracion.eml','Aclaración de fuentes'],['metodologia.md','Reglas de trazabilidad'],['soluciones.md','Soluciones comentadas']].map(([file,label]) => h('a', { class: 'btn btn-soft', href: `content/resources/${file}`, download: file }, label))))));

  // Tarjeta principal: continuar.
  if (next) {
    const mod = next.module || course.moduleById[course.missionById[next.id]?.module];
    const prog = mod ? moduleProgress(state, course, mod.id) : null;
    const lesson = next.kind === 'lesson' ? course.lessonById[next.id] : null;
    page.append(h('a', { class: 'hero', href: next.route },
      h('div', { class: 'hero-text' },
        h('span', { class: 'kicker' }, mod ? `Módulo ${mod.index} · ${mod.title}` : 'Proyecto final'),
        h('h1', {}, next.title),
        h('p', {}, lesson ? lesson.summary : next.kind === 'exam' ? 'Contrasta decisiones para desbloquear el siguiente módulo.' : 'Diseña y prueba tu propio sistema de trabajo con Copilot.'),
        h('span', { class: 'btn btn-primary btn-hero' }, icon('play', { size: 18 }), (() => {
          const partial = savedProgress(state, `${next.kind}:${next.id}`);
          return partial ? `Continuar · paso ${partial.furthest + 1}` : state.xp ? 'Continuar' : 'Empezar';
        })()),
      ),
      h('div', { class: 'hero-art', 'aria-hidden': 'true' },
        h('div', { class: 'mini-term' }, h('span', {}, 'Prueba tu agente'), h('span', {}, 'con fuentes y controles'), h('span', { class: 'cursor' }, '▍')),
        prog ? h('div', { class: 'hero-prog' }, `${prog.done}/${prog.total}`) : null),
    ));
  } else {
    page.append(h('div', { class: 'hero hero-done' }, h('div', { class: 'hero-text' },
      h('span', { class: 'kicker' }, 'Ruta completada'), h('h1', {}, 'Has terminado la academia'),
      h('p', {}, 'Mantén el dominio con el repaso inteligente y los retos del laboratorio.'),
      h('a', { class: 'btn btn-primary btn-hero', href: '#/review' }, icon('refresh', { size: 18 }), 'Repasar'))));
  }

  // Objetivo diario + nivel.
  const goalRing = ring(today / goal, { size: 64, stroke: 7 });
  goalRing.append(h('span', { class: 'ring-label' }, `${Math.min(100, Math.round((today / goal) * 100))}%`));
  page.append(h('section', { class: 'grid-2' },
    h('div', { class: 'card stat-card' }, goalRing, h('div', {},
      h('span', { class: 'kicker' }, 'Objetivo diario'),
      h('strong', { class: 'stat' }, `${today} / ${goal} XP`),
      h('span', { class: 'small muted' }, today >= goal ? '¡Cumplido hoy!' : `Te faltan ${goal - today} XP`))),
    h('a', { class: 'card stat-card', href: '#/profile' },
      h('div', { class: 'level-badge' }, level),
      h('div', {},
        h('span', { class: 'kicker' }, 'Avance de prácticas'),
        h('strong', { class: 'stat' }, levelInfo?.title || level),
        h('span', { class: 'small muted' }, `${overallMastery(state, course)}% en comprobaciones · rango ${rank.rank}`))),
  ));

  // Semana de racha.
  const days = [];
  const todayKey = localDay();
  for (let i = 6; i >= 0; i--) {
    const d = addDays(todayKey, -i);
    const [y, m, dd] = d.split('-').map(Number);
    const active = d in state.daily;
    days.push(h('div', { class: `day ${active ? 'on' : ''} ${d === todayKey ? 'today' : ''}` },
      h('span', {}, DAY_NAMES[new Date(y, m - 1, dd).getDay()]),
      h('span', { class: 'day-dot' }, active ? icon('flame', { size: 14 }) : String(dd))));
  }
  page.append(h('section', { class: 'card' },
    h('div', { class: 'card-head' }, h('h2', {}, 'Tu racha'), h('span', { class: 'muted small' }, s === 1 ? '1 día' : `${s} días`)),
    h('div', { class: 'week' }, days),
    h('p', { class: 'small muted' }, s ? 'Completa una actividad hoy para mantenerla.' : 'Completa una lección, misión o repaso para encender la racha.')));

  // Rango XP.
  page.append(h('section', { class: 'card' },
    h('div', { class: 'card-head' }, h('h2', {}, `Rango ${rank.rank}`), h('span', { class: 'muted small' }, `${formatNumber(state.xp)} / ${formatNumber(rank.to)} XP`)),
    h('div', { class: 'bar' }, h('div', { class: 'bar-fill', style: { width: `${Math.round(rank.progress * 100)}%` } }))));

  // Recomendaciones.
  const recs = recommendations(state, course);
  if (recs.length) {
    const kinds = { review: 'refresh', lesson: 'book', exam: 'trophy', mission: 'flag' };
    page.append(h('section', { class: 'card' },
      h('div', { class: 'card-head' }, h('h2', {}, 'Qué estudiar ahora')),
      h('div', { class: 'list' }, recs.map(r => h('a', { class: 'list-row', href: r.route },
        h('span', { class: `list-icon k-${r.kind}` }, icon(kinds[r.kind] || 'spark', { size: 20 })),
        h('div', { class: 'grow' }, h('strong', {}, r.title), h('span', { class: 'small muted' }, r.why)),
        icon('arrow', { size: 18, cls: 'muted' }))))));
  }

  // Repaso.
  page.append(h('a', { class: 'card review-cta', href: '#/review' },
    h('span', { class: 'list-icon k-review' }, icon('refresh', { size: 22 })),
    h('div', { class: 'grow' }, h('strong', {}, 'Repaso inteligente'),
      h('span', { class: 'small muted' }, due ? `${due} elementos pendientes según tus errores y el calendario de repaso.` : 'Al día. Vuelve cuando el calendario lo indique.')),
    due ? h('span', { class: 'count' }, String(due)) : icon('check', { size: 20, cls: 'ok-ink' })));

  page.append(h('a', { class: 'card lab-cta', href: '#/lab' },
    h('div', { class: 'grow' }, h('span', { class: 'kicker' }, 'Del concepto a la práctica'), h('strong', {}, 'Equivocarte aquí es gratis'),
      h('span', { class: 'small muted' }, 'Practica con un Copilot simulado y archivos ficticios: sin licencia y sin tocar datos reales.')),
    icon('chat', { size: 28 })));
}
