# Capacidades, requisitos y procedimientos comprobados · edición 3

Fecha de lectura: **12-11-2026**. Se recuperaron y leyeron **33 páginas oficiales Microsoft**, todas con respuesta HTTP 200, incluidas las guías operativas de Copilot Studio actualizadas en noviembre. Es documentación pública, **no una prueba en el tenant** del alumno. No conocemos sus licencias, políticas, región, canales ni permisos. Las rutas corresponden a la interfaz inglesa documentada; una traducción, despliegue gradual o experiencia distinta puede cambiar las etiquetas.

## Mapa de herramientas y alternativas

| Herramienta | Capacidad que se aprende | Requisito concreto | Alternativa útil y pérdida |
|---|---|---|---|
| Microsoft 365 Copilot / Copilot Chat | Dirigir trabajo, seleccionar contexto, contrastar respuestas y coordinar entregables | Cuenta de trabajo admitida. Grounding organizativo y capacidades avanzadas dependen de licencia M365 Copilot o facturación por uso habilitada, fuentes y políticas | Chat con archivos ficticios seleccionados y fuentes manuales. Pierdes recuperación organizativa integrada según licencia; mantienes método y controles |
| Copilot en Excel, Word, PowerPoint | Crear o modificar contenido del archivo abierto, con modos distintos por plataforma | Aplicación y archivo compatibles, licencia elegible y modo visible. Confirmar edición frente a análisis antes de encargar un cambio | Edición manual en copia con registro de cambios; se pierde edición integrada asistida |
| Agent Builder | Crear agentes declarativos: instrucciones, fuentes, capacidades visibles y pruebas | Crear agentes habilitado. Instrucciones/web pueden tener acceso diferente al grounding SharePoint/Copilot connectors, que requiere licencia o facturación y políticas aplicables | Instrucciones versionadas en chats nuevos con expediente explícito. Pierdes configuración persistente, fuentes enlazadas y distribución como agente |
| Copilot Studio web, experiencia estándar | Construir temas, variables, herramientas, agent flows y ciclo de vida | Acceso de autor en entorno autorizado, licencia/capacidad correspondiente y políticas. Para agent flows: Dataverse completo y licencia que incluya flujos. No basta inferirlo de tener M365 Copilot | Diseñador en papel/archivo, contratos y pruebas manuales. Se pierde ejecución real, trazas y conexiones; marcar «diseñado, no ejecutado» |
| Analyst | Reconciliar datos y ejecutar análisis inspeccionables | Agente visible/habilitado, elegibilidad y consumo vigente. No exige instalar Python localmente | Excel con fórmulas reproducibles. Se pierde ejecución analítica delegada, no la capacidad de comprobar |
| Researcher | Investigar una pregunta en varios pasos con evidencia | Add-on empresarial M365 Copilot y agente habilitado según documentación. Fuentes y límites dependen de políticas | Chat con fuentes elegidas + investigación manual; se pierde delegación del proceso, no obligación de contrastar |
| Pages | Convertir una respuesta en lienzo editable y colaborativo | Cuenta Entra y almacenamiento SharePoint/OneDrive. Puede estar disponible sin add-on Copilot; políticas Loop/Pages aplicables | Documento Word versionado; pierdes vínculo de edición colaborativa del lienzo con el chat |
| Notebooks | Reunir chats, archivos y notas para trabajar con contexto acotado | Copilot o Copilot Chat y plan de servicio SharePoint/OneDrive para crear. Despliegue gradual | Carpeta limpia e índice de fuentes; pierdes contexto agrupado y funciones del notebook |
| Programación de prompts | Repetir consultas admitidas y recoger resultado periódico | Licencia Microsoft Copilot y función visible/habilitada; disponibilidad por nube/organización | Recordatorio personal y ejecución manual; pierdes ejecución programada |
| Cowork | Delegar tareas de varios pasos con plan y revisión | M365 Copilot activo, Cowork habilitado y facturación de uso/Cowork habilitada | Checklist de pasos con revisión humana entre ellos; pierdes ejecución delegada en segundo plano |

