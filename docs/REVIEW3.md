# Revisión independiente · edición 3

Fecha: 12-11-2026. Revisor separado de autores de contenido y Studio/evaluación. El alcance es el curso implementado, sus instrucciones de construcción y sus datos. No equivale a ejecutar prácticas en Microsoft 365 o Copilot Studio reales.

## Diagnóstico del cambio requerido

La edición 2 era coherente con un proceso de financiación, pero organizaba el aprendizaje alrededor de un agente de primera lectura, documentos FARE y defensa de una operación. El usuario pide ahora dominar Copilot como herramienta transversal al sector financiero y aprender a construir sus propios agentes. No bastaba sustituir «FARE» por «presentación»: era necesario invertir el eje pedagógico, dando a configuración, conocimiento, temas, variables, herramientas, pruebas y ciclo de vida un recorrido propio.

Se conservan el motor PWA, progreso exportable, laboratorio declarado y rúbricas honestas. La nueva interfaz de contenido define 30 lecciones, de las que 15 se dedican de lleno a construir agentes: 6 Builder/conocimiento y 9 Studio. Los ejemplos financieros son material para practicar y transferir, no plantillas obligatorias de una especialidad. La defensa de una adquisición deja de ser el proyecto final; el alumno diseña una tarea y un agente propios.

## Contraste oficial de capacidades

Leídas 33 páginas oficiales Microsoft con HTTP 200. `docs/CAPACIDADES.md` documenta requisitos, alternativas, rutas y fuentes. Hallazgos comunicados a los autores:

- Las recetas Topics/Variables/Agent flows corresponden principalmente al **standard harness**. M365 Copilot habilita otras experiencias y no acredita por sí solo todos los menús del estándar.
- La trial permite crear y probar agentes, pero no publicarlos. La organización puede impedir alta, acceso, facturación o conectores; no son requisitos que el alumno deba activar sin autorización.
- Agent flows necesitan Dataverse completo, no Dataverse for Teams. Para tool desde el agente, la receta documentada publica primero el flujo y mapea inputs/outputs; el alumno debe comprobar la llamada real.
- La receta síncrona estándar exige `When an agent calls the flow`, `Respond to the agent`, respuesta síncrona y límite de acción. Hay soporte asíncrono condicionado a infraestructura nueva; no enseñar una prohibición universal ni asumir que existe.
- Tema clásico y selección generativa tienen disparadores distintos. El alcance/tipo de las variables y la diferencia entre expresiones de tema y de flujo son parte del aprendizaje, no detalles opcionales.
- El panel de test permite Reset, seguimiento de temas, Variables y actividad. Guardar un cambio no limpia la conversación; una respuesta correcta por contexto anterior puede ocultar una configuración defectuosa.
- Las evaluaciones usan identidad conectada y permisos reales; otra identidad requiere otra sesión autorizada. Evaluación automática y promedio de éxito no sustituyen un control financiero contra evidencia.
- La analítica de uso no incluye las sesiones del panel de test. Publicar, distribuir por canal y compartir acceso son pasos diferentes; modificar borrador no actualiza automáticamente al consumidor.

## Controles independientes de datos y evaluación

`tests/review3.test.mjs` calcula desde resultado neto y D&A el CFO, resta variación NWC y capex para FCF y reconstruye caja, deuda, PPE, patrimonio y balance en tres escenarios y dos años. Es una formulación distinta al puente directo desde EBITDA del generador de materiales. Contrasta seis años-escenario contra el archivo de resultados, y fija base 2026 FCF 6,995 y caja 11,995. Se comprueba que registrar una rúbrica de un flujo no ejecutado no incrementa aciertos ni conceptos. Un tercer control exige quince lecciones de construcción nuevas y nueve entregables Studio sobre conceptos distintos.

Las pruebas generales, OOXML, navegador y caché son responsabilidad de la integración principal y se documentan en VERIFICACION.md; no se cuentan aquí como evidencia independiente adicional. Las pruebas estructurales no demuestran por sí mismas profundidad pedagógica: la lectura editorial se registra debajo.

## Límites y aceptación en entorno real

