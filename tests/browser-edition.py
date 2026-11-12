from playwright.sync_api import sync_playwright
from pathlib import Path
import json,os
ROOT=Path(__file__).resolve().parents[1]
mods=[json.loads((ROOT/f'content/modules/m{i}.json').read_text()) for i in range(1,8)]
missions=json.loads((ROOT/'content/missions.json').read_text())
BASE='http://127.0.0.1:4173'
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 ctx=browser.new_context(viewport={'width':390,'height':844},accept_downloads=True,reduced_motion='reduce')
 page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE+'/manifest.webmanifest')
 page.evaluate("Promise.all([caches.open('cpa-old-edition'),caches.open('cca-legacy')])")
 page.goto(BASE);page.locator('.hero').wait_for()
 page.evaluate('navigator.serviceWorker.ready');page.wait_for_timeout(1200)
 assert page.evaluate("caches.keys().then(keys=>!keys.includes('cpa-old-edition')&&!keys.includes('cca-legacy'))"),'stale caches removed'
 assert page.locator('a[download]').count()>=11
 for path in ['modelo.xlsx','caso.docx','one-pager.docx','fare.pptx','actualizacion.eml']:
  assert page.request.get(BASE+'/content/resources/'+path).status==200
 page.screenshot(path=str(ROOT/'docs/screenshots/edition-mobile.png'),full_page=True)
 page.get_by_text('Archivos del caso · descargar materiales').click()
 page.locator('a[download]').first.wait_for()
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), 'mobile overflow'
 # Every new activity through rendered controls, using answer keys only as a test driver.
 exs={}
 for m in mods:
  for l in m['lessons']:
   for s in l['steps']:
    if s.get('id'):exs[s['id']]=s
  for s in m['exam']['extra']:exs[s['id']]=s
 for m in missions:
  for s in m['steps']:exs[s['id']]=s
 lab=json.loads((ROOT/'content/lab.json').read_text())
 for c in lab:exs[c['id']+'#ex']=c['exercise']
 def run(route,steps=None):
  print('RUN',route,flush=True)
  page.goto(BASE+'/'+route);page.locator('.act-step').wait_for()
  for guard in range(100):
   if page.locator('.results').count():break
   root=page.locator('[data-ex-id]')
   if not root.count():
    page.locator('.act-foot button').last.click();continue
   step=exs[root.get_attribute('data-ex-id')];t=step['type']
   if t=='choice':
    page.locator(f'.option[data-idx="{next(i for i,o in enumerate(step["options"]) if o.get("correct"))}"]').click()
   elif t=='order':
    for i in range(len(step['items'])):
     for _ in range(20):
      rows=page.locator('.order-item');data=rows.evaluate_all('(els)=>els.map(e=>e.dataset.idx)');j=data.index(str(i))
      if j==i:break
      rows.nth(j).get_by_role('button',name='Subir').click()
   elif t=='portfolio':
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),route+' portfolio overflow'
    if not (ROOT/'docs/screenshots/edition-portfolio.png').exists():
     page.wait_for_timeout(400);page.screenshot(path=str(ROOT/'docs/screenshots/edition-portfolio.png'),full_page=False)
    page.locator('textarea').first.fill('Entregable de prueba: modelo.xlsx Modelo B14 base 5,333562. EBITDA8 deuda20 neta18. Evidencia/decisiones/controles registrados. '+str(step.get('solution','')))
    for el in page.locator('select').all():
     values=el.locator('option').evaluate_all('(els)=>els.map(e=>e.value)');el.select_option('2' if '2' in values else 'no')
   elif t=='copilot':
    for cmd in step['solution']:
     page.locator('.cp-input').fill(cmd);page.locator('.cp-input').press('Enter')
   else:raise AssertionError('Unexpected type '+t)
   page.locator('.act-foot button').last.click()
   page.locator('.feedback button').last.click()
  page.locator('.results').wait_for(timeout=4000)
 # Core first lesson via UI, then unlock remaining routes with explicit fixture state.
 first=mods[0]['lessons'][0];run('#/lesson/'+first['id'],first['steps'])
 state=page.evaluate('JSON.parse(localStorage.getItem("cpa.state"))')
 assert state.get('portfolio'), 'portfolio persisted'
 # fixture grants access only; it does not count as evidence of completing exercises.
 for m in mods:
  state['exams'][m['id']]={'passed':True,'best':1}
  for l in m['lessons']:state['lessons'][l['id']]={'completedAt':'2026-11-12','best':1}
 page.evaluate('(s)=>localStorage.setItem("cpa.state",JSON.stringify(s))',state)
 page.reload()
 for m in ([] if os.environ.get('CONTROLS_ONLY') else mods):
  for lesson in m['lessons']:run('#/lesson/'+lesson['id'])
  run('#/exam/'+m['id'])
  print('PASS activities',m['id'],flush=True)
 for mission in ([] if os.environ.get('CONTROLS_ONLY') else missions):run('#/mission/'+mission['id'])
 for challenge in ([] if os.environ.get('CONTROLS_ONLY') else lab):run('#/challenge/'+challenge['id'])
 for route in ['#/academy','#/missions','#/lab','#/profile']:
  page.goto(BASE+'/'+route);page.locator('.page').wait_for();page.wait_for_timeout(200)
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),route+' overflow'
 # Export/restore through UI, retaining the newly authored evidence.
 page.goto(BASE+'/#/profile')
 with page.expect_download() as backup:page.get_by_role('button',name='Descargar copia (.json)').click()
 backup_text=Path(backup.value.path()).read_text();assert json.loads(backup_text)['state']['portfolio']
 page.get_by_role('button',name='Restaurar una copia').click();page.locator('.import-area').fill(backup_text);page.get_by_role('button',name='Restaurar',exact=True).click()
 page.get_by_label('Tema',exact=True).select_option('dark');page.screenshot(path=str(ROOT/'docs/screenshots/edition-dark.png'),full_page=True)
 page.get_by_label('Tema',exact=True).select_option('light')
 # Resume and a deliberately wrong answer keep earlier learning controls exercised.
 page.goto(BASE+'/#/lesson/'+first['id']);page.locator('.act-step').wait_for();page.locator('.act-foot button').last.click();page.get_by_role('button',name='Salir',exact=True).click()
 assert page.evaluate('Object.keys(JSON.parse(localStorage.getItem("cpa.state")).inProgress).length')>0
 page.goto(BASE+'/#/lesson/'+first['id']);page.get_by_role('button',name='Continuar donde lo dejé').click()
 while not page.locator('.options').count():page.locator('.act-foot button').last.click()
 key=page.locator('[data-ex-id]').get_attribute('data-ex-id');ex=exs[key]
 wrong=next(i for i,o in enumerate(ex['options']) if not o.get('correct'));page.locator(f'.option[data-idx="{wrong}"]').click();page.locator('.act-foot button').last.click()
 assert 'No es correcto' in page.locator('.feedback').inner_text()
 page.get_by_role('button',name='Salir',exact=True).click()
 page.set_viewport_size({'width':1440,'height':1000});page.goto(BASE);page.locator('.hero').wait_for();page.screenshot(path=str(ROOT/'docs/screenshots/edition-desktop.png'),full_page=True)
 ctx.set_offline(True);page.reload();page.locator('.hero').wait_for()
 statuses=page.evaluate('''async()=>{const c=await caches.keys();const cache=await caches.open(c.find(x=>x.startsWith('cpa-')));return Promise.all(['modelo.xlsx','caso.docx','one-pager.docx','fare.pptx','actualizacion.eml'].map(async f=>{const r=await cache.match('./content/resources/'+f);return [f,r?.status,(await r?.arrayBuffer())?.byteLength]}))}''')
 assert all(x[1]==200 and x[2]>100 for x in statuses),statuses
 page.get_by_text('Archivos del caso · descargar materiales').click()
 with page.expect_download() as d:page.locator('a[download="modelo.xlsx"]').click()
 assert Path(d.value.path()).read_bytes()[:2]==b'PK','offline download is real OOXML'
 for route in ['#/academy','#/lab','#/lesson/'+first['id']]:page.goto(BASE+'/'+route);page.wait_for_timeout(250)
 ctx.set_offline(False)
 page.goto(BASE+'/#/profile');page.get_by_role('button',name='Reiniciar todo el progreso').click();page.get_by_role('button',name='Continuar',exact=True).click();page.get_by_role('button',name='Borrar todo',exact=True).click()
 page.wait_for_function('JSON.parse(localStorage.getItem("cpa.state")).xp===0')
 assert page.evaluate('JSON.parse(localStorage.getItem("cpa.state")).xp')==0
 assert not errors,errors
 print('PASS '+('controls-only run' if os.environ.get('CONTROLS_ONLY') else 'all 21 lessons, 7 exams, 14 missions, 7 guided labs')+'; mobile/desktop/dark; wrong-answer/resume/export/import/reset; cache migration and real offline download; no JS errors')
 browser.close()