## Antes de seguir una receta Studio

**Agent Builder, Copilot Studio y sus experiencias no son equivalentes.** Las guías de temas, variables, flujos y mapas de actividad citadas aquí describen principalmente agentes del **standard harness**. La documentación actual también distingue el **Microsoft Copilot harness**. Una licencia M365 Copilot permite ciertas experiencias Studio, pero no acredita todos los menús, canales, conectores o derechos de publicación del estándar. Registrar experiencia, entorno, rol y capacidades visibles antes de empezar. No sustituir silenciosamente un laboratorio por otra superficie.

Una trial de Copilot Studio permite crear y probar en el panel de test, pero **no publicar el agente**. El administrador puede impedir el alta de trial. No se prescribe crear un tenant, activar facturación ni obtener permisos para completar el núcleo. Si faltan, se conserva el diseño, el contrato y las pruebas, indicando que la ejecución queda pendiente. La receta sin conectores sigue necesitando la capacidad de agent flows: «sin conector» no significa «sin licencia ni entorno».

## Procedimientos Studio y límites operativos

| Área | Procedimiento documentado y control que enseñar | Evidencia oficial |
|---|---|---|
| Tema | Topics → Add a topic → From blank. En orquestación generativa, `The agent chooses` usa descripción; las frases de activación caracterizan la ruta clásica. No mezclar ambas como si funcionaran igual | ST01, ST04 |
| Preguntas y tipos | Add node → Ask a question. `Identify` determina extracción y tipo; una pregunta crea su variable de salida. Renombrar en Variable properties. Para asignación: Variable management → Set a variable value | ST02 |
| Alcance y entradas/salidas | Topic details permite definir Inputs/Outputs. Un dato de conversación no debe persistir sin intención como variable global; el panel Variables permite inspeccionarlo. Pasar tipos compatibles entre tema y herramienta | ST02, ST03 |
| Crear flujo | Tools → Add tool → Agent flow (Create new). Plantilla con `When an agent calls the flow` y `Respond to the agent`; añadir inputs, acciones y outputs. Publicar el flujo antes de incorporarlo como herramienta | ST05 |
| Invocar flujo | Tools → Add a tool → Flow; seleccionar publicado, Add and configure; describir herramienta, mapear Inputs y Completion, guardar. Testear desde el agente y revisar llamada y resultado, no solo su texto final | ST06, ST07 |
| Sincronía | La receta estándar documentada usa respuesta síncrona, toggle Asynchronous response en Off y límite de acción de 100 segundos. Existe soporte asíncrono en infraestructura nueva: no es una prohibición universal ni debe suponerse disponible en cualquier canal | ST05, ST06, ST08 |
| Entorno/conexión | Agent flows requieren Dataverse completo; Dataverse for Teams no los soporta. Confirmar identidad de ejecución y conexiones, aunque el usuario haya iniciado sesión; permisos del creador y del consumidor pueden diferir | ST05, ST15 |
| Prueba interactiva | Test panel, nueva conversación con Reset, seguimiento de temas y Variables. Guardar cambios no limpia el contexto anterior. Separar fallo de selección, parámetro, fuente, ejecución y presentación | ST09 |
| Trazas | Activity map ayuda a inspeccionar decisiones, entradas y salidas en agentes con orquestación generativa. No expone todo razonamiento interno ni necesariamente cada actividad generativa dentro de un tema; complementar con variables y ejecuciones del flujo | ST10 |
| Evaluaciones | Evaluation → New evaluation → Single responses permite conjuntos de prueba. Elegir entradas propias, expected output y criterios; la generación automática no crea un estándar independiente de verdad. Guardar resultados y regresiones | ST11, ST12 |
| Identidad al evaluar | Usa la cuenta conectada y sus recursos. La evaluación autenticada requiere el conector Copilot Studio; si una política lo bloquea, usar registro manual. Para probar otra identidad se debe entrar con esa identidad autorizada. No marcar permisos como probados usando solo el creador | ST12 |
| Publicación | Guardar/testear un borrador no actualiza el agente publicado. Publicar y distribuir por canal son operaciones distintas; autenticación, acceso y conexiones se revisan antes. En el curso se diseña y prueba en sandbox; publicación corporativa es ampliación con responsable autorizado | ST14, ST15 |
| Analítica | Monitor no incluye las interacciones del panel de test. Usar sesiones del canal autorizado y contemplar demora de datos. Ver analítica y leer transcripciones son permisos distintos; no inferir calidad financiera de satisfacción, engagement o éxito de sesión | ST16 |
| Consumo y roles | Confirmar capacidad y derechos antes de ejecución, publicación o conectores; no afirmar «todo incluido». La documentación distingue identidad licenciada interactiva de otras ejecuciones. No activar facturación como paso implícito del laboratorio | ST13, ST17 |

