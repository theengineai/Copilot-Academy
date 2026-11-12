import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaultState,migrate,exportState,importState} from '../js/core/state.js';
import {md} from '../js/ui/dom.js';
test('v3 archives v2 activity and existing v1 history without accrediting new skills',()=>{
 const history=[{edition:'v1',state:{xp:80}}];
 const old={...defaultState(),version:2,edition:'financing-v2',xp:100,lessons:{'f2-l1-1':{completedAt:'yesterday'}},portfolio:{legacy:{evidence:'old evidence'}},history,sandbox:{legacy:true}};
 const s=migrate(old);assert.equal(s.version,3);assert.equal(s.edition,'copilot-mastery-v3');assert.equal(s.xp,0);assert.deepEqual(s.lessons,{});assert.equal(s.sandbox,null);assert.deepEqual(s.portfolio,{});
 assert.equal(s.history[0].state.xp,80);assert.equal(s.history[1].state.xp,100);assert.equal(s.history[1].state.portfolio.legacy.evidence,'old evidence');
 assert.deepEqual(s.history[1].state.history,[],'avoid recursively duplicating previous archives');
 const restored=importState(exportState(s));assert.ok(restored.ok);assert.deepEqual(restored.state.history,s.history);assert.equal(migrate(s).history.length,2);
});
test('v1 state can migrate directly without losing its original snapshot',()=>{
 const old={...defaultState(),version:1,xp:50,lessons:{'l1-1':{completedAt:'old'}}};
 const s=migrate(old);assert.equal(s.version,3);assert.equal(s.xp,0);assert.equal(s.history[0].state.xp,50);
});
test('downloads allow local resources and escape arbitrary HTML',()=>{
 assert.match(md('[Modelo](content/resources/modelo.xlsx)'), /download/);
 assert.ok(!md('[X](javascript:alert(1))').includes('href='));
 assert.ok(!md('<script>alert(1)</script>').includes('<script>'));
});
