import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaultState,migrate,exportState,importState} from '../js/core/state.js';
import {md} from '../js/ui/dom.js';
test('edition archives legacy state without accrediting new competencies',()=>{
 const old={...defaultState(),version:1,xp:100,lessons:{'l1-1':{completedAt:'yesterday'}},sandbox:{legacy:true}};
 const s=migrate(old);assert.equal(s.xp,0);assert.deepEqual(s.lessons,{});assert.equal(s.sandbox,null);assert.equal(s.history[0].state.xp,100);
 const restored=importState(exportState(s));assert.ok(restored.ok);assert.equal(restored.state.history[0].state.xp,100);assert.equal(migrate(s).history.length,1);
});
test('downloads allow local resources and escape arbitrary HTML',()=>{
 assert.match(md('[Modelo](content/resources/modelo.xlsx)'), /download/);
 assert.ok(!md('[X](javascript:alert(1))').includes('href='));
 assert.ok(!md('<script>alert(1)</script>').includes('<script>'));
});
