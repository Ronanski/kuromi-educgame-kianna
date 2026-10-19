import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LESSONS, STEP_KEYS, TASK_TYPES, SCENES, lessonById } from '../js/values.js';

test('lesson ids are unique', () => {
  assert.equal(new Set(LESSONS.map((l) => l.id)).size, LESSONS.length);
});

for (const l of LESSONS) {
  test(`lesson "${l.id}" is complete and consistent`, () => {
    for (const f of ['icon', 'title', 'en', 'phrase', 'tip', 'intro']) assert.ok(l[f], `${l.id}: missing ${f}`);
    assert.ok(SCENES.includes(l.scene), `${l.id}: bad scene ${l.scene}`);
    const ids = new Set(l.actors.map((a) => a.id));
    assert.equal(ids.size, l.actors.length, `${l.id}: duplicate actor ids`);
    for (const a of l.actors) {
      assert.ok(a.kind === 'mascot' || a.e, `${l.id}/${a.id}: needs emoji or mascot`);
      assert.ok(a.x >= 0 && a.x <= 100 && a.y >= 0 && a.y <= 100 && a.size > 0, `${l.id}/${a.id}: bad position`);
    }
    const has = (id) => assert.ok(ids.has(id), `${l.id}: unknown actor "${id}"`);

    const checkSteps = (steps, where) => {
      assert.ok(Array.isArray(steps), `${l.id}: ${where} must be a list`);
      for (const s of steps) {
        const keys = Object.keys(s);
        assert.equal(keys.length, 1, `${l.id}/${where}: one key per step ${JSON.stringify(s)}`);
        const [k] = keys;
        assert.ok(STEP_KEYS.includes(k), `${l.id}/${where}: unknown step ${k}`);
        const v = s[k];
        if (k === 'move') (Array.isArray(v[0]) ? v : [v]).forEach(([id, x, y]) => { has(id); assert.ok(x >= 0 && x <= 100 && y >= 0 && y <= 100); });
        if (['talk', 'mood', 'set', 'anim', 'pose'].includes(k)) has(v[0]);
        if (k === 'hearts') has(v);
        if (k === 'show' || k === 'hide') [].concat(v).forEach(has);
        if (k === 'mark') assert.ok(['wrong', 'right'].includes(v));
        if (k === 'anim') assert.ok(['bow', 'jump', 'shake', 'wiggle'].includes(v[1]));
      }
    };
    checkSteps(l.watch.wrong, 'wrong');
    checkSteps(l.watch.right, 'right');
    // The visual examples must actually show which one is wrong and which is right.
    assert.ok(l.watch.wrong.some((s) => s.mark === 'wrong'), `${l.id}: wrong example not marked`);
    assert.ok(l.watch.right.some((s) => s.mark === 'right'), `${l.id}: right example not marked`);

    assert.ok(l.practice.length > 0, `${l.id}: needs practice`);
    for (const t of l.practice) {
      assert.ok(TASK_TYPES.includes(t.type), `${l.id}: bad task ${t.type}`);
      assert.ok(t.hint, `${l.id}: task needs a hint`);
      if (t.setup) checkSteps(t.setup, 'setup');
      if (t.done) checkSteps(t.done, 'done');
      if (t.type === 'drag') { has(t.item); has(t.target); (t.wrong || []).forEach((w) => { has(w.id); assert.ok(w.say); }); }
      if (t.type === 'dragMany') { t.items.forEach(has); has(t.target); assert.ok(t.count >= 1 && t.count <= t.items.length); }
      if (t.type === 'tap') { has(t.at); assert.ok(t.label); }
      if (t.type === 'fill') assert.ok(t.word && typeof t.before === 'string' && typeof t.after === 'string');
    }
  });
}

test('lessonById finds lessons', () => {
  assert.equal(lessonById('mano').title, 'Pagmamano');
  assert.equal(lessonById('nope'), undefined);
});
