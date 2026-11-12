# Revisión independiente · edición financiera v2

Revisor: subagente separado de los autores de contenido y evaluación. Fecha: 12-11-2026. Alcance: coherencia financiera, límites de capacidades y significado de las evaluaciones. Esta revisión del código y de los materiales educativos no constituye ejecución en Microsoft 365 Copilot ni revisión bancaria de una operación real.

## Diagnóstico contrastado con el repositorio de partida

El commit `6476948` ya había reforzado módulos 3–5 y el programa se dirigía a un usuario L2–L3. Por tanto, no era correcto describir todo el curso como introductorio. Aun así, el primer módulo enseñaba contexto, grounding y personalización; el de modelización contenía auditoría/documentación y Python/simulación; los agentes estaban al final. Las respuestas preparadas del laboratorio usaban un cierre de Brisa Alimentación y sus objetivos verificaban recorridos. El nivel «Experto» se podía alcanzar mediante exámenes y proyecto local sin evidencia de ejecución en Copilot. La arquitectura PWA, la navegación, el estado local y el simulador declarado eran elementos valiosos que conservar.

La rama publicada y la rama por defecto deben distinguirse: los despliegues consultados proceden de `main`; la rama por defecto es `claude/funny-hopper-mj74xd`. En el punto de partida ambas referencias apuntaban al mismo SHA. La etiqueta «Base: main = rama por defecto» de la especificación inicial describe igualdad de contenido; no debe interpretarse como igualdad de nombres de rama.

## Hallazgos y correcciones integradas

| Hallazgo | Implicación | Resolución |
|---|---|---|
| La documentación de Builder indica que `Only use specified sources` prioriza fuentes sin bloquear conocimiento general | No basta un interruptor para garantizar análisis exclusivamente documental | Matriz de capacidades y aviso al autor; abstención y citas deben probarse |
| Los requisitos de Pages/Notebooks han cambiado respecto a afirmaciones genéricas de licencia | Se podía excluir innecesariamente a usuarios de Copilot Chat o prometer características del add-on | Matriz distingue Pages con almacenamiento Entra y Notebooks con Copilot/Chat + servicio OneDrive/SharePoint; Researcher se verifica aparte |
| Shock 2026 inicialmente descrito como caja negativa | Con los datos del caso la caja es **+0,187671**, no negativa; DSCR **0,433647** y caja por debajo del mínimo educativo 2 | Corregidos prueba, correo y mensajes: insuficiencia de CFADS consume caja en 2026; el modelo proyecta caja negativa en 2027 |
| El cierre incluye NWC de 11,328767 frente a nivel normalizado 9,328767 | El caso base libera 1,533562 de NWC y mejora materialmente CFADS; una identidad correcta no prueba una hipótesis económica | Añadido supuesto explícito de colchón inicial y sensibilidad sin liberación; autor de lecciones informado |
| Primera versión del PPT solo contenía texto y sugerencias de gráficos | No ofrecía una base visual financiera suficiente para editar y revisar | Principal incorporó tabla y gráfico nativos; se conservan discrepancias deliberadas identificadas |
| Faltaban extracción de históricos y correo aclaratorio previo | Reconciliación entre archivos insuficiente | Añadidos CSV por entidad y aclaración EML, además de la actualización posterior |
| Una rúbrica completada puede confundirse con calidad aprobada | Las marcas del alumno no verifican el entregable | Validador devuelve `selfAssessed:true`, `semanticValidation:false`; no incrementa aciertos ni conceptos |

## Controles independientes ejecutados

`node tests/review.test.mjs`: tres pruebas. (1) Un registro de rúbrica, incluso con errores críticos declarados, permite conservar la autoevaluación sin aumentar aciertos o dominio. Entradas fuera de escala o sin declaración crítica fallan. (2) Recalculado por separado CFADS, servicio, DSCR, caja y deuda de 2026 para management/base/revisión a partir de supuestos explícitos; comprobada distinción entre caja positiva bajo mínimo y déficit de servicio. (3) Registro documental con requisitos y límites relevantes, sin afirmar prueba en tenant.

Los controles sobre Office, fórmulas completas, navegación, tamaño de pantalla, migración y caché corresponden a la integración principal y se documentan en VERIFICACION.md. No duplicar su resultado como si fuera evidencia adicional independiente. Los valores almacenados en JSON no bastan por sí mismos para probar fórmulas de Excel; el test de materiales abre OOXML y evalúa las fórmulas admitidas.

## Juicios financieros y límites

El modelo es integrado y acotado, con balance inicial didáctico y NWC neto de proveedores. No construye PPA ni consolidación contable completa; esa exclusión está identificada. Deuda anterior 8 se cancela con los usos de cierre; sumar 8 otra vez a deuda 20 es un error. Deuda neta inicial 18 y deuda final 2026 son momentos diferentes. EBITDA management 9 y base 8 son escenarios diferentes. CFADS excluye intereses y servicio incluye intereses más principal una sola vez. DSCR y deuda neta/EBITDA son métricas didácticas con definiciones explícitas, no políticas o umbrales de Santander.

El modelo anual no acredita liquidez mensual, disponibilidad de líneas, covenants, garantías, documentación contractual ni aceptación de mitigantes. Un segundo agente puede ayudar a encontrar contradicciones, pero comparte riesgos de fuente y razonamiento; verificar cifras contra archivos y recalcular sigue siendo necesario. Los mecanismos de simulación y comprobación local no prueban capacidad de producción.

## Pendiente fuera del entorno local

Repetir las prácticas con licencia y habilitaciones del alumno, comprobar qué modos de edición están disponibles, probar recuperación de fuentes y abstención de los agentes, validar resultados de Analyst y Researcher contra archivos y ejecutar flujos solo en sandbox autorizado. Capturar versiones de producto/configuración y los fallos; no convertir el paso de una simulación en acreditación de dominio.
