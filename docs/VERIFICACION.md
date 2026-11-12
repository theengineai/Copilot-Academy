# Verificación de edición 2 · 12 noviembre 2026

## Base y publicación

Repositorio clonado limpio, sin cambios ajenos ni AGENTS.md en el checkout. Rama por defecto: `claude/funny-hopper-mj74xd`. Rama que dispara Pages y origen del último despliegue: `main`. Ambas en `647694808f78072b1b15ac06f9c053aaaaada257`, sin diferencias. Confirmado contra despliegue de GitHub y sitio público: `sw.js` sirve VERSION `64769480`. Pages usa workflow; el campo source de configuración todavía menciona la rama por defecto, por lo que se contrastó con el despliegue real. Rama nueva `codex/finance-agents-edition`, PR contra `main`. Sin merge, workflow manual ni despliegue.

## Controles locales

- `npm test`: cinco archivos de pruebas pasan. Ejecución sin aislamiento (`node --test --test-isolation=none tests/*.test.mjs`, Node 24): **47 pruebas individuales**, todas pasan. Integridad de IDs/conceptos/prerrequisitos, soluciones, evaluaciones, SRS, desbloqueos, XP, simulador, PWA, migración y revisión independiente.
- `npm run test:materials`: abre XLSX/DOCX/PPTX con librerías OOXML. Recalcula independientemente todas las fórmulas admitidas del modelo en tres escenarios y dos años; contrasta resultados y cachés del escenario base. Controles de balance, caja, deuda y fuentes/usos. Una mutación intencionada de la fórmula de deuda provoca fallo del control. Reconcilia CSV contra históricos y verifica tabla y gráfico nativos en PPTX.
- Browser: Chromium/Playwright, móvil 390×844 y escritorio 1440×1000. El runner lee el contenido vigente para recorrer las actividades. Las respuestas del test son claves del curso, no evidencia de habilidad profesional. El estado de acceso se prepara explícitamente tras comprobar la primera lección; las reglas de desbloqueo se prueban separadamente en el motor.

El shock no produce caja negativa en 2026: queda 0,187671, bajo el mínimo didáctico de 2; DSCR 0,433647. En 2027 sí hay caja negativa. El caso explica la liberación del colchón NWC y exige sensibilidad sin liberación. Las identidades no prueban la validez económica de ese supuesto.

## Justificación de cambios en tests

Se sustituyeron IDs y cantidades de la edición antigua por 21 lecciones y 21 conceptos nuevos. Las misiones son entregables abiertos, no simulaciones con respuesta preparada: se comprueba la estructura del registro y la rúbrica, sin afirmar verdad semántica. Portfolio se excluye de examen, repaso, aciertos y dominio; los resultados de sesión distinguen registro de comprobación cerrada. Se conserva el control de respuestas incorrectas, soluciones del simulador, prerrequisitos, XP sin duplicación y persistencia. El runner navegador anterior dependía de IDs retirados: ahora deriva rutas del contenido e incluye todas las actividades nuevas.

## Límites de la evidencia

No se ha usado el tenant del alumno ni se han ejecutado Agent Builder, Analyst, Researcher, Cowork o Studio reales. Las nueve pruebas de agentes son fixtures manuales pendientes, con condiciones de fallo y registros de evidencia. Licencia, disponibilidad, fuentes, permisos, conectores y comportamiento real deben contrastarse allí. Documentación oficial comprobada en [CAPACIDADES.md](CAPACIDADES.md), también distribuida offline.

La apertura OOXML mediante librerías no es renderizado ni recálculo en Microsoft Office. El evaluador de fórmulas admite las operaciones usadas en este libro educativo; no es un motor Excel general ni prueba de macros/vínculos. No se ha probado instalación PWA en dispositivo iOS físico. Capturas de la app en `docs/screenshots/edition-*.png`; no se atribuye al simulador acceso real, verificación independiente ni capacidad de producción.

## Resultado final de navegador

`npm run test:e2e` terminó con código 0: 21 lecciones, 7 evaluaciones, 14 misiones y 7 laboratorios guiados. Sin errores JavaScript ni desbordamiento horizontal en rutas comprobadas. Exportación/restauración de evidencia, reanudación y feedback de respuesta errónea, modo oscuro y reinicio completo comprobados. Cachés antiguas `cpa-*` y `cca-*` eliminadas al activar nueva edición; recarga y navegación offline; descarga real de `modelo.xlsx` offline con firma OOXML `PK`. Capturas móvil, escritorio, portfolio y perfil oscuro guardadas. Dos confirmaciones del reinicio se identifican por nombre y se espera el estado persistido: se corrigió una carrera del test que antes pulsaba el mismo botón dos veces.
