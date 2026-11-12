# Soluciones comentadas y controles · edición3

No hay un agente financiero terminado que debas imitar. El objetivo es que puedas construir, probar y adaptar el tuyo. Las soluciones describen decisiones y controles; no constituyen una configuración importable ni acreditan ejecución en Microsoft. Todo es ficticio. Conserva tus primeros intentos y sus fallos.

## M1 · Elegir y dirigir Copilot

Una tarea aislada puede resolverse mejor directamente en la aplicación donde vive el documento o el libro. Analyst sirve para encargar análisis de datos sin instalar Python local, pero una extracción no conserva automáticamente fórmulas, macros, vínculos ni cálculo del Excel. Researcher investiga una pregunta multietapa; Pages ayuda a construir contenido compartible; Notebooks organiza un corpus seleccionado; no son nombres intercambiables.

Un agente aporta reutilización cuando persisten contrato, metodología, conocimiento o herramientas entre encargos. Si para cada consulta pegas un prompt parecido, primero compara el coste de configurar/probar el agente frente a la repetición real. La elección se defiende por la capacidad necesaria, no por usar la herramienta más sofisticada.

**Control:** el esquema identifica dónde se recupera, genera, calcula y registra. Un resultado generado no prueba que se haya llamado una herramienta.

## M2 · Contrato y configuración de Agent Builder

El contrato nombra propósito, inputs mínimos, método, formato de output y condiciones para pedir información. Nombre, descripción, instrucciones, fuentes y prompts sugeridos son campos con funciones diferentes. Los prompts sugeridos facilitan empezar; no añaden capacidad.

Una prueba completa y otra incompleta demuestran si el agente aplica su límite. Ante un fallo, clasifica la causa antes de añadir instrucciones: recuperación de fuente, definición de métrica, contexto de otra entidad, interpretación o herramienta. Una corrección útil afecta esa causa y se contrasta mediante regresión; una respuesta más larga no demuestra mejora.

**Control:** adjunta configuración real, fuentes exactas, versión y transcripciones. Si solo se ha diseñado o usado un chat con contrato, registra ese alcance sin atribuirle distribución o configuración de un agente.

## M3 · Fuentes, capacidades y pruebas

Reglas estables y ejemplos no deben guardar cifras activas de otro encargo. El expediente cambia por entidad y fecha. Una fuente reciente puede ser relevante sin estar aprobada; ante contradicción conserva ambas y pide definición/ajuste/autoridad que permita resolverla.

En las fixtures: Aurora2024 EBITDA15M€ y2025 17,6M€ dan delta2,6M€ y crecimiento17,3333%; ventas100→110 hacen margen15%→16%, mejora1punto porcentual. Boreal solo tiene2025 EBITDA12M€: no puede heredar15 de Aurora para su base. El paquete incompleto no incluye EBITDA2025 y debe provocar una pregunta, aunque otro ejercicio del curso sí contenga esa cifra.

La fixture de contradicción aporta17,6 y18,1 sin instrucción de sustitución: promediar o elegir por fecha no resuelve el conflicto. La inyección dentro de una fuente no cambia el contrato; no se debe seguir ni afirmar envío. Las condiciones críticas se revisan contra el paquete exacto, no por palabras clave.

**Control:** un banco válido tiene normales, ambiguos, incompletos, contradictorios, fuera de alcance y cambio de contexto. Un caso reservado no se usa para ajustar la configuración. Todo resultado real empieza pending.

## M4 · Conversación, temas y variables en Studio

La solución de referencia combina interpretación flexible con preguntas y controles explícitos donde el contrato lo necesita. El tema de aclaración pide definición, períodos y unidad. La rama «Otra» devuelve pendiente y no se une a cálculo. Advertir de la ausencia no equivale a bloquear la ejecución.

Las variables tienen tipo y ciclo de vida. Number evita mezclar texto/unidad en el importe; las elecciones pueden tener un tipo propio. Antes de mapear una opción a una tool Text, conviértela/confírmala explícitamente; la receta usa UnitText capturado como texto confirmado. El dato local pertenece a la comparación actual. El estado global requiere regla de limpieza/reconfirmación al cambiar tarea y no es almacenamiento durable.

**Control:** observa valores antes/después del traspaso y prueba segunda entidad en la misma conversación. Crear un input sin mapearlo correctamente no repara el fallo. Comprueba selección generativa por descripción y condiciones del tema, no solo el texto final.

## M5 · Herramienta real y agent flow

El flow de referencia calcula una operación atómica con un contrato. La tool no busca la cifra ni verifica su definición: antes de invocarla deben ser comparables entidad, métrica, períodos y unidad. Una resta correcta de ventas menos EBITDA no prueba una comparación válida.

La construcción reproducible está en studio-lab.md: inputs Number, variables Float con nombres controlados, expresión de delta, Condition base>0, outputs tipados y prueba en run history. No escribas nombres internos del trigger a partir de etiquetas: selecciona tokens reales. Las expresiones del diseñador de flows no son las de PowerFx en Topics.

| Caso | Delta | Relativa | Estado |
|---|---:|---|---|
|100→110|10|0,10 (=10%)|ok|
|110→100|−10|−0,090909… (≈−9,09%)|ok|
|0→7|7|no disponible|base-zero|
|−10→−5|5|no disponible por convención del contrato|base-negative|

El cero técnico de RelativeChange en las dos últimas filas no es0% económico: RelativeAvailable=false obliga a declararlo no disponible. Dato ausente tampoco es base0: debe preguntarse antes de la llamada.

