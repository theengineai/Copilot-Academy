# Método de análisis · práctica educativa propia

Paquete ficticio. No es metodología ni política de Santander. Unidades EUR millones salvo indicación; no usar umbrales de aprobación inventados.

## Inventario y jerarquía

Registra caseId, versión, autor, fecha efectiva y perímetro. Método reusable contiene reglas; las plantillas contienen estructura; los datos de la operación viven en un paquete aislado. Histórico reportado, ajustes, management, base y revisión son columnas distintas. Un documento más nuevo puede tener menos autoridad; resuelve conflictos con fuente y definición.

## Operación

Levante Envases compra Murcia Pack. Equity value12 no equivale a enterprise value sin puente. Usos: compra12+refinanciación8+capex inicial3+NWC inicial2+fees1+caja mínima2=28. Fuentes: deuda nueva20+equity8=28. La deuda refinanciada8 se cancela: post cierre deuda20 y caja2, neta18. No sumar 8 otra vez ni tratar equity como EBITDA. Capex inicial y NWC inicial pertenecen al cierre; movimientos posteriores van a flujos de proyección y no duplican uses.

## Modelo y escenarios

Entender fórmulas y dependencias antes de editar. Cambiar inputs identificados, nunca reemplazar fórmulas por resultados opacos. Reconciliar nuevos históricos con apertura y fuente. No afirmar que una extracción ejecuta macros, vínculos ni todo Excel. En Analyst se encarga y valida análisis en servicio; no hace falta instalar Python local. Excel directo es preferible para editar y recalcular el libro.

2025 combinado ventas60 y EBITDA8 (6+2). 2026 management9, base8, revisión7. Sinergias excluidas del base. Capex recurrente base3/revisión4; DSO60/75. A ventas60, +15 días añade60×15/365=2,46575 de clientes; usa ventas del período concreto para el forecast. No restar incremento de clientes del EBITDA: reduce caja vía ΔNWC.

CFADS=EBITDA−impuestos caja−capex−ΔNWC (educativo, antes de intereses y principal). Servicio=intereses caja+principal contractual. DSCR=CFADS/servicio del mismo período; denominador cero requiere tratamiento explícito. Caja final=caja inicial+CFADS−intereses−principal+deuda nueva+equity−otros usos documentados. Caja mínima es restricción de liquidez, no gasto. Un modelo anual puede ocultar un bache mensual.

## Controles

Activo−pasivo−patrimonio=0; caja apertura+movimientos−caja cierre=0; deuda apertura+disposiciones−amortización−deuda cierre=0; fuentes−usos=0. Comprobar importe, signo, período, unidades y no solo que una celda muestre cero. Pruebas: DSO+15 con ventas constantes, EBITDA−1, capex+1, y escenario combinado; mantener el resto constante para aislar drivers. En fuentes insuficientes no inventar ni completar con cero.

## Documentos y decisión

One Pager: racional y propuesta, S&U, negocio, drivers, repago, riesgos, mitigantes verificables y pendientes. Presentación educativa tipo FARE: negocio→operación→caja→riesgos→decisión. Títulos con conclusión cuantificada, tablas/gráficos con fuente/fecha/unidades, espacio para límites. El revisor contrasta Excel/Word/PPT y vuelve a leer títulos tras cada cambio.

Toda decisión incluye: qué propones, evidencia, condiciones, riesgos aceptados, información que falta y qué cambiaría la propuesta. Ni ratio aislado ni revisión de otro agente prueban capacidad de repago. Conservar versiones, cambios, responsables y fuente de cada decisión; medir ahorro neto incluyendo preparación, revisión, correcciones y mantenimiento.
