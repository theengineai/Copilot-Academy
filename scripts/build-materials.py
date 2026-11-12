"""Materiales educativos ficticios. Reproducir: python3 scripts/build-materials.py."""
from pathlib import Path
import json
import xlsxwriter
from docx import Document
from pptx import Presentation
from pptx.util import Inches, Pt
R=Path(__file__).resolve().parents[1]/'content/resources'; R.mkdir(exist_ok=True)
w=xlsxwriter.Workbook(R/'modelo.xlsx')
head=w.add_format({'bold':True,'bg_color':'#15354C','font_color':'white'})
num=w.add_format({'num_format':'0.00;[Red](0.00)'})
inp=w.add_format({'num_format':'0.00','font_color':'blue','bg_color':'#E6F2FF'})
for name in ['Inputs','Historicos','Modelo','SU','Control']:
 s=w.add_worksheet(name); s.set_column('A:A',43); s.set_column('B:F',18); s.freeze_panes(1,1)
I=w.get_worksheet_by_name('Inputs')
inputs=[('Hipótesis / millones EUR','Management','Base','Revisión'),('Ventas 2026',66,63,61),('EBITDA 2026',9,8,7),('Capex recurrente',3,3,4),('DSO días',60,60,75),('DPO días',45,45,45),('Días inventario',40,40,40),('COGS / ventas',.65,.65,.65),('Tipo interés',.06,.06,.06),('Amortización contractual anual',2,2,2),('Tipo impuesto simplificado',.25,.25,.25),('D&A',2,2,2),('Ventas 2027 / crecimiento',.04,.03,.02)]
for r,row in enumerate(inputs):
 for c,v in enumerate(row): I.write(r,c,v,head if r==0 else inp if c else None)
I.write('A15','Escenario activo: 1 management / 2 base / 3 revisión'); I.write('B15',2,inp); I.data_validation('B15',{'validate':'integer','criteria':'between','minimum':1,'maximum':3})
I.write('A17','Azul = input editable. Sin macros, vínculos externos ni política bancaria.')
H=w.get_worksheet_by_name('Historicos')
hist=[['Históricos combinados / EUR m','2023','2024','2025'],['Ventas Levante',39,42,45],['Ventas Murcia',12,13.5,15],['Ventas combinadas',51,55.5,60],['EBITDA Levante',4.8,5.4,6],['EBITDA Murcia',1.4,1.7,2],['EBITDA combinado',6.2,7.1,8],['Caja post cierre',None,None,2],['Deuda post cierre',None,None,20],['NWC post cierre',None,None,11.32876712328767],['PPE post cierre',None,None,23],['Equity post cierre / balancing opening',None,None,16.32876712328767]]
for r,row in enumerate(hist):
 for c,v in enumerate(row):
  if v is not None:H.write(r,c,v,head if r==0 else num if isinstance(v,(int,float)) else None)
H.write('A14','Perímetro: suma entidades; no sinergias. Balance inicial didáctico post adquisición.')
S=w.get_worksheet_by_name('SU')
for r,row in enumerate([['Sources & Uses / cierre','EUR m'],['Equity adquirido',12],['Refinanciación deuda anterior',8],['Capex inicial capitalizado',3],['Incremento NWC inicial',2],['Fees',1],['Caja mínima inicial',2],['Usos totales',None],['Deuda nueva',20],['Equity nuevo',8],['Fuentes totales',None],['Control fuentes menos usos',None]]):
 for c,v in enumerate(row):
  if v is not None:S.write(r,c,v,head if r==0 else inp if c else None)
