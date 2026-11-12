# Copilot Academy · Financiación corporativa

Edición 2 para un profesional habitual de IA en financiación mid-market: construir agentes con metodología y fuentes, modificar un bloque de modelo integrado, producir documentación y defender el repago. Caso ficticio Levante Envases / Murcia Pack; sin datos ni formatos internos de Santander.

La PWA conserva navegación móvil, accesibilidad, progreso local, exportación, repaso y funcionamiento offline. No se conecta a Microsoft. El laboratorio es una simulación guiada con respuestas preparadas: no es evidencia suficiente de competencia.

## Programa

1. Agente de primera lectura: metodología, fuentes separadas y pruebas de fallo.
2. Excel y Analyst: reconciliar archivos, modificar drivers, escenarios, caja y repago.
3. One Pager y FARE educativa: narrativa, plantilla existente, tablas, gráficos y consistencia.
4. Researcher: preguntas de operación, evidencia contraria y actualización.
5. Revisor y Riesgos: cifras, argumentos, preguntas difíciles y verificación contra fuentes.
6. Cambios y reutilización: delta, registro, Studio/flujos y ahorro neto.
7. Transferencia y defensa: otra compañía, selección de herramientas y decisión documentada.

Cada lección incluye un problema, ejemplo trabajado, procedimiento, diagnóstico de fallo, práctica, controles y transferencia. Las misiones reducen pistas y el proyecto final responde a un cambio posterior: exige explicar qué cambia y qué se conserva.

## Ejecutar y verificar

```sh
python3 -m http.server 4173
npm test
npm run test:materials
npm run test:e2e
```

Instala dependencias de pruebas con `python3 -m pip install -r requirements-test.txt` en un entorno virtual.

Node >=20. Producción sin dependencias ni CDN. Pruebas Office: Python con openpyxl, python-docx y python-pptx. Para regenerar materiales: `python3 scripts/build-materials.py` (además xlsxwriter). Pruebas navegador: Python Playwright + `/usr/bin/chromium`, servidor en 4173. No abrir mediante `file://`.

## Materiales

Descargas en Inicio y enlaces de lecciones; todos en `content/resources` y precargados offline:

- Modelo XLSX con inputs azules, fórmulas, históricos, S&U y controles de balance/caja/deuda.
- Caso DOCX, One Pager DOCX y PPTX educativo con tabla y gráfico editables. Los dos borradores contienen errores deliberados identificados.
- Históricos CSV por entidad, correos de aclaración y actualización.
- Metodología, instrucciones de agentes, batería de pruebas y soluciones comentadas.

El modelo es integrado y acotado, no un modelo completo de adquisición: no incluye PPA, goodwill, leases ni caja mensual. El caso explica el colchón temporal de NWC y exige sensibilidad sin liberación. No hay umbrales presentados como política de crédito.

## Evaluación y progreso

Las preguntas cerradas comprueban decisiones y cálculos acotados. Los entregables abiertos conservan evidencia, rúbrica y declaración de errores críticos; se registran como autoevaluación, sin validación semántica. No suman aciertos ni dominio de conceptos. El avance/XP refleja actividad educativa, no acreditación profesional; no se concede experto automáticamente.

La migración de edición archiva íntegramente el estado anterior, reinicia competencias nuevas y conserva preferencias. Perfil permite exportar todo el histórico y los entregables en JSON. Los IDs de actividades nuevas no reutilizan las acreditaciones antiguas.

## Capacidades y límites

[Capacidades y licencias verificadas con fuentes oficiales](docs/CAPACIDADES.md), [revisión independiente](docs/REVIEW.md) y [verificación](docs/VERIFICACION.md). Cada práctica distingue herramienta, habilitación, entradas, salida y alternativa. No se ha accedido al tenant del alumno ni ejecutado las prácticas en Copilot real. Disponibilidad y consumo dependen de licencia, despliegue y configuración.

Agent Builder y Copilot Studio no son intercambiables. Analyst no requiere Python local, pero analizar una extracción no equivale a recalcular fórmulas, macros o vínculos de Excel. Dos agentes invocados manualmente no son una orquestación automática, ni una revisión independiente de fuentes.

[Publicación](docs/PUBLICAR.md) · [Instalación iPhone](docs/INSTALAR_IPHONE.md) · [Especificación de edición](docs/EDITION-SPEC.md)

Sin merge ni despliegue en esta entrega. El workflow publica únicamente cambios en `main`; la rama de trabajo se entrega para revisión.
