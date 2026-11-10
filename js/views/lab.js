// Laboratorio: Copilot simulado libre y persistente + retos rápidos con objetivos verificables.
import { h } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { confirmSheet, toast } from '../ui/fx.js';
import { Copilot } from '../sim/copilot.js';
import { createChat } from '../ui/chat-view.js';
import { runSession } from './session.js';
import { isLabUnlocked, completeLab, XP } from '../core/progress.js';

// Espacio de trabajo de ejemplo del laboratorio (empresa y datos ficticios).
export const SANDBOX_FILES = {
  'OneDrive/Cierre octubre/Informe_cierre_octubre.docx': 'Informe de cierre · octubre 2026 (Brisa Alimentación, empresa ficticia)\n\nVentas: 412.000 € (+6 % sobre presupuesto).\nMargen bruto: 31,5 % (presupuesto: 33 %).\nGastos de transporte: 58.400 € (+18 %), por el cambio de proveedor logístico.\nRiesgo: dos clientes concentran el 27 % de las ventas.\nPendiente: confirmar la provisión de insolvencias del cliente Norte.\n',
  'OneDrive/Cierre octubre/Ventas_octubre.xlsx': 'Región | Ventas (€) | Coste (€) | Presupuesto (€)\nNorte | 118.000 | 84.200 | 110.000\nCentro | 162.000 | 109.900 | 150.000\nSur | 132.000 | 88.100 | 128.000\n',
  'Outlook/Hilo_proveedor_logistica.eml': 'De: Compras · Para: Finanzas · Asunto: Nueva tarifa logística\n\n[Compras] El proveedor sube la tarifa un 12 % desde noviembre.\n[Finanzas] ¿Está aprobado? No figura en el presupuesto.\n[Compras] Pendiente de firma; necesitamos respuesta antes del viernes.\n',
  'Teams/Comite_cierre_2026-11-03.meet': 'Reunión: Comité de cierre · 3 nov 2026 · Transcripción activada\n\nAna (dirección financiera): el margen cae por el transporte; quiero alternativas antes del día 15.\nLuis (control de gestión): preparo una comparativa de tres proveedores.\nMarta (tesorería): la provisión del cliente Norte sigue sin confirmar.\nAcuerdo: Luis presenta la comparativa el 12 de noviembre.\n',
  'Agentes/': null,
};

// Respuestas preparadas del laboratorio (el resto de peticiones reciben una respuesta genérica).
const SANDBOX_ACTIONS = [
  { id: 'resumen', when: [['resum']], needs: { refs: ['Informe_cierre_octubre.docx'] }, cites: ['Informe_cierre_octubre.docx'],
    reply: ['Cierre de octubre:', '• Ventas de 412.000 € (+6 % sobre presupuesto). [1]', '• Margen bruto del 31,5 % (objetivo: 33 %), por el transporte (+18 %). [1]', '• Riesgo: dos clientes concentran el 27 % de las ventas. [1]', '• Pendiente: provisión del cliente Norte. [1]'] },
  { id: 'margen', when: [['margen']], needs: { agent: 'Analyst', refs: ['Ventas_octubre.xlsx'] }, cites: ['Ventas_octubre.xlsx'],
    reply: ['Pasos: cargo la tabla, calculo (Ventas − Coste) / Ventas por región y ordeno de menor a mayor.', 'Norte 28,6 % · Centro 32,2 % · Sur 33,3 %. Total: 31,5 %.'] },
  { id: 'acuerdos', when: [['acuerdo', 'responsable', 'decidi']], needs: { refs: ['Comite_cierre_2026-11-03.meet'] }, cites: ['Comite_cierre_2026-11-03.meet'],
    reply: ['Acuerdo: Luis presenta la comparativa de proveedores el 12 de noviembre.', 'Petición abierta: Ana quiere alternativas al transporte antes del día 15.', 'Sin confirmar: la provisión del cliente Norte (Marta).'] },
  { id: 'hilo', when: [['correo', 'hilo', 'proveedor', 'tarifa']], needs: { refs: ['Hilo_proveedor_logistica.eml'] }, cites: ['Hilo_proveedor_logistica.eml'],
    reply: ['Compras informa de una subida del 12 % desde noviembre, pendiente de firma y fuera de presupuesto.', 'Necesitan respuesta antes del viernes.'] },
];

