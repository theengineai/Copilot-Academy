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
  "Metodo/contrato.txt": "FICTICIO. Contrato reusable: compara datos solo cuando definición, entidad, período y unidad son explícitos. Ausente no es0. Cita fuentes, muestra cálculo y marca pendientes. No accede a ERP ni publica acciones.",
  "Fuentes/datos.txt": "EXTRACTO FICTICIO: Aurora2024 ventas100M€ EBITDA15M€;2025 ventas110M€ EBITDA17,6M€. Misma definición/perímetro. Boreal2025 ventas80M€ EBITDA12M€; no2024.",
  "Fuentes/contradiccion.txt": "EXTRACTO FICTICIO: nota posterior dice Aurora EBITDA2025=18,1M€ sin explicar ajuste ni aprobación. No sustituye expresamente17,6.",
  "Herramientas/delta.txt": "CONTRATO TOOL EDUCATIVO: Base/Actual Number comparables; Delta=Actual−Base; relativa solo base>0; base0 devuelve RelativeAvailable=false Status=base-zero;403 devuelve failed-permission, no registrado.",
  "Diseño/rutas.txt": "DISEÑO FICTICIO: tema captura Metric/Unit/Period/Base/Actual; rama incompleta debe acabar pendiente y no invocar tool. Variables locales por comparación; Global requiere regla de limpieza al cambiar entidad."
};

// Prepared guided responses; no model, tools or real agents execute here.
const SANDBOX_ACTIONS = [
  {
    "id": "contrato",
    "when": [
      [
        "contrato"
      ]
    ],
    "needs": {
      "refs": [
        "contrato.txt",
        "datos.txt"
      ]
    },
    "cites": [
      "contrato.txt",
      "datos.txt"
    ],
    "reply": [
      "Contrato observado en el recorrido: comparar evidencia ficticia con unidad, definición y período; pedir ausencias; no ejecutar acciones no configuradas. Esta respuesta está preparada y no construye un agente real."
    ]
  },
  {
    "id": "ambiguedad",
    "when": [
      [
        "ambiguedad"
      ]
    ],
    "needs": {
      "refs": [
        "contrato.txt",
        "datos.txt"
      ]
    },
    "cites": [
      "contrato.txt",
      "datos.txt"
    ],
    "reply": [
      "Falta definición del margen y período base. Pregunta antes de comparar; no selecciona EBITDA o bruto por conveniencia. Simulación: debe ensayarse luego con un agente real."
    ]
  },
  {
    "id": "contradiccion",
    "when": [
      [
        "contradiccion"
      ]
    ],
    "needs": {
      "refs": [
        "datos.txt",
        "contradiccion.txt"
      ]
    },
    "cites": [
      "datos.txt",
      "contradiccion.txt"
    ],
    "reply": [
      "La fuente inicial17,6 y posterior18,1 no se concilian por promedio ni fecha sola. Solicitar definición/ajustes/aprobación. La coincidencia de esta acción no prueba recuperación real de fuentes."
    ]
  },
  {
    "id": "ruta",
    "when": [
      [
        "ruta"
      ]
    ],
    "needs": {
      "refs": [
        "rutas.txt",
        "contrato.txt"
      ]
    },
    "cites": [
      "rutas.txt",
      "contrato.txt"
    ],
    "reply": [
      "Fallo de control: advertir no termina la ruta. La rama incompleta debe devolver pendiente sin alcanzar la herramienta; inspeccionar conexiones/condiciones del tema. Aquí no se ejecuta Studio."
    ]
  },
  {
    "id": "variable",
    "when": [
      [
        "variable"
      ]
    ],
    "needs": {
      "refs": [
        "rutas.txt",
        "datos.txt"
      ]
    },
    "cites": [
      "rutas.txt",
      "datos.txt"
    ],
    "reply": [
      "El alcance global conserva un valor de otra entidad. Usar local o limpiar/reconfirmar en cambio de contexto. Boreal no tiene2024: no heredar15. Es diagnóstico guiado, no inspección real de variables."
    ]
  },
  {
    "id": "mapeo",
    "when": [
      [
        "mapeo"
      ]
    ],
    "needs": {
      "refs": [
        "delta.txt",
        "datos.txt"
      ]
    },
    "cites": [
      "delta.txt",
      "datos.txt"
    ],
    "reply": [
      "La operación puede restar bien y el análisis estar mal: validar definición/unidad antes del tool call y revisar payload. Este simulador no llama un flow."
    ]
  },
  {
    "id": "cero",
    "when": [
      [
        "cero"
      ]
    ],
    "needs": {
      "refs": [
        "delta.txt"
      ]
    },
    "cites": [
      "delta.txt"
    ],
    "reply": [
      "Resultado esperado delta7, RelativeAvailable=false y base-zero; no0% ni100%. Solo texto preparado: no es una ejecución real del flow ni evidencia de cálculo en Studio."
    ]
  },
  {
    "id": "permiso",
    "when": [
      [
        "permiso"
      ]
    ],
    "needs": {
      "refs": [
        "delta.txt"
      ]
    },
    "cites": [
      "delta.txt"
    ],
    "reply": [
      "Estado esperado failed-permission; no afirmar registrado, no ampliar credenciales. Identificar conexión y ruta manual. Esta acción simula el diagnóstico, no una respuesta real de backend."
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
    h('p', { class: 'muted' }, 'Práctica guiada de configuración y diagnóstico de agentes con extractos financieros ficticios. Respuestas preparadas; no es Copilot ni Studio real, ni prueba suficiente de competencia. Nada se envía a Microsoft.')));

  const term = createChat({
    copilot,
    suggestions: ["Define contrato con /contrato.txt y /datos.txt: propósito, inputs, salida y límites.", "Diagnostica ambiguedad con /contrato.txt y /datos.txt cuando el usuario solo pide margen.", "Contrasta contradiccion entre /datos.txt y /contradiccion.txt sin inventar conciliación."],
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
