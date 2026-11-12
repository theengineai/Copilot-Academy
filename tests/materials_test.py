"""Open real Office artifacts and independently evaluate every model formula."""
from pathlib import Path
import json,re,math,csv
from openpyxl import load_workbook
from docx import Document
from pptx import Presentation
R=Path(__file__).resolve().parents[1]/'content/resources'
w=load_workbook(R/'modelo.xlsx',data_only=False);cache=load_workbook(R/'modelo.xlsx',data_only=True)
assert set(w.sheetnames)=={'Historicos','Inputs','Modelo','Control'}
assert 'Aurora' in '\n'.join(p.text for p in Document(R/'expediente.docx').paragraphs)
assert 'ERRORES DELIBERADOS' in '\n'.join(p.text for p in Document(R/'documento-trabajo.docx').paragraphs)
ppt=Presentation(R/'presentacion.pptx');assert len(ppt.slides)==6
assert any(sh.has_chart for sl in ppt.slides for sh in sl.shapes)
table=next(sh.table for sl in ppt.slides for sh in sl.shapes if sh.has_table)
assert table.cell(1,2).text=='19.360' and table.cell(1,4).text=='11.995'
hist=list(csv.DictReader((R/'historicos.csv').open()))
for r,col in zip(hist,['B','C']):
 assert float(r['ventas'])==w['Historicos'][col+'2'].value
 assert math.isclose(float(r['ebitda']),w['Historicos'][col+'3'].value)
comparables=list(csv.DictReader((R/'comparables.csv').open()))
for row in comparables:assert float(row['enterprise_value'])/float(row['ebitda_reportado'])==8
assert float(comparables[0]['ajustes_management'])==1.5

def calc(sheet,addr,scenario):
 if sheet=='Inputs' and addr=='B12':return scenario
 val=w[sheet][addr].value
 if not isinstance(val,str) or not val.startswith('='):return val or 0
 expr=val[1:]
 expr=re.sub(r'INDEX\((\w+)!([A-Z]+\d+):([A-Z]+\d+),(\d+),Inputs!\$B\$12\)',lambda m:str(calc(m[1],chr(ord(m[2][0])+scenario-1)+m[2][1:],scenario)),expr)
 expr=re.sub(r'(?:(\w+)!)?(\$?[A-Z]+\$?\d+)',lambda m:str(calc(m[1] or sheet,m[2].replace('$',''),scenario)),expr)
 assert re.fullmatch(r'[\d.eE+*/(), \-MAX]+',expr),expr
 return eval(expr,{'__builtins__':{},'MAX':max})
reference=json.loads((R/'resultados-control.json').read_text())
for scenario in [1,2,3]:
 for col,year in [('B','2026'),('C','2027')]:
  for row,expected in reference[scenario-1][year].items():
   result=calc('Modelo',f'{col}{row}',scenario)
   assert math.isclose(result,expected,abs_tol=1e-8),(scenario,year,row,result,expected)
   if scenario==1:assert math.isclose(result,cache['Modelo'][f'{col}{row}'].value,abs_tol=1e-8)
  for row in [27,28,29]:assert abs(calc('Modelo',f'{col}{row}',scenario))<1e-8
 assert calc('Modelo','B19',scenario)==27
assert calc('Modelo','B17',3)<calc('Modelo','B17',1)<calc('Modelo','B17',2)
# Metamorphic control: +1 capex changes cash and PPE in opposite directions,
# leaving profit and debt constant; a wrong debt formula breaks a separate identity.
old=w['Inputs']['B4'].value;w['Inputs']['B4']=old+1
assert math.isclose(calc('Modelo','B17',1),10.995,abs_tol=1e-8)
assert math.isclose(calc('Modelo','B22',1),52,abs_tol=1e-8)
assert math.isclose(calc('Modelo','B8',1),9.645,abs_tol=1e-8)
assert abs(calc('Modelo','B27',1))<1e-8;w['Inputs']['B4']=old
old=w['Modelo']['B19'].value;w['Modelo']['B19']='=B18+B14'
assert abs(calc('Modelo','B29',1))>0;w['Modelo']['B19']=old
print('PASS: OOXML, CSV and chart/table; every model formula, 3 scenarios x 2 years, balance/cash/debt, capex control and debt mutation.')
