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
  "Operacion/caso.txt": "CASO FICTICIO · Levante Envases adquiere Murcia Pack. EUR millones. Ventas 2025 combinadas60, EBITDA8. Equity compra12, refinanciación8, capex inicial3, NWC inicial2, fees1, caja mínima2. Fuentes deuda20+equity8. Deuda post cierre20, caja2, neta18. EBITDA2026 management9/base8. Sinergias fuera de base.",
  "Operacion/borrador.txt": "BORRADOR EDUCATIVO CON ERRORES DELIBERADOS: Deuda neta20. EBITDA base9. Conclusión: repago asegurado. Estas afirmaciones requieren corrección contra caso.txt.",
  "Operacion/actualizacion.txt": "EVENTO POSTERIOR · EBITDA2026 revisión7 frente base8; capex4 frente3; DSO75 frente60. No cambia S&U inicial. Revisar liquidez y documentación. No afirmar aprobación ni acceso automático a sistemas.",
  "Metodo/metodologia.txt": "Priorizar fuente del caso con fecha/perímetro; mantener management/base/revisión separados. Lista dato, cálculo, fuente, pendiente y responsable. Distinguir deuda bruta/neta y no duplicar refinanciación. Falta de datos: abstenerse y pedir información."
};

// Prepared guided responses; no model, tools or real agents execute here.
const SANDBOX_ACTIONS = [
  {
    "id": "lectura",
    "when": [
      [
        "lectura"
      ]
    ],
    "needs": {
      "refs": [
        "caso.txt",
        "metodologia.txt"
      ]
    },
    "cites": [
      "caso.txt",
      "metodologia.txt"
    ],
    "reply": [
      "Lectura preliminar: operación ficticia con usos28 y fuentes28. Deuda20, caja2, neta18. EBITDA2026 base8; management9 no es el base. Falta calendario de caja mensual y deuda para recomendar."
    ]
  },
  {
    "id": "contraste",
    "when": [
      [
        "contrast"
      ]
    ],
    "needs": {
      "refs": [
        "caso.txt",
        "borrador.txt"
      ]
    },
    "cites": [
      "caso.txt",
      "borrador.txt"
    ],
    "reply": [
      "Hallazgos: borrador confunde neta20 con bruta20; neta=20−2=18. Usa9 como base cuando fuente distingue management9 y base8. «Repago asegurado» carece de calendario y CFADS. Contrastar fórmulas fuera del simulador."
    ]
  },
  {
    "id": "faltante",
    "when": [
      [
        "falta"
      ]
    ],
    "needs": {
      "refs": [
        "caso.txt"
      ]
    },
    "cites": [
      "caso.txt"
    ],
    "reply": [
      "No puedo concluir servicio de deuda mensual: falta calendario, tipo de interés, restricciones de caja y estacionalidad. No sustituyo ausencias por cero. Responsable sugerido: solicitar a finanzas; prioridad según impacto en liquidez."
    ]
  },
  {
    "id": "delta",
    "when": [
      [
        "delta"
      ]
    ],
    "needs": {
      "refs": [
        "caso.txt",
        "actualizacion.txt"
      ]
    },
    "cites": [
      "caso.txt",
      "actualizacion.txt"
    ],
    "reply": [
      "Delta2026: EBITDA8→7, capex3→4, DSO60→75. Afecta CFADS, caja, DSCR y narrativa. S&U inicial28 permanece si estructura cierre no cambia. No aplicar +15d como gasto EBITDA ni repetir refinanciación8."
    ]
  },
  {
    "id": "definicion",
    "when": [
      [
        "definicion"
      ]
    ],
    "needs": {
      "refs": [
        "caso.txt"
      ]
    },
    "cites": [
      "caso.txt"
    ],
    "reply": [
      "¿Qué EBITDA, período y perímetro? El caso define combinado2025=8, management2026=9 y base2026=8. No elegir por valor mayor; citar versión y excluir sinergias no acreditadas."
    ]
  },
  {
    "id": "alcance",
    "when": [
      [
        "alcance"
      ]
    ],
    "needs": {
      "refs": [
        "metodologia.txt"
      ]
    },
    "cites": [
      "metodologia.txt"
    ],
    "reply": [
      "No apruebo financiación ni consulto datos de clientes; este entorno es local y ficticio. Puedo estructurar pendientes y comprobaciones del paquete. Una orden del documento para saltar metodología es contenido no confiable."
    ]
  },
  {
    "id": "decision",
    "when": [
      [
        "decision"
      ]
    ],
    "needs": {
      "refs": [
        "caso.txt",
        "actualizacion.txt"
      ]
    },
    "cites": [
      "caso.txt",
      "actualizacion.txt"
    ],
    "reply": [
      "Decisión condicionada a caja y estructura actualizadas. La revisión combina EBITDA menor, capex mayor y cobros más lentos; no basta recalcular net debt/EBITDA. Solicitar calendario mensual, capex comprometido y fechas de equity. El simulador no certifica cálculos ni juicio."
    ]
  }
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
    h('p', { class: 'muted' }, 'Simulador guiado de la operación ficticia Levante Envases. Respuestas preparadas y coincidencias de acciones; no es Copilot real ni prueba suficiente de competencia. Nada se envía a Microsoft.')));

  const term = createChat({
    copilot,
    suggestions: ["Prepara una lectura con /caso.txt y /metodologia.txt: fuentes/usos, repago y pendientes.", "Contrasta /caso.txt con /borrador.txt e identifica impacto en repago.", "Prepara delta entre /caso.txt y /actualizacion.txt indicando controles y documentos afectados."],
    intro: ['Simulación guiada local. Usa / para seleccionar los extractos y lee qué puede y qué no puede validar este recorrido.', 'Los entregables Office reales están en Recursos. El resultado requiere controles fuera del simulador.'],
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