S.write_formula('B8','=SUM(B2:B7)',num,28);S.write_formula('B11','=SUM(B9:B10)',num,28);S.write_formula('B12','=B11-B8',num,0)
S.write('A14','La deuda anterior 8 se cancela: saldo nuevo 20, neta inicial 18.');S.write('A15','Capex y NWC de cierre ya incluidos en balance inicial: no duplicarlos en cash flow.')
M=w.get_worksheet_by_name('Modelo');M.write_row('A1',['Modelo integrado simplificado / EUR m','2026','2027'],head)
labels={2:'Ventas',3:'EBITDA',4:'D&A',5:'EBIT',6:'Intereses sobre deuda apertura',7:'Impuestos pagados simplificados',8:'Capex recurrente',9:'Clientes',10:'Inventarios',11:'Proveedores',12:'NWC operativo',13:'Variación NWC',14:'CFADS = EBITDA − impuestos − capex − ΔNWC',15:'Amortización contractual',16:'Servicio deuda = intereses + principal',17:'DSCR = CFADS / servicio',18:'Caja apertura',19:'Variación caja tras servicio',20:'Caja cierre (sin revolver automático)',21:'Deuda apertura',22:'Deuda cierre',23:'Deuda neta',24:'Deuda neta / EBITDA',25:'PPE apertura',26:'PPE cierre',27:'Equity apertura',28:'Resultado neto',29:'Equity cierre',30:'Activos = caja + NWC + PPE',31:'Pasivos + equity = deuda + equity',32:'Control balance',33:'Control deuda',34:'Control caja'}
for r,l in labels.items():M.write(r-1,0,l)
# Calculate reference values alongside formulas; caches make downloads readable without recalculation.
scenarios=[]
for idx in range(1,4):
 col=idx
 vals={}; previous=None
 for year in [2026,2027]:
  revenue=inputs[1][col] if year==2026 else previous[2]*(1+inputs[12][col]); ebitda=inputs[2][col] if year==2026 else revenue*inputs[2][col]/inputs[1][col]
  v={2:revenue,3:ebitda,4:inputs[11][col],8:inputs[3][col],15:2,18:2 if previous is None else previous[20],21:20 if previous is None else previous[22],25:23 if previous is None else previous[26],27:hist[11][3] if previous is None else previous[29]}
  v[5]=v[3]-v[4];v[6]=v[21]*.06;v[7]=max(0,(v[5]-v[6])*.25);v[9]=revenue*inputs[4][col]/365;v[10]=revenue*.65*40/365;v[11]=revenue*.65*45/365;v[12]=v[9]+v[10]-v[11];v[13]=v[12]-(hist[9][3] if previous is None else previous[12]);v[14]=v[3]-v[7]-v[8]-v[13];v[16]=v[6]+v[15];v[17]=v[14]/v[16];v[19]=v[14]-v[16];v[20]=v[18]+v[19];v[22]=v[21]-v[15];v[23]=v[22]-v[20];v[24]=v[23]/v[3];v[26]=v[25]+v[8]-v[4];v[28]=v[5]-v[6]-v[7];v[29]=v[27]+v[28];v[30]=v[20]+v[12]+v[26];v[31]=v[22]+v[29];v[32]=v[30]-v[31];v[33]=0;v[34]=0
  vals[year]=v;previous=v
 scenarios.append(vals)
for c,letter,prev in [(1,'B',None),(2,'C','B')]:
 p=letter; f=lambda row:f'INDEX(Inputs!B{row}:D{row},1,Inputs!$B$15)'
 formulas={2:f'={f(2)}' if not prev else f'={prev}2*(1+{f(13)})',3:f'={f(3)}' if not prev else f'={p}2*{f(3)}/{f(2)}',4:f'={f(12)}',5:f'={p}3-{p}4',6:f'={p}21*{f(9)}',7:f'=MAX(0,({p}5-{p}6)*{f(11)})',8:f'={f(4)}',9:f'={p}2*{f(5)}/365',10:f'={p}2*{f(8)}*{f(7)}/365',11:f'={p}2*{f(8)}*{f(6)}/365',12:f'={p}9+{p}10-{p}11',13:f'={p}12-'+('Historicos!D10' if not prev else f'{prev}12'),14:f'={p}3-{p}7-{p}8-{p}13',15:f'={f(10)}',16:f'={p}6+{p}15',17:f'={p}14/{p}16',18:'=Historicos!D8' if not prev else f'={prev}20',19:f'={p}14-{p}16',20:f'={p}18+{p}19',21:'=SU!B9' if not prev else f'={prev}22',22:f'={p}21-{p}15',23:f'={p}22-{p}20',24:f'={p}23/{p}3',25:'=Historicos!D11' if not prev else f'={prev}26',26:f'={p}25+{p}8-{p}4',27:'=Historicos!D12' if not prev else f'={prev}29',28:f'={p}5-{p}6-{p}7',29:f'={p}27+{p}28',30:f'={p}20+{p}12+{p}26',31:f'={p}22+{p}29',32:f'={p}30-{p}31',33:f'={p}21-{p}15-{p}22',34:f'={p}18+{p}14-{p}16-{p}20'}
 for r,formula in formulas.items():M.write_formula(r-1,c,formula,num,scenarios[1][2026+c-1][r])
C=w.get_worksheet_by_name('Control');C.write_row('A1',['Control','Residual esperado cero'],head)
for r,(label,formula) in enumerate([('Sources & Uses','=SU!B12'),('Balance 2026','=Modelo!B32'),('Balance 2027','=Modelo!C32'),('Deuda 2026','=Modelo!B33'),('Caja 2026','=Modelo!B34')],1): C.write(r,0,label);C.write_formula(r,1,formula,num,0)
C.write('A9','No basta control cero: revisar escenarios, fuentes y caja negativa.');C.write('A10','DSCR sin política: CFADS excluye intereses; servicio los incluye una sola vez.')
w.close()
(R/'resultados-control.json').write_text(json.dumps(scenarios,indent=2))
def doc(name,title,paragraphs):
 d=Document();d.add_heading(title,0)
 for h,p in paragraphs:d.add_heading(h,1);d.add_paragraph(p)
 d.save(R/name)
