"""Open OOXML files and independently recalculate the model's supported formulas."""
from pathlib import Path
import json,re,math,csv
from openpyxl import load_workbook
from docx import Document
from pptx import Presentation
R=Path(__file__).resolve().parents[1]/'content/resources'
w=load_workbook(R/'modelo.xlsx',data_only=False)
cached=load_workbook(R/'modelo.xlsx',data_only=True)
assert set(w.sheetnames)=={'Inputs','Historicos','Modelo','SU','Control'}
assert Document(R/'caso.docx').paragraphs
assert 'DISCREPANCIAS' in '\n'.join(p.text for p in Document(R/'one-pager.docx').paragraphs).upper()
p=Presentation(R/'fare.pptx');assert len(p.slides)==6
assert any(sh.has_chart for sl in p.slides for sh in sl.shapes)
tables=[sh.table for sl in p.slides for sh in sl.shapes if sh.has_table]
assert tables[0].cell(2,2).text=='5.33' and tables[0].cell(3,4).text=='0.19'
rows=list(csv.DictReader((R/'historicos-entidades.csv').open()))
for year,col in [(2023,'B'),(2024,'C'),(2025,'D')]:
 subset=[r for r in rows if int(r['ejercicio'])==year]
 assert sum(float(r['ventas_eur_m']) for r in subset)==w['Historicos'][col+'4'].value
 assert math.isclose(sum(float(r['ebitda_eur_m']) for r in subset),w['Historicos'][col+'7'].value)
assert any('DELIBERADAS' in sh.text for sl in p.slides for sh in sl.shapes if sh.has_text_frame)
def calc(sheet,addr,scenario,seen=None):
 if sheet=='Inputs' and addr=='B15': return scenario
 v=w[sheet][addr].value
 if not isinstance(v,str) or not v.startswith('='):return v or 0
 expr=v[1:]
 expr=re.sub(r'INDEX\((\w+)!([A-Z]+\d+):([A-Z]+\d+),(\d+),Inputs!\$B\$15\)',lambda m:str(calc(m[1],chr(ord(m[2][0])+scenario-1)+m[2][1:],scenario)),expr)
 expr=re.sub(r'SUM\(([A-Z]+)(\d+):([A-Z]+)(\d+)\)',lambda m:str(sum(calc(sheet,m[1]+str(i),scenario) for i in range(int(m[2]),int(m[4])+1))),expr)
 expr=re.sub(r'(?:(\w+)!)?(\$?[A-Z]+\$?\d+)',lambda m:str(calc(m[1] or sheet,m[2].replace('$',''),scenario)),expr)
 assert re.fullmatch(r'[\d.eE+*/(), \-MAX]+',expr),expr
 return eval(expr,{'__builtins__':{},'MAX':max})
references=json.loads((R/'resultados-control.json').read_text())
for scenario in [1,2,3]:
 for col,year in [('B','2026'),('C','2027')]:
  for row,expected in references[scenario-1][year].items():
   value=calc('Modelo',f'{col}{row}',scenario)
   assert math.isclose(value,expected,abs_tol=1e-8),(scenario,col,row,value,expected)
   if scenario==2:assert math.isclose(value,cached['Modelo'][f'{col}{row}'].value,abs_tol=1e-8)
  for row in [32,33,34]:assert abs(calc('Modelo',f'{col}{row}',scenario))<1e-8
 assert calc('SU','B12',scenario)==0
assert 0<calc('Modelo','B20',3)<2,'shock breaches minimum liquidity'
assert calc('Modelo','C20',3)<0,'second year shock reveals negative cash'
assert calc('Modelo','B17',3)<calc('Modelo','B17',2)
assert calc('Modelo','B3',1)==9 and calc('Modelo','B3',2)==8
# A changed formula must be detected rather than trusting cached results.
old=w['Modelo']['B22'].value;w['Modelo']['B22']='=B21+B15'
assert abs(calc('Modelo','B33',2))>0;w['Modelo']['B22']=old
assert math.isclose(calc('Modelo','B14',2)-2,3.333561643835616,abs_tol=1e-8)
print('PASS: OOXML opened; all formulas recalculated across 3 scenarios x 2 years; controls and negative cash shock; mutation detected.')