La app enseña y conserva evidencia; no configura un agente en el tenant. Una receta de flujo, una simulación o una rúbrica completa pueden conservarse aunque la ejecución esté pendiente. Antes de utilizar un agente real deben ejecutarse casos normales, ambiguos, incompletos, contradictorios, fuera de alcance y de contaminación/inyección, con archivos de escenario y registro de respuesta. Es necesario distinguir fuente accesible, variable correcta, llamada ejecutada, resultado exacto y conclusión sustentada.

El modelo es educativo e integrado de forma acotada: NWC neto de proveedores, impuesto pagado simplificado, interés sobre deuda de apertura y amortización anual; no es consolidación completa ni tesorería mensual. Estos límites no impiden practicar edición y validación de dependencias, pero sí impiden inferir precisión universal o validez de una decisión de inversión o crédito.

## Lectura editorial de la implementación

Leídas las **30 lecciones** nuevas, sus ejemplos, procedimientos, prácticas abiertas y rúbricas; también contratos de `agentes.md`, la receta completa `studio-lab.md` las diez fixtures de `pruebas-agentes.json` y las soluciones comentadas finales.

- M1 enseña elección de superficie por resultado observable, diseño de contexto y reparación acotada. Los ejemplos cambian entre análisis, presupuesto, inversión y documentación; no imponen una operación.
- M2 y M3 enseñan a configurar Builder: contrato propio, campos distintos, fuentes incorporadas de verdad, capas de conocimiento, capacidades efectivas, aislamiento y regresión. No se limitan a dar nombres a asistentes ni fijan las cifras de Aurora como instrucciones estables.
- M4, M5 y M6 dedican nueve lecciones distintas a construir un agente Studio: tema con ramas, tipos/alcance e inputs, contrato de herramienta, flujo sin conectores, estado y errores, pruebas con trazas, autenticación/distribución y mantenimiento. La guía explica WDL frente a Power Fx, tokens reales frente a etiquetas, cálculo con Float y mapeo de outputs; distingue test aislado, invocación por agente y publicación a usuarios.
- M7 trabaja reconciliación y modificación de un bloque con dependencias, perturbaciones y controles. Analyst se encarga y valida sin aprender Python; la extracción no se presenta como recálculo de Excel. Las cifras base coinciden con los controles independientes.
- M8 distingue pregunta de investigación, definición y evidencia contraria, más el papel distinto de Pages y Notebooks. M9 desarrolla Word/PowerPoint desde material editable transversal, con narrativa, datos y cambios acotados; no conserva FARE como formato central.
- M10 exige contratos de traspaso, criterio de automatización y medición neta. El cierre pide **un agente propio y otra tarea**, de modo que repetir nombres y cifras del caso no demuestra transferencia.

Las diez fixtures contienen sus archivos de entrada por escenario y resultados reales en `pending`. La prueba incompleta no recibe el paquete entero que rellenaría el dato ausente. La de contaminación especifica ejecución previa con Aurora, cambio a Boreal en la misma conversación y contraste en conversación nueva. La de error de permisos distingue un contrato escrito de una respuesta real de backend, evitando fingir una integración ejecutada.

Se señalaron y corrigieron durante la revisión: distractores sin plausibilidad causal; enunciados de decisión repetidos; ejemplo de separador decimal que no coincidía con el CSV; necesidad de explicitar standard harness/Dataverse; ruta de Evaluation y analítica que no incluye test panel; y diferencia entre base distinta de cero y **base positiva** en el flujo. El contrato docente ahora deja relativa no disponible para base cero o negativa. Estos cambios refuerzan el control sin eliminar casos adversos ni rebajar la exigencia de evidencia.

La lectura da por coherente el **diseño de aprendizaje transversal**. No da por ejecutadas las recetas en el tenant ni por aceptados los agentes que construya el alumno. Las preguntas cerradas comprueban decisiones acotadas; la práctica abierta y sus fuentes siguen necesitando revisión humana. La independencia de esta revisión es la de un revisor distinto sobre el material: no convierte una segunda respuesta generativa en certificación financiera.