Probar el flow aislado es un hito diferente de invocarlo desde el agente. Para añadirlo como herramienta debe cumplir trigger/response, entorno y publicación del flow; si ese paso no está permitido, deja integración pendiente. Publicar el flow del sandbox no equivale a publicar el agente a usuarios.

La extensión con estado requiere almacenamiento autorizado, unicidad y recuperación. Una consulta previa de clave no basta contra dos llamadas simultáneas; la escritura debe imponer unicidad y devolver duplicate al conflicto.403 es failed-permission, no «registrado». Un reintento con otro identificador puede duplicar efectos; recuperar por la clave original permite conocer el estado.

**Control:** contrasta payload, ruta ejecutada, outputs y registros reales. Una respuesta del simulador o un archivo que describe403 no prueban el comportamiento del backend.

## M6 · Evaluar, distribuir y observar

Una evaluación comprueba varias dimensiones: selección del componente, datos enviados, operación y significado. El92% global no compensa invención en un caso incompleto incluido en alcance. Repite el fallido, normales, fronteras y reservado tras cada modificación.

La cuenta conectada a una evaluación tiene permisos reales; pedir «actúa como otro usuario» no cambia su identidad. El paquete de release distingue rol de autor, entorno, capacidad/licencia, datos, conexión, autenticación y canal. Guardar un borrador no aplica automáticamente cambios a la versión publicada. Publicar y distribuir no conceden permisos a datos.

Test panel no alimenta Analytics del uso publicado. Si el dashboard está vacío tras ensayos de diseño, no concluyas que el agente falla; usa el registro de pruebas para diseño y sesiones autorizadas de canal para uso real. Paneles y transcripciones pueden tener roles y retenciones diferentes. Una exportación/versionado ayuda a recuperar, pero no acredita rollback sin probarlo.

**Control:** la matriz tiene identidad autorizada, otra sin acceso y permisos mínimos. Si no se han ensayado, marca pending. Tiempo antes40 frente10preparación+8revisión+12corrección implica ahorro neto10, no30. Calidad y consumo deben medirse por separado.

## M7 · Excel y Analyst

El entregable útil es un bloque acotado modificado con dependencias explícitas, no una descripción general del modelo. Comprueba fórmula, rango, escenario, signos y unidad. Una perturbación pequeña permite validar sentido y magnitud; por ejemplo, subir NWC como porcentaje de ventas debe consumir caja manteniendo lo demás.

Reconciliar CSV y Excel exige entidad, ejercicio y definición. No sumar históricos y proyecciones como si fueran períodos distintos. Compara outputs con el escenario activo y conserva copia anterior. Los controles del libro ayudan a detectar errores algebraicos; un balance cuadrado no demuestra que el supuesto económico sea defendible.

**Control:** contrasta las fórmulas y las identidades indicadas en modelo.xlsx/Control. `resultados-control.json` es referencia del material educativo, no un output del agente ni un motor de Excel general.

## M8 · Investigar, Pages y Notebooks

Una investigación útil comienza por la hipótesis que podría cambiar, no por una descripción enciclopédica. Define alcance, comparabilidad y evidencia que refutaría tu idea antes de buscar. Una noticia o estimación de mercado no prueba por sí sola el driver de una empresa.

Researcher puede ayudar a construir la investigación; Pages organiza el contenido elaborado y Notebooks el corpus seleccionado, con requisitos reales de habilitación. No inferir que un Notebook indexa todo el entorno ni que una Page convierte una afirmación en evidencia. Cuando llega una fuente nueva, identifica las conclusiones dependientes y actualiza su fecha/limitación.

**Control:** el output separa fuente, afirmación, limitación, interpretación e impacto en hipótesis. Incluye evidencia contraria comparable y lo que no se puede sostener con documentos disponibles.

## M9 · Word y PowerPoint

La práctica es mejorar un documento profesional existente: título con conclusión, tabla/gráfico con unidad y período, y mensajes respaldados. No se exige formato de un banco ni documento de una especialidad.

Los borradores educativos confunden caja19,36 con EBITDA cuando la caja base es11,995, y margen18% de management con16% del base. Identifica la hoja/celda y escenario que corrigen cada afirmación. Corrige primero la afirmación y su origen; después simplifica el mensaje y el diseño. Una modificación de cifra puede afectar texto, gráfico, tabla y conclusión de forma distinta; no rehacer todo por sistema.

**Control:** matriz documento/ubicación/cifra/definición/fuente/versión; revisa cambios contra el modelo. Una presentación visualmente limpia puede seguir contradiciendo el análisis.

## M10 · Transferir el sistema

El proyecto final pide elegir otra tarea, identificar lo reusable y lo que necesita un contrato diferente. El éxito no consiste en usar el máximo número de agentes ni en replicar el ejemplo.

Los traspasos manuales son válidos si se declaran como tales. Programación y Cowork requieren capacidad/habilitación específicas; no convierten cualquier flujo de aplicaciones en automatización garantizada. Studio puede aportar rutas y herramientas cuando el proceso lo justifica, con permisos y pruebas.

**Control:** versión, fuentes, inputs/outputs y dueño por componente; evidencia de tarea nueva, fallo provocado y mejora; ahorro neto y calidad. Una capacidad no habilitada genera un pendiente concreto, no una afirmación de ejecución basada en la simulación.

## Rúbrica común

Valora0–3 cada dimensión: consistencia, trazabilidad, interpretación, utilidad y ausencia de errores críticos. Cita la evidencia que sustenta tu nota y una mejora pendiente.0=ausente/erróneo;1=parcial;2=utilizable con correcciones;3=trazable/defendible. El alumno puede registrar trabajo incompleto para planificar corrección; la aplicación no valida el entregable ni concede dominio profesional por marcar casillas.
