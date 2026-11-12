# Laboratorio reproducible de Copilot Studio

Edición 3 · todo ficticio · guía de construcción, no configuración importable. Este archivo no ejecuta flujos ni crea agentes. Registra `diseñado`, `probado en flow`, `invocado por agente` y `probado con usuario` por separado.

## Antes de empezar

Las recetas se refieren a Copilot Studio web con **standard harness**, no a todas las superficies llamadas «Studio». La licencia de Microsoft365Copilot no garantiza acceso a todas las capacidades del Studio completo. Comprueba acceso de autor al entorno, licencia/capacidad para agent flows y un entorno Microsoft Dataverse completo; Dataverse for Teams no basta para estos flows. La prueba gratuita permite diseñar y probar agentes, pero no concede publicación de agentes. No se asume tu configuración corporativa.

Usa un sandbox ya autorizado. No necesitas ERP ni conectores bancarios. Si no tienes Studio, dibuja el mismo lienzo, rellena inputs/outputs y ejecuta los casos con una tabla o calculadora: obtienes un diseño contrastable, pero pierdes la ejecución automática y su traza; marca la práctica pendiente en Studio. El núcleo sin conectores evita permisos de datos corporativos, no elimina requisitos de autoría/capacidad. No cambies de entorno ni amplíes permisos para sortear políticas.

Los nombres de menú pueden variar por idioma y despliegue. Si no ves una opción, registra pantalla, experiencia y requisito que falta. La alternativa no es afirmar que tu agente ya la ejecuta.

## A. Crear agente y tema de aclaración

1. En Studio selecciona el entorno de prueba; abre **Agents** y crea uno nuevo desde blanco o la opción de configurar sin el asistente conversacional. Nombre «Laboratorio métricas». Establece idioma; registra propietario y versión `v1`.
2. En **Overview** define propósito: comparar valores que ya tienen definición, período y unidad. El agente debe pedir lo que falte, no buscar cifras en memoria. Conocimiento inicial: `metodologia.md` o una copia autorizada con esas reglas. No añadas todavía otros sitios ni herramientas.
3. Revisa el modo de orquestación. En modo generativo el agente puede seleccionar temas y herramientas por descripción; no confundir esa selección con una secuencia determinista. En modo clásico los triggers y frases se configuran de otra manera. Registra cuál pruebas.
4. En **Topics → Add a topic → From blank**, crea «Aclarar comparación». Con generativa, el trigger puede ser **The agent chooses**. Descripción: se usa cuando una comparación numérica carece de definición, período o unidad; no para explicar un concepto sin cálculo. En una experiencia clásica incluye frases representativas, no solo una exacta.
5. Añade un nodo **Ask a question**: «¿Qué métrica comparas?». Configura identificación por opciones: Margen EBITDA / Margen bruto / Otra. Renombra la variable de tema `Metric` desde **Variable properties**. Una variable de opción no es automáticamente texto genérico.
6. Pregunta `PeriodBase` y `PeriodCurrent` como texto (por ejemplo «2024A», «2025A»); pregunta `Unit` con opciones M€ / % / otra. Para valores numéricos usa identificación Number y variables locales `BaseValue`, `CurrentValue`. Antes de mapear Unit a una entrada Text de un flow, confirma el texto. Para esta receta añade una pregunta de confirmación que identifique **User's entire response** y guárdala como `UnitText`, tipo Text; usa ese valor confirmado en el mapeo. No pases una opción tipada como si fuera texto universal ni introduzcas conversiones silenciosas. No incluyas M€ en el número. El tipo se deriva de cómo se identifica/captura el dato, no de que el nombre suene numérico.
7. Tras `Metric=Otra` o `Unit=otra`, conecta **Condition** a una ruta que pida definición/unidad y devuelva pendiente. Esa ruta no debe alcanzar la herramienta. En ruta válida muestra un **Message** de confirmación con selector de variables, indicando unidad, períodos y definición.
8. Antes de ejecutar, exige confirmación cuando cambie compañía o unidad. Si traspasas datos a otro tema, configura inputs/outputs y mapea variables explícitamente. Usa variables locales para datos de la comparación actual. Una variable global dura durante la conversación y puede contaminar la siguiente consulta; no es una base de datos.
9. En **Test your agent**, prueba casos de abajo. Abre **Variables** y seguimiento de temas cuando la interfaz lo permita. Para generativa usa el activity map para ver qué se eligió, con los límites del trace. No presupongas visibilidad completa de todos los pasos internos.