doc('caso.docx','Levante Envases / Murcia Pack — caso ficticio',[
('Mandato educativo','Fabricante de envases alimentarios de Valencia adquiere a un competidor de Murcia para ampliar cobertura. No representa clientes, políticas ni formatos de Santander. Cifras en millones EUR; cierre al 31/12/2025.'),
('Negocio y mercado','Ventas 2025 45 + 15 = 60; EBITDA 6 + 2 = 8. Clientes alimentación 70%, industrial 30%; cliente mayor 18%. Contratos anuales, materias primas con revisión trimestral. Hipótesis comercial: volumen +5% y precio +5% management. Estas son afirmaciones de management, no evidencia de mercado externa.'),
('Históricos combinados','2023 ventas 51 EBITDA 6,2; 2024 ventas 55,5 EBITDA 7,1; 2025 ventas 60 EBITDA 8. Sin ajustes por sinergias. Revisar si EBITDA excluye gastos recurrentes antes de financiar.'),
('Operación','Compra de equity 12, cancela deuda existente 8, capex inicial 3, incremento NWC 2, fees 1 y caja mínima 2: usos 28. Deuda nueva 20 y equity nuevo 8. Deuda neta inicial 18. El precio de equity no es enterprise value.'),
('Casos y modelo','Management 2026 ventas 66 EBITDA 9; base 63 y 8 sin sinergias. Capex recurrente 3, DSO 60, DPO 45, inventario 40 días. Tipo 6%; principal 2/año. Caso de revisión ventas 61 EBITDA 7 capex 4 DSO 75. Elegir Inputs!B15 = 1/2/3. Recalcular en Excel.'),
('Alcance contable','Balance post cierre simplificado: caja 2, NWC 11,328767, PPE 23, deuda 20, equity 16,328767. NWC neto de proveedores; no volver a sumar proveedores al pasivo. No incluye PPA, goodwill, leases ni impuestos diferidos. No es un modelo de adquisición completo; el ejercicio modifica el bloque operativo y deuda con dependencias explícitas.'),
('Preguntas pendientes','Concentración y calidad de clientes, calendario mensual de capex y amortización, aging, contratos, ajustes EBITDA, covenants y acceso a liquidez. El modelo anual no prueba ausencia de tensiones estacionales.')])
doc('one-pager.docx','One Pager educativo — BORRADOR con discrepancias',[
('Recomendación provisional','Levante compra Murcia Pack. Solicitud deuda 20 y equity 8 para usos 28. No hay aprobación ni política crediticia implícita.'),('Repago pendiente de revisión','EBITDA base 9; deuda neta inicial 20; ratio inicial 2,22x. Estas cifras son deliberadamente incorrectas: localizar, recalcular y corregir contra caso y modelo, no copiar a una propuesta real.'),('Estructura y riesgos','Principal anual 2, tipo 6%; analizar capacidad de repago frente a EBITDA, capex y cobros. Completar calendario, garantías y riesgos sin inventar términos pactados.'),('Trazabilidad requerida','Cada cifra debe indicar libro, hoja, celda, escenario, fecha y definición. Conservar versiones y explicar la recomendación con incertidumbres.')])
r=Presentation();r.slide_width=Inches(13.333);r.slide_height=Inches(7.5)
slides=[('FARE educativa · Levante / Murcia','Plantilla propia de formación. No es formato Santander.\nBORRADOR con discrepancias intencionadas.'),('La adquisición amplía cobertura, pero exige financiar integración','Negocio: envases alimentarios. Ventas 2025 60; EBITDA 8.\nPreguntas: clientes, indexación de materias primas y retención comercial.'),('Los usos de 28 requieren deuda 20 y equity 8','Compra equity 12 | refinanciación 8 | capex inicial 3 | NWC 2 | fees 1 | caja 2.\nGráfico sugerido: barras fuentes/usos, con categorías y fecha.'),('El caso base genera EBITDA 9 y deuda neta inicial 20','DISCREPANCIAS DELIBERADAS: sustituir por base 8 y neta inicial 18.\nNo confundir management, saldo de cierre inicial y saldo final 2026.'),('La tensión de cobros puede consumir la caja de repago','Construir tabla management/base/revisión: CFADS, servicio, DSCR y caja.\nAñadir puente EBITDA → CFADS con cifras del modelo; no inferir riesgo solo del leverage.'),('La decisión requiere resolver tres incertidumbres','Aging y cobros | calendario capex | integración y ajustes EBITDA.\nVincular cada riesgo a evidencia pendiente, responsable y mitigante comprobable.\nRegistrar fecha y cambios de versión.')]
for title,body in slides:
 s=r.slides.add_slide(r.slide_layouts[1]);s.shapes.title.text=title;s.placeholders[1].text=body
 for sh in s.shapes:
  if sh.has_text_frame:
   for p in sh.text_frame.paragraphs:
    for run in p.runs:run.font.size=Pt(28 if sh==s.shapes.title else 22)