function sandboxCopilot(ctx) {
  try {
    if (ctx.state.sandbox?.fs) return new Copilot({ snapshot: ctx.state.sandbox, actions: SANDBOX_ACTIONS });
  } catch { /* copia dañada: se recrea */ }
  return new Copilot({ files: SANDBOX_FILES, actions: SANDBOX_ACTIONS });
}

export function renderLab(page, ctx) {
  const { course, state } = ctx;
  const copilot = sandboxCopilot(ctx);
  page.append(h('header', { class: 'page-head' },
    h('span', { class: 'kicker' }, 'Práctica libre'), h('h1', {}, 'Laboratorio'),
    h('p', { class: 'muted' }, 'Copilot simulado con archivos de un cierre mensual ficticio. Nada se envía ni se conecta a tu cuenta: equivócate sin miedo.')));

  const term = createChat({
    copilot,
    suggestions: [
      'Resume /Informe_cierre_octubre.docx en 5 viñetas para el comité de dirección',
      '@Analyst calcula el margen por región con /Ventas_octubre.xlsx y ordénalo de menor a mayor',
      '¿Qué acuerdos se tomaron en /Comite_cierre_2026-11-03.meet y quién es responsable?',
      '::modo web',
      '::ayuda',
    ],
    intro: ['Bienvenido al laboratorio. Prueba a pedir algo con y sin / y mira cómo cambia el medidor de la petición.', 'Tus archivos se guardan en este dispositivo.'],
    onRun: () => {
      ctx.onCommand();
      state.sandbox = copilot.toJSON();
      ctx.commit();
    },
  });
  page.append(term.el);
  page.append(h('div', { class: 'row end' },
    h('button', {
      class: 'btn btn-ghost btn-sm', type: 'button', onclick: async () => {
        if (await confirmSheet({ title: '¿Reiniciar el laboratorio?', body: 'Se restaurará el proyecto de ejemplo. Tu XP y progreso no cambian.', confirm: 'Reiniciar', danger: true })) {
          state.sandbox = null;
          ctx.commit();
          ctx.refresh();
          toast('Laboratorio restaurado', { iconName: 'refresh' });
        }
      },
    }, icon('refresh', { size: 16 }), 'Reiniciar laboratorio')));

  const done = course.lab.filter(c => state.lab[c.id]).length;
  page.append(h('div', { class: 'card-head section-title' }, h('h2', {}, 'Retos rápidos'), h('span', { class: 'small muted' }, `${done}/${course.lab.length} · ${XP.labChallenge} XP cada uno`)));
  const list = h('div', { class: 'list card' });
  for (const c of course.lab) {
    const open = isLabUnlocked(state, course, c);
    const solved = Boolean(state.lab[c.id]);
    list.append(h('a', { class: `list-row ${open ? '' : 'locked'}`, href: open ? `#/challenge/${c.id}` : null },
      h('span', { class: `list-icon ${solved ? 'k-done' : 'k-lab'}` }, icon(solved ? 'check' : open ? 'flask' : 'lock', { size: 20 })),
      h('div', { class: 'grow' }, h('strong', {}, c.title), h('span', { class: 'small muted' }, open ? c.summary : `Requiere: ${(c.requires || []).map(id => course.lessonById[id]?.title).join(', ')}`)),
      open ? icon('arrow', { size: 18, cls: 'muted' }) : null));
  }
  page.append(list);
  setTimeout(() => { if (matchMedia('(min-width: 900px)').matches) term.focus(); }, 100);
}

export function openLabChallenge(ctx, id) {
  const { course, state } = ctx;
  const c = course.lab.find(x => x.id === id);
  if (!c || !isLabUnlocked(state, course, c)) return false;
  runSession(ctx, {
    kind: 'lab',
    title: c.title,
    steps: [{ ...c.exercise, id: `${c.id}#ex` }],
    exitRoute: '#/lab',
    onFinish: () => {
      const r = completeLab(state, c.id);
      const achievements = ctx.commit();
      return { icon: 'flask', title: 'Reto superado', subtitle: c.title, gained: r.gained, achievements, retryRoute: `#/challenge/${c.id}`, nextRoute: '#/lab' };
    },
  });
}