| Entrada | Comportamiento esperado | Error que permite detectar |
|---|---|---|
| Compara el margen | Pregunta definición/períodos/unidad; no calcula | Inferencia de dato no suministrado |
| Compara margen EBITDA 2024A15% con2025A16,5% | Confirma definición; delta1,5 puntos porcentuales | Mezclar puntos y variación relativa |
| Otra métrica: margen ajustado | Solicita definición; ruta pendiente | Aviso que no bloquea la ruta |
| Ahora otra compañía, importes M€ | Recoge/reconfirma datos; no arrastra15 y16,5 | Alcance global incorrecto |
| Explica diferencia entre margen bruto y EBITDA | Responde con fuentes o explica límite sin llamar delta | Selección excesiva de herramienta |

**Diagnóstico.** Si el tema no se activa, compara la descripción de selección con otros temas y su trigger real. Si se activa pero no bloquea, inspecciona conexiones/condición. Si pregunta sin parar, revisa inputs ya rellenados y sus tipos. Si un dato viejo reaparece, examina alcance y regla de limpieza. Reiniciar el chat sirve para aislar la causa, no reemplaza el diseño.

## B. Construir la primera herramienta: delta sin conectores

### Contrato antes del diseñador

Entradas `BaseValue:Number`, `CurrentValue:Number`, `Unit:Text`. Son valores ya comparables: misma métrica, unidad, período definido y escenario identificado. La herramienta no los obtiene de un libro ni decide que sean comparables. La validación pertenece al tema/agente.

Salidas: `Delta:Number`, `RelativeAvailable:Boolean`, `RelativeChange:Number`, `Status:Text`, `Unit:Text`. Convención: delta=actual−base; relativa=(actual−base)/base **solo con base positiva**. Si base=0 o negativa, devuelve delta absoluto, relativa no disponible y estado explícito; no interpreta un cambio de pérdidas como mejora porcentual automática. `RelativeChange=0` en esos casos es un valor técnico de un output numérico y nunca debe mostrarse como0% económico.

### Construcción paso a paso

1. Abre **Flows → New flow → Agent flow**. En algunas experiencias se llega desde el agente: **Tools → Add a tool → Create new → Agent flow**. Nombre «Delta laboratorio». Verifica el trigger **When an agent calls the flow** y la respuesta **Respond to the agent**.
2. En el trigger añade dos entradas Number, etiquetas BaseValue y CurrentValue; añade Unit como Text. Los nombres internos del trigger pueden ser `number`, `number_1`, etc.: la etiqueta no autoriza a escribir `triggerBody()['BaseValue']`. Usa siempre el selector de contenido dinámico y confirma qué valor seleccionaste.
3. Antes de una Condition, añade acciones **Initialize variable**:
   - `BaseValue` tipo Float, valor=token dinámico del input base.
   - `CurrentValue` tipo Float, valor=token del input actual.
   - `Delta` tipo Float, valor0.
   - `RelativeChange` tipo Float, valor0.
   - `RelativeAvailable` tipo Boolean, valorfalse.
   - `Status` tipo String, valorpending.

   Son variables del **flow** y sus nombres los controlas tú. No son `Topic.BaseValue` ni PowerFx. Las expresiones siguientes son del diseñador de flujos (WDL), no del lienzo de temas.
4. Añade **Set variable Delta** con expresión:

   ```text
   sub(variables('CurrentValue'),variables('BaseValue'))
   ```

5. Añade **Condition** comparando BaseValue **greater than0**. En rama Yes:
   - Set RelativeChange con:

     ```text
     div(variables('Delta'),variables('BaseValue'))
     ```
   - Set RelativeAvailable=true.
   - Set Status=ok.
6. En rama No conserva relativa0 y disponiblefalse. Set Status con expresión:

   ```text
   if(equals(variables('BaseValue'),0),'base-zero','base-negative')
   ```

   No sitúes la división en una acción anterior a la Condition. El propósito de la rama es que no se ejecute.