r.save(R/'fare.pptx')
(R/'actualizacion.eml').write_text('From: direccion@levante.example\nTo: analista@example.org\nDate: Thu, 12 Nov 2026 09:00:00 +0000\nSubject: Revision v2 del caso — ficticio\nContent-Type: text/plain; charset=utf-8\n\nSustituye hipótesis 2026: ventas 61, EBITDA 7, capex recurrente 4 (antes 3), DSO 75 (antes 60). DPO e inventario sin cambios. No cambiar usos de cierre ya ejecutados. No asumir nueva financiación automática. Explica caja bajo mínimo en 2026 y negativa en 2027, y opciones pendientes; no inventes consentimiento del banco. Necesitamos delta del modelo y del pack, con registro de decisiones.\n')
print('Materiales generados',R)
# Working artifacts to revise rather than blank narrative placeholders.
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE
r=Presentation(R/'fare.pptx')
s=r.slides[4]
s.placeholders[1].text='CFADS y caja del caso 2026 · millones EUR. Fuente: modelo / escenarios. No son límites de crédito.'
s.placeholders[1].height=Inches(1.1)
table=s.shapes.add_table(4,5,Inches(.6),Inches(3),Inches(12),Inches(2.2)).table
for c,v in enumerate(['Escenario','EBITDA','CFADS','DSCR','Caja cierre']):table.cell(0,c).text=v
for i,(name,v) in enumerate(zip(['Management','Base','Revisión'],scenarios),1):
 for c,val in enumerate([name,v[2026][3],v[2026][14],v[2026][17],v[2026][20]]):table.cell(i,c).text=val if isinstance(val,str) else f'{val:.2f}'
s=r.slides[2];s.placeholders[1].height=Inches(1.4)
data=CategoryChartData();data.categories=['Fuentes','Usos'];
for name,vals in [('Deuda',(20,0)),('Equity',(8,0)),('Compra',(0,12)),('Refinanciación',(0,8)),('Capex',(0,3)),('NWC',(0,2)),('Fees',(0,1)),('Caja',(0,2))]:data.add_series(name,vals)
s.shapes.add_chart(XL_CHART_TYPE.COLUMN_STACKED,Inches(.7),Inches(3.1),Inches(11.7),Inches(3.8),data)
r.save(R/'fare.pptx')
(R/'historicos-entidades.csv').write_text('entidad,ejercicio,ventas_eur_m,ebitda_eur_m\nLevante,2023,39,4.8\nMurcia,2023,12,1.4\nLevante,2024,42,5.4\nMurcia,2024,13.5,1.7\nLevante,2025,45,6\nMurcia,2025,15,2\n')
(R/'aclaracion.eml').write_text('From: cfo@levante.example\nTo: analista@example.org\nDate: Wed, 11 Nov 2026 10:00:00 +0000\nSubject: Aclaraciones de cierre — ficticio\nContent-Type: text/plain; charset=utf-8\n\nLos 8 de deuda existente se cancelan en cierre. No se suman a deuda nueva 20. EBITDA 9 es management; base 8 sin sinergias. Los 3 capex y 2 NWC de Sources & Uses son iniciales y están en el balance apertura. Capex recurrente 3 y variación NWC 2026 son flujos posteriores. Pendiente aging y calendario mensual de inversiones.\n')
d=Document(R/'caso.docx');d.add_heading('Hipótesis material de circulante: colchón temporal',1);d.add_paragraph('NWC inicial 11,328767 = normalizado sobre ventas 60 (9,328767) + colchón de cierre 2. El modelo libera ese colchón en 2026: base NWC 9,795205, variación −1,533562. No atribuir esta caja al crecimiento. Si el colchón se mantiene, CFADS y caja 2026 bajan en 2: base CFADS 3,333562, caja 2,133562, DSCR 1,041738. Solicitar aging e inventario mensual para justificar liberación; la recomendación debe contrastar ambos casos.');d.save(R/'caso.docx')
with (R/'aclaracion.eml').open('a') as f:f.write('\nEl NWC inicial incorpora colchón temporal 2. La liberación en 2026 no está verificada: presentar sensibilidad sin liberación.\n')
