# Verificación · edición 3

## Base y alcance

Se parte de `main` publicada en f07fd4a (edición2). La rama por defecto sigue `claude/funny-hopper-mj74xd`, anterior; se conserva la base publicada para no perder mejoras de motor, portfolio y PWA. Rama de trabajo `codex/copilot-mastery-v3`. Abrir la PR no publica por sí mismo. Tras revisión y pruebas, se actualiza el mismo Pages con la autorización de publicación ya dada en esta sesión.

Corrección de alcance del usuario: dominio de Copilot con ejemplos financieros transferibles y formación sustancial en construcción de agentes/Studio. Se retira del runtime el caso de adquisición y la estructura de entregables de una especialidad. Los archivos y contenidos anteriores siguen disponibles en el historial Git. Se amplía a10módulos/30lecciones con IDs nuevos y migración de estado3 que archiva edición2 e histórico1, conservando preferencias y exportación.

## Pruebas y criterio

Se mantiene la suite de motor y se actualizan IDs, competencia inicial y umbrales de progreso a la nueva estructura. L4 exige superar todas las evaluaciones locales, sin acreditar ejecución ni nivel experto. Los ejercicios portfolio no entran en aciertos, SRS ni exámenes. Las cantidades de contenido se actualizan a30 lecciones y15 dedicadas a construir agentes (9deStudio) por el cambio pedagógico explícito; no se eliminan controles de IDs, fuentes, soluciones o coherencia.

Pruebas Office: abre XLSX/DOCX/PPTX reales; evalúa cada fórmula del libro educativo de forma independiente en3escenarios×2años y contrasta cachés del caso base. Compara CSV contra históricos, EV/EBITDA reportado de comparables, tabla y gráfico nativos del PPTX. Control metamórfico +1capex debe restar1caja y sumar1PPE sin modificar resultado o deuda. Una mutación de signo en la fórmula de deuda tiene que fallar.

Pruebas navegador: Chromium con pantalla390×844 y1440×1000. El runner deriva las actividades del contenido vigente y recorre lecciones, exámenes, misiones y simulaciones guiadas. Las claves de respuesta usadas para conducir la interfaz no son evidencia de competencia del alumno. El estado de acceso se prepara como fixture explícita tras probar la primera lección, y las reglas de desbloqueo se comprueban por separado en el motor. Verifica también evidencia, exportación/restauración, reanudación, error, modo oscuro, reinicio, migración de caché, descargas OOXML offline y navegación sin red.

## Límites

No se accede al tenant del alumno ni se ejecutan Agent Builder, Studio, Analyst, Researcher o Cowork reales. Laboratorios Studio con procedimientos reales pero estado «pendiente» hasta ejecutarlos en entorno/licencia habilitados; el modo simulado o de diseño no sustituye esa prueba. Los fixtures conservan datos y aserciones por escenario, no un supuesto resultado de Microsoft.

Apertura con librerías OOXML y evaluador limitado al libro no son renderizado/recálculo en Microsoft Office. No se valida PPA, leases, macros, vínculos ni liquidez mensual. No se ha probado instalación en iOS físico. La documentación oficial no demuestra disponibilidad de funciones, permisos o consumo en un tenant concreto.

La matriz Microsoft se distribuye también en `content/resources/capacidades.md`; la revisión independiente está en [REVIEW3.md](REVIEW3.md). Los resultados finales ejecutados se añaden al cerrar la integración.

## Resultados ejecutados

- `npm test`: seis archivos de pruebas pasan. `node --test --test-isolation=none tests/*.test.mjs`: **52/52 pruebas individuales**.
- `npm run test:materials`: código0; OOXML/CSV/gráfico/tabla y todas las fórmulas en3escenarios×2años, controles e identidades, perturbación capex y mutación deuda.
- `npm run test:e2e`: código0, **30lecciones,10evaluaciones,15misiones y8laboratorios**. Móvil390×844, escritorio1440×1000, modooscuro, error/reanudación/exportación/restauración/reinicio, cachés antiguas y descarga realXLSX offline. Sin erroresJavaScript.
- La primera pasada detectó desbordamiento de los nuevos nombres de logros en perfil móvil; se corrigió la cuadrícula y se repitió el recorrido completo. No se ocultó el desbordamiento ni se eliminó el control.
- `git diff --check`: sin incidencias. Capturas actuales `docs/screenshots/v3-*.png`, inspeccionadas para el inicio y el portfolio móvil.
- Revisión editorial: los recursos activos no conservan FARE, Levante/Murcia ni el caso de adquisición anterior. La revisión independiente confirma procedimientos distintos de Builder/Studio y aplicación a diferentes tareas financieras.

Publicación en el mismo GitHub Pages autorizada en la conversación, después de preparar PR y completar estos controles. La ejecución en Microsoft real permanece pendiente como se detalla arriba.