7. Fuera de la Condition, en **Respond to the agent**, crea las salidas con los tipos del contrato. Mapea cada una a su variable y Unit al token de entrada. Configura respuesta síncrona para esta receta de standard harness. En la configuración de Networking de la respuesta, Asynchronous response queda Off. La documentación de infraestructura nueva describe otras capacidades asíncronas; no las necesitas para este laboratorio.
8. Guarda y revisa **Flow checker**. Ejecuta **Test** con la batería siguiente. En cada run abre Inputs/Outputs de las acciones; guarda runId y valores. Comprueba con calculadora independiente.
9. Para invocarlo desde un agente, el flow debe estar **publicado** en el sandbox y cumplir trigger/response/compatibilidad. Publicar el flow para probar una herramienta no es publicar el agente a usuarios. Si tu capacidad no permite publicar el flow, deja el hito de invocación pendiente: no llames integración a probar solo el diseñador.
10. En el agente ve a **Tools → Add a tool → Flow**, selecciona el flow publicado, **Add and configure**. En Name/Description escribe cuándo utilizarlo y qué no hace. En Inputs decide captura o mapeo de variables confirmadas. En Completion configura cómo se usa la salida y guarda. También puedes llamar la herramienta desde un nodo del tema después de la validación, en vez de dejar selección generativa a nivel de agente.
11. En Test del agente envía una comparación completa y observa la llamada y los outputs. La respuesta debe decir «relativa no disponible» para estados no positivos, aunque el output numérico técnico sea0. Prueba luego «explica el margen» y comprueba que no llama innecesariamente a la herramienta.

### Batería de cálculo y mapeo

| Caso | Inputs base/actual | Resultado esperado |
|---|---|---|
| Normal |100/110, M€|delta10, relativa0,10, disponibletrue, ok|
| Descenso |110/100, M€|delta−10, relativa−0,090909…, ok|
| Base cero |0/7, M€|delta7, disponiblefalse, base-zero; NO0%|
| Base negativa |−10/−5, M€|delta5, disponiblefalse, base-negative|
| Sin input |base ausente|tema pregunta; no sustituye por0 ni llama herramienta|
| Unidad incompatible |base15%, actual16M€|tema bloquea comparabilidad; no llama herramienta|
| Texto en número |base«quince» capturado como texto|pedir/capturar Number o fallar validación; no adivinar tipo en payload|

No confundas porcentaje y puntos:15%→16,5% tiene delta1,5 puntos porcentuales y variación relativa10%. Si la herramienta recibe15 y16,5 con Unit=%, la capa de presentación debe explicarlo; ella no conoce la definición de la métrica.

### Diagnóstico de la integración

- **Flow no visible:** comprobar entorno, publicación del flow, trigger/response y tipo de flujo. Los flows creados en Power Automate no necesariamente aparecen en la página Flows de Studio; su gestión/conversión y solución importan. No crear otro conector por tanteo.
- **Número equivocado:** abrir payload y variables del run. Si base/actual se invirtieron, corregir mapeo, no fórmula. Si unidades no coinciden, bloquear antes de ejecutar.
- **Expresión falla:** no usar PowerFx de Topics dentro de WDL de Flows; seleccionar tokens reales. No asumir claves internas del trigger por su etiqueta.
- **División por cero:** comprobar que la división está dentro de Yes y que el input Number se capturó correctamente.
- **Agente no invoca:** descripción, entrada disponible, modo de selección y tema. Ver si eligió otra herramienta. El mismo número en el texto no prueba ejecución.
- **Tiempo de espera:** para la receta estándar síncrona, la documentación exige respuesta dentro del límite de acción (100s). Un delta numérico no justifica esperas largas; revisa llamadas añadidas. No trasladar un límite de un harness a todos los productos sin comprobarlo.

## C. Extensión opcional con estado: registro educativo

Necesita SharePoint o Dataverse, almacenamiento y conexión autorizados; puede requerir TI. No es requisito para construir el flow anterior. Sin permiso, diseña estados y prueba manualmente; pierdes escritura y recuperación automáticas.

