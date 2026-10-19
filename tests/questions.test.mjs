import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeQuestion, makeRound, SUBJECTS, ROUND_LENGTH } from '../js/questions.js';

// Deterministic RNG so failures can be reproduced.
function seeded(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

for (const subject of Object.keys(SUBJECTS)) {
  test(`${subject}: 2000 questions are all valid`, () => {
    const rng = seeded(42);
    for (let i = 0; i < 2000; i++) {
      const q = makeQuestion(subject, rng);
      assert.equal(q.choices.length, 3, `3 choices: ${JSON.stringify(q)}`);
      assert.equal(new Set(q.choices).size, 3, `distinct choices: ${JSON.stringify(q)}`);
      assert.ok(q.choices.includes(q.answer), `answer present: ${JSON.stringify(q)}`);
      assert.ok(q.prompt && q.say && q.visual && q.lang, `fields: ${JSON.stringify(q)}`);
    }
  });

  test(`${subject}: round has ${ROUND_LENGTH} questions`, () => {
    assert.equal(makeRound(subject, ROUND_LENGTH, seeded(7)).length, ROUND_LENGTH);
  });
}

test('math answers are arithmetically correct', () => {
  const rng = seeded(1);
  for (let i = 0; i < 2000; i++) {
    const q = makeQuestion('math', rng);
    const m = q.prompt.match(/^(\d+) ([+-]) (\d+) = \?$/);
    if (m) {
      const expected = m[2] === '+' ? +m[1] + +m[3] : +m[1] - +m[3];
      assert.equal(q.answer, String(expected));
      assert.ok(expected >= 0 && expected <= 10, 'age 4-6 range');
    }
    if (q.prompt.startsWith('How many')) {
      const n = Number(q.answer);
      const emoji = q.visual.slice(0, q.visual.length / n);
      assert.equal(q.visual, emoji.repeat(n), `picture count matches answer: ${JSON.stringify(q)}`);
    }
  }
});

test('unknown subject throws', () => {
  assert.throws(() => makeQuestion('history'));
});