## Límites transversales que afectan al resultado

- **Fuentes prioritarias no son aislamiento técnico.** En Agent Builder, `Only use specified sources` prioriza las fuentes elegidas; no bloquea el conocimiento general de IA. Probar abstención, cita correcta, ausencia de contaminación y falta de evidencia.
- **Grounding de XLSX no es motor Excel.** Builder funciona mejor con datos concentrados en una hoja. Una extracción, una cita o Python en Analyst no garantiza recálculo de fórmulas, macros, vínculos, hojas ocultas ni fidelidad de todo el libro. Editar y recalcular el original requiere Excel y controles sobre el archivo.
- **Analyst no requiere Python local.** Microsoft documenta ejecución en entorno controlado. El encargo debe exigir entradas, transformaciones, definiciones y resultados que el usuario pueda contrastar; ejecutar código no implica exactitud universal.
- **Enlazar y embeber no conceden el mismo acceso.** Fuentes enlazadas respetan sus permisos; un agente con archivos embebidos comparte conocimiento sujeto a derechos y etiquetas aplicables. Antes de distribuir, probar con otra identidad autorizada y ejemplos ficticios.
- **Etiquetas y autenticación no son garantías universales.** La protección depende de archivo, derechos de extracción, escenario, tenant y canal. Revisar el artefacto de salida; no inferir herencia incondicional de una simulación.
- **Otro agente no es verificación independiente.** Puede ayudar a localizar errores; ambos pueden compartir una fuente errónea. Los controles se realizan contra archivos, cálculos y evidencia primaria.
- **Orquestación requiere ejecución y estado.** Invocar dos agentes manualmente, escribir un plan o dibujar un flujo no prueba llamadas automáticas ni acciones. Separar resultados «diseñado», «probado en simulador», «ejecutado en herramienta» y «aceptado para su uso».

## Registro de fuentes oficiales leídas

Las primeras 15 páginas cubren M365; las 18 siguientes añaden profundidad Studio. No se citan cuotas, precios ni disponibilidad universal como constantes. Esta matriz debe acompañar los recursos de la aplicación offline.

