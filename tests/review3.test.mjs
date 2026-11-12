// Independent reviewer checks: bookkeeping and competence must not depend on prose.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ROOT } from './helpers.mjs';
import { validate } from '../js/core/validate.js';
import { defaultState } from '../js/core/state.js';
import { recordAnswer } from '../js/core/progress.js';
const read = path => readFileSync(`${ROOT}/${path}`, 'utf8');
const close = (a,b,label='')=>assert.ok(Math.abs(a-b)<1e-8,`${label}: ${a} != ${b}`);

test('v3 cash and equity independently reconcile from net income, across six scenario-years',()=>{
 const outputs=JSON.parse(read('content/resources/resultados-control.json'));
 const settings=[{g:.10,m:.16,capex:6,nwc:.15},{g:.15,m:.18,capex:6,nwc:.15},{g:.05,m:.14,capex:8,nwc:.18}];
 settings.forEach((s,index)=>{
  let sales=110,cash=8,debt=30,ppe=50,equity=44.5,nwc=16.5;
  for(const year of [2026,2027]){
   const row=outputs[index][year];sales*=1+s.g;
   const ebitda=sales*s.m, depreciation=5, interest=debt*.05;
   const earningsBeforeTax=ebitda-depreciation-interest;
   const tax=Math.max(0,earningsBeforeTax*.25),netIncome=earningsBeforeTax-tax;
   const closingNwc=sales*s.nwc;
   const cfo=netIncome+depreciation-(closingNwc-nwc);
   const freeCashFlow=cfo-s.capex;
   cash+=freeCashFlow-3;debt-=3;ppe+=s.capex-depreciation;equity+=netIncome;
   close(row['2'],sales,'sales');close(row['8'],netIncome,'net income');
   close(row['12'],cfo,'CFO');close(row['13'],freeCashFlow,'FCF before principal');
   close(row['17'],cash,'cash');close(row['19'],debt,'closing debt');close(row['20'],debt-cash,'net debt');
   close(cash+closingNwc+ppe,debt+equity,'balance');
   assert.notEqual(row['3'],row['17'],'EBITDA does not equal cash by declaration');
   nwc=closingNwc;
  }
 });
 close(outputs[0]['2026']['13'],6.995);close(outputs[0]['2026']['17'],11.995);
});

test('recording an agent self-assessment never accredits an unexecuted tool',()=>{
 const ex={id:'review3-evidence',type:'portfolio',concept:'flows.build',rubric:['Typed I/O','Executed trace']};
 const answer={evidence:'Diseño completo; flujo no ejecutado por falta de acceso. La cifra esperada se ha calculado manualmente.',scores:[3,0],criticalErrors:true};
 const result=validate(ex,answer);assert.ok(result.ok);assert.equal(result.detail.semanticValidation,false);
 const state=defaultState(),before=JSON.stringify({stats:state.stats,concepts:state.concepts});
 recordAnswer(state,ex,true);assert.equal(JSON.stringify({stats:state.stats,concepts:state.concepts}),before);
 assert.equal(validate(ex,{...answer,scores:[3,4]}).ok,false);
});

test('agent construction covers Builder, Studio topics, execution and lifecycle as distinct lessons',()=>{
 const modules=['m2','m3','m4','m5','m6'].map(id=>JSON.parse(read(`content/modules/${id}.json`)));
 for(const id of ['m2','m3','m4','m5','m6']){
  const module=modules.find(m=>m.id===id);assert.equal(module.lessons.length,3);
  assert.ok(module.lessons.every(l=>l.id.startsWith('f3-')),'old specialty lesson retained');
  for(const lesson of module.lessons){
   const exercise=lesson.steps.find(s=>s.type==='portfolio');
   assert.ok(exercise?.rubric?.length>=3,'configuration needs inspectable artifact criteria');
  }
 }
 const studio=modules.filter(m=>['m4','m5','m6'].includes(m.id));
 assert.equal(studio.flatMap(m=>m.lessons).length,9);
 const concepts=studio.flatMap(m=>m.lessons.flatMap(l=>l.steps.filter(s=>s.type==='portfolio').map(s=>s.concept)));
 assert.equal(new Set(concepts).size,9,'nine lessons must not repeat a single construction task');
});
