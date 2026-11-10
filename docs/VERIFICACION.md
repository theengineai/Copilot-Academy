# Verificación

Fecha: 10 de noviembre de 2026. Entorno: Node 22, Python 3 y Chromium con Playwright emulando un **iPhone 13**.

## Tests automáticos (`npm test`): 39/39 superados

- **Motor**: XP proporcional a la precisión y sin duplicar al repetir; un examen suspendido no desbloquea; desbloqueo secuencial; niveles L2→L5 (L5 exige el proyecto final); racha por días locales; repaso espaciado; dominio por competencia que sube y baja; logros; recomendaciones.
- **Persistencia**: guardar y recargar, datos corruptos, exportar e importar (la XP de una copia manipulada se recalcula).
- **Copilot simulado**: medidor de la petición; referencias con `/`; archivos restringidos (no aparecen y Copilot no los lee); modo Web sin datos de trabajo; apps y archivo abierto; agentes integrados y propios (el agente sigue activo hasta un chat nuevo); acciones que exigen lo que declaran y escriben archivos; preferencia por la respuesta aún no dada; etiquetas de confidencialidad heredadas; prompts programados; editor de agentes; restauración del laboratorio.
- **Temario**: 7 módulos, 30 lecciones (todas con 2+ tarjetas, 3+ ejercicios, 3+ formatos, ≤ 4 conceptos, ≤ 12 pasos y resumen final), 14 misiones, 8 retos, evaluaciones con banco suficiente, IDs únicos (contados en los JSON, para que no se oculten duplicados), los 34 conceptos practicados, y que cada respuesta correcta valida y cada incorrecta no.
- **Soluciones ejecutadas**: cada uno de los 44 ejercicios con Copilot se reproduce en el simulador. Se comprueba que el estado inicial **no** aprueba, que la solución **sí**, que cada respuesta preparada se alcanza y que una petición vaga **no** basta. Los editores: el texto inicial no aprueba y la solución sí.
- **Nada sin contexto**: las personas y la empresa del caso se presentan en una tarjeta antes de aparecer en un ejercicio; la interfaz del chat y el formato de los agentes se explican antes de su primer ejercicio; cada archivo que menciona un enunciado existe.
- **Cifras del caso**: el puente del margen (128.040 + 7.920 − 5.847 − 313 = 129.800 €) y la simulación de Monte Carlo (media 30,2 %, P5 29,9 %, P95 30,5 %, 13 % por debajo del 30 %) se han recalculado; la simulación se ejecutó con numpy y los parámetros que muestra la lección.
- **Datos**: sin IBAN, DNI, claves de API ni direcciones de correo en el contenido.
- **PWA**: el Service Worker precachea todos los archivos de ejecución; el manifest y los iconos existen; no hay recursos externos; todas las importaciones JS resuelven.

## Recorrido en navegador (`npm run test:e2e`)

Pasos superados, sin errores de JavaScript:
1. Navegación por las 5 pestañas.
2. Lección con un fallo intencionado: el ejercicio fallado se repite al final, la XP es proporcional y el error queda registrado.
3. Persistencia de la XP tras recargar; volver atrás, modo repaso y reanudar una lección tras cerrar la app.
4. Lecciones con Copilot simulado y evaluación del módulo 1: se desbloquea el módulo 2. Los ejercicios se resuelven **pulsando la interfaz real**: Trabajo/Web, Nuevo chat, selector de app, Archivos (Ver, Editar y Nuevo agente) y el editor.
5. Una lección bloqueada no se puede abrir por URL.
6. Misiones 1 y 2.
7. Repaso inteligente: el error registrado aparece y desaparece al acertarlo.
8. Laboratorio: una petición completa enciende los cuatro elementos del medidor y el estado (modo Web) se conserva tras recargar.
9. Reto de laboratorio.
10. Sin conexión: la app, el temario y las lecciones se abren offline.
11. Logros, perfil y reinicio del progreso.

### Recorrido íntegro (`FULL=1`)
Las 30 lecciones, las 7 evaluaciones, las 14 misiones (incluido el proyecto final) y los 8 retos, hasta **nivel L5** (2.600 XP, 15 logros). Captura: `docs/screenshots/perfil-l5.png`.

## Revisión visual
Inicio, Academia, lección, ejercicio con Copilot, laboratorio y hojas de selección en modo claro y oscuro, a ancho de iPhone. Capturas en `docs/screenshots/`.