| ID | Fuente | Afirmación que soporta |
|---|---|---|
| MS01 | [Agent Builder frente a Studio](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/copilot-studio-experience) | Elección por capacidades/ciclo de vida y experiencias distintas |
| MS02 | [Knowledge en Agent Builder](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/agent-builder-add-knowledge) | Fuentes, Excel, permisos, etiquetas y prioridades |
| MS03 | [Prerrequisitos de agentes](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/prerequisites) | Crear/usarlos, licensing, grounding y dependencias |
| MS04 | [Copilot en Excel](https://support.microsoft.com/en-us/excel/copilot/get-started-with-copilot-in-excel) | Modos de trabajo en archivo y compatibilidad |
| MS05 | [Analyst](https://support.microsoft.com/en-us/microsoft-365-copilot/get-started-with-analyst-in-microsoft-365-copilot) | Acceso y análisis delegado |
| MS06 | [Ejecución analítica en Analyst](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/analyst-agent-in-microsoft-365-copilot/4397191) | Python en entorno controlado, sin instalación local |
| MS07 | [Researcher](https://support.microsoft.com/en-us/microsoft-365-copilot/get-started-with-researcher-in-microsoft-365-copilot) | Investigación en pasos y requisitos |
| MS08 | [Pages](https://support.microsoft.com/en-us/microsoft-365-copilot/get-started-with-microsoft-365-copilot-pages) | Lienzo editable y acceso |
| MS09 | [Notebooks](https://support.microsoft.com/en-us/microsoft-365-copilot/get-started-with-microsoft-365-copilot-notebooks) | Contexto agrupado y servicio de almacenamiento |
| MS10 | [Researcher en Notebooks](https://support.microsoft.com/en-us/microsoft-365-copilot/use-researcher-in-microsoft-365-copilot-notebooks) | Integración y requisitos |
| MS11 | [Cowork overview](https://learn.microsoft.com/en-us/copilot/cowork/) | Delegación, planes y revisión |
| MS12 | [Cowork get started](https://learn.microsoft.com/en-us/copilot/cowork/get-started) | Licencia, habilitación y facturación de uso |
| MS13 | [Agent flows overview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/flows-overview) | Automatización y capacidad |
| MS14 | [Programar prompts](https://support.microsoft.com/en-us/microsoft-365-copilot/schedule-your-most-used-copilot-prompts) | Ejecución recurrente admitida, disponibilidad |
| MS15 | [Licencias M365 Copilot](https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-licensing) | Elegibilidad y términos por plan |
| ST01 | [Create and edit topics](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics) | Tema, nodos, condiciones y ramas |
| ST02 | [Work with variables](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-variables) | Variables, tipos, asignación y alcance |
| ST03 | [Topic inputs and outputs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-managing-topic-inputs-outputs) | Contratos entre temas y herramientas |
| ST04 | [Topic triggers](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-triggers) | Selección generativa frente a disparador clásico |
| ST05 | [Create an agent flow as a tool](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-flow-create) | Dataverse, trigger/response y publicación del flujo |
| ST06 | [Add flow as tool](https://learn.microsoft.com/en-us/microsoft-copilot-studio/flow-agent) | Condiciones de invocación y sincronía estándar |
| ST07 | [Call an agent flow](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-use-flow) | Configuración e inputs al invocarlo |
| ST08 | [Asynchronous response](https://learn.microsoft.com/en-us/microsoft-copilot-studio/flow-asynchronous-response) | Soporte condicionado a infraestructura/canal |
| ST09 | [Test your agent](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-test-bot) | Reset, seguimiento de temas y variables |
| ST10 | [Review activity](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-review-activity) | Trazas, alcance y límites del mapa |
| ST11 | [Create a test set](https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-agent-evaluation-create) | Conjuntos manuales o generados y criterios |
| ST12 | [Run evaluations and results](https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-agent-evaluation-results) | Cuenta evaluadora, conexión, resultados y comparación |
| ST13 | [Get access to Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-licensing-subscriptions) | Trial y restricciones de publicación |
| ST14 | [Publish and deploy](https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-fundamentals-publish-channels) | Borrador, publicación y canal |
| ST15 | [Authentication](https://learn.microsoft.com/en-us/microsoft-copilot-studio/configuration-end-user-authentication) | Opciones e identidad; publicar cambios |
| ST16 | [Monitor performance](https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-overview) | Sesiones de uso, analítica y permisos |
| ST17 | [Standard harness licensing](https://learn.microsoft.com/en-us/microsoft-copilot-studio/billing-licensing) | Experiencias, capacidad y consumo |
| ST18 | [Generative orchestration guidance](https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/generative-orchestration) | Herramientas, temas, descripciones y observación del plan |

## Validación que solo puede hacerse en el entorno del alumno

Registrar experiencia/licencia/rol; crear agente y fuentes; verificar comportamiento con corpus reservado; ejecutar los temas y flujos reales; comprobar que la herramienta fue llamada y que devuelve valores previstos; probar permisos con identidades autorizadas; comprobar efectos de publicación en canal; revisar analítica después de uso real. La app no ejecuta estos pasos. Conservar entrada, respuesta, versión, trazas, cálculos y fallos. No marcar una práctica «ejecutada» porque su diseño o simulación funcione.