1. Prepara lista/tabla educativa con `RequestKey`, `RunId`, `Status`, `SourceVersion`, `ErrorCode`. La clave es `documentId|version`. Configura unicidad de RequestKey (columna única SharePoint o clave alternativa Dataverse). Mantén documentos fuera de instrucciones estables.
2. Inputs de la herramienta: identificador y versión, no una ruta arbitraria a cualquier sitio. Valida esquema y ubicación permitida. Registra qué conexión e identidad usa el flow. No asumas que la conexión del maker equivale al usuario final.
3. Consulta la clave. Si existe, devuelve duplicate y RunId ya creado. Si no existe, intenta crear received. Dos llamadas pueden superar la consulta a la vez: la unicidad debe impedir la segunda creación y el conflicto debe convertirse en duplicate.
4. Agrupa la ruta principal en Scope Try. Configura Scope Catch para ejecutarse tras fallo/timeout mediante Run after. Mapea403 a failed-permission y devuelve la ruta manual; no reintentes usando credenciales más amplias. Un fallo transitorio puede tener reintentos limitados y registrados. Si falla también el guardado del error, devuelve el incidente sin decir «registrado».
5. Solo cuando la operación realmente concluya cambia estado a completed. Los estados received/review no significan revisión financiera validada. El agente interpreta el output, pero no lo sustituye por un mensaje de éxito preparado.
6. Ensaya: normal; misma clave repetida; misma clave simultánea; archivo faltante;403; timeout y fallo del registro de error. Compara cantidad de filas y respuestas. Una prueba secuencial no demuestra resistencia a carreras.

## D. Evaluar, preparar distribución y mantener

1. Ejecuta fixtures en chats nuevos, mismo conjunto de fuentes y versión. Guarda input/response, trace disponible, payload, output, fuente de contraste, pass/fail/pending y corrección. Un caso reservado no se usa para ajustar instrucciones.
2. El test panel permite diseño; **sus sesiones no alimentan Analytics**. El dashboard refleja uso del agente publicado y puede tardar en actualizarse. Las trazas disponibles tampoco exponen todos los detalles internos. Si no tienes Analytics, usa registros manuales de pruebas y di que no has medido uso real.
3. Las evaluaciones automáticas disponibles dependen de experiencia/configuración. Una puntuación alta no compensa invención o acceso indebido. Los avisos de evaluación no necesariamente bloquean técnicamente la publicación: el gate educativo es tu decisión de aceptación.
4. Prepara matriz de acceso: maker, usuario autorizado y usuario sin permiso; método de autenticación, acceso a datos y conexión usada. Para probar otra identidad debes usar realmente esa identidad autorizada; no pedir al agente «imagina que no tienes acceso».
5. En **Settings → Security → Authentication** revisa el método; no desactives autenticación para sortear un403. Los cambios de autenticación requieren publicación para aplicarse a la versión publicada. Publicar una versión no garantiza que el canal distribuya automáticamente la última configuración de borrador.
6. Si está autorizado, el paso Publish publica versión; **Channels** configura distribución y canal (por ejemplo Teams/Microsoft365Copilot). Esto puede requerir aprobaciones corporativas. En esta formación puedes entregar checklist y pruebas sin publicar a usuarios.
7. Mide tiempo neto y calidad con tareas comparables; incluye preparación, revisión y corrección. Guarda versiones de instrucciones, conocimiento y herramientas antes de cambiar. Solutions/exportación pueden facilitar versionado y traslado; no prometen rollback instantáneo sin un procedimiento probado.
8. Analytics y transcripciones pueden tener roles/retenciones diferentes. Que un rol vea paneles no significa que pueda leer transcripciones. Consulta política y rol adecuado con TI; no copies conversaciones reales a la práctica.

## Evidencia mínima para cada hito

- Diseño: contrato, mapa de componentes, tipos, estado y prueba que podría fallar.
- Construcción: capturas/configuración visible y versión; sin pretender que un archivo Markdown es una solución importable.
- Ejecución: transcripción + runId/trace disponible + inputs/outputs reales + cálculo/fuente de contraste.
- Invocación: prueba desde agente donde se observe la herramienta, distinta del test aislado de flow.
- Distribución: permisos y canal efectivamente ensayados, o pendiente concreto.

## Fuentes oficiales consultadas (12 noviembre2026)

- https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics
- https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-variables
- https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-generative-actions
- https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-flow-create
- https://learn.microsoft.com/en-us/microsoft-copilot-studio/flow-agent
- https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-use-flow
- https://learn.microsoft.com/en-us/microsoft-copilot-studio/flow-asynchronous-response
- https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-overview

Matriz de requisitos y matices actuales: capacidades.md. Estas fuentes documentan funciones; no prueban ejecución en tu tenant.
