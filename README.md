# Copilot Academy · Dominio de Copilot para profesionales financieros

Edición 3: aprender a dominar Microsoft 365 Copilot y construir agentes reutilizables, con ejemplos financieros que sirven a diferentes funciones. No requiere trabajar en una operación, un formato documental o una especialidad concreta.

## Programa

| Módulo | Capacidad que desarrolla |
|---|---|
| 1. Elegir y dirigir Copilot | Elegir chat, aplicación, Analyst, Researcher o agente; controlar contexto y verificar |
| 2. Construir con Agent Builder | Diseñar contrato e instrucciones, configurar y mejorar por fallos |
| 3. Conocimiento y pruebas | Separar fuentes, configurar capacidades y probar el agente |
| 4. Studio: conversación | Crear agente, temas, preguntas, condiciones y variables |
| 5. Studio: herramientas y flujos | Construir agent flow sin conectores, mapear entradas/salidas, probar errores |
| 6. Studio: ciclo de vida | Test, trazas, autenticación, distribución, analítica y cambios |
| 7. Excel y Analyst | Comprender estructura, editar fórmulas y encargar análisis verificado |
| 8. Researcher, Pages, Notebooks | Investigar con evidencia y organizar trabajo/fuentes |
| 9. Word y PowerPoint | Crear, transformar y mejorar documentos existentes |
| 10. Sistema reutilizable | Traspasos, automatización opcional, ahorro neto y agente propio |

30 lecciones: **15 dedicadas a construir agentes (módulos 2–6), de las cuales 9 son de Copilot Studio**. Los agentes se presentan desde el primer módulo. El alumno aprende a diseñarlos y probarlos; las plantillas y ejemplos son puntos de partida para otras tareas.

No se enseña finanzas básicas ni programación. Cada lección incluye ejemplo trabajado, decisiones, procedimiento, fallo diagnosticable, práctica menos guiada, controles y transferencia. Analyst no requiere Python instalado; analizar una extracción no equivale a editar/recalcular el libro Excel. Studio tiene laboratorios reales reproducibles cuando existe acceso de autor y entorno; una simulación o diseño no demuestra ejecución real.

## Materiales y aplicación

PWA estática, sin servidor de aplicación ni API de IA. Navegación móvil/escritorio, accesibilidad, progreso local, copia exportable y recursos offline tras la descarga inicial. La web publicada no cambia por abrir una PR.

Descargables reales en Inicio: libro XLSX con fórmulas y controles de balance/caja/deuda, fuentes DOCX, documento DOCX y presentación PPTX editables con errores deliberados identificados, CSV y correos. Aurora y comparables son ficticios, sin información ni criterios de una entidad. Cada archivo sirve a distintas prácticas; no hay una transacción obligatoria.

Recursos de agentes: guía de construcción, instrucciones, metodología, batería con fixtures, soluciones y **studio-lab.md** con pasos, campos, tipos, entradas/salidas y diagnóstico. La matriz de licencias y alternativas también se descarga offline.

## Evaluación y migración

Preguntas cerradas comprueban decisiones acotadas. Portfolio conserva evidencia, rúbrica y errores críticos declarados; no lee los archivos del alumno ni hace validación semántica. No otorga aciertos, SRS ni acreditación de experto. El laboratorio es una simulación local guiada con respuestas preparadas.

La edición 3 usa IDs nuevos y archiva el progreso de las ediciones anteriores, conservando preferencias e histórico exportable. Perfil permite descargar todo en JSON. Los aprobados de actividades distintas no se trasladan a competencias nuevas.

## Ejecutar y probar

```sh
python3 -m http.server 4173
npm test
npm run test:materials
npm run test:e2e
```

Node >=20. Pruebas: `python3 -m pip install -r requirements-test.txt` en un entorno virtual, Chromium en `/usr/bin/chromium`. El servidor debe estar activo para e2e. Producción sin dependencias de terceros ni CDN. Regenerar Office: `python3 scripts/build-materials.py`.

[Capacidades y fuentes Microsoft](docs/CAPACIDADES.md) · [Revisión independiente v3](docs/REVIEW3.md) · [Verificación](docs/VERIFICACION.md) · [Publicar en Pages](docs/PUBLICAR.md) · [Instalar en iPhone](docs/INSTALAR_IPHONE.md)

Validación pendiente en el tenant del alumno: creación/recuperación de agentes, ejecución real de flujos, permisos, capacidades y consumo. Las fuentes oficiales no demuestran habilitación individual. Las pruebas OOXML no son renderizado ni recálculo con Microsoft Office. La PWA no se conecta a Microsoft ni ejecuta un agente de producción.
