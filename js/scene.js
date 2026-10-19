// Plays a "Mabuting Asal" lesson (data in values.js) on a stage element:
// intro → wrong example ❌ → right example ✅ → child practises the right action.

class Cancelled extends Error {}

const SCENE_DECO = {
  home: [['🪟', 18, 22, 10], ['🖼️', 50, 20, 8], ['🪴', 94, 40, 8]],
  park: [['☁️', 15, 15, 10], ['☁️', 70, 12, 8], ['🌳', 94, 34, 14], ['🌼', 8, 92, 5]],
  school: [['🏫', 50, 18, 12], ['🕒', 14, 18, 7], ['📚', 92, 22, 7]],
};

export function playLesson(lesson, ui) {
  // ui: { stage, caption, phase, speak(text, lang), stop(), mascotHTML(), speed, onFinish(lesson) }
  const speed = ui.speed ?? 1;
  let dead = false;
  let actors = {};
  const cleanups = new Set();

  const check = () => { if (dead) throw new Cancelled(); };
  const sleep = async (ms) => { await new Promise((r) => setTimeout(r, ms * speed)); check(); };
  const pct = (n) => `${n}%`;

  // ---------- Building the stage ----------
  function build() {
    const { stage } = ui;
    stage.innerHTML = '';
    stage.className = `stage scene-${lesson.scene}`;
    for (const [e, x, y, size] of SCENE_DECO[lesson.scene] || []) {
      const d = document.createElement('span');
      d.className = 'deco';
      d.textContent = e;
      Object.assign(d.style, { left: pct(x), top: pct(y), fontSize: `calc(${size}cqw * var(--k))` });
      stage.appendChild(d);
    }
    actors = {};
    for (const a of lesson.actors) {
      const el = document.createElement('div');
      el.className = 'actor';
      el.dataset.id = a.id;
      const body = document.createElement('span');
      body.className = 'body';
      if (a.kind === 'mascot') {
        body.classList.add('mascot-body');
        body.innerHTML = ui.mascotHTML();
        el.style.width = `calc(${a.size}cqw * var(--k))`;
      } else {
        body.textContent = a.e;
        el.style.fontSize = `calc(${a.size}cqw * var(--k))`;
      }
      const mood = document.createElement('span');
      mood.className = 'mood';
      el.append(body, mood);
      Object.assign(el.style, { left: pct(a.x), top: pct(a.y) });
      if (a.hidden) el.classList.add('hidden');
      stage.appendChild(el);
      actors[a.id] = { el, body, mood, x: a.x, y: a.y, data: a };
    }
    const mark = document.createElement('div');
    mark.className = 'mark';
    stage.appendChild(mark);
  }

  function actor(id) {
    const a = actors[id];
    if (!a) throw new Error(`Unknown actor "${id}" in lesson ${lesson.id}`);
    return a;
  }

  function place(a, x, y) {
    a.x = x;
    a.y = y;
    a.el.style.left = pct(x);
    a.el.style.top = pct(y);
  }

  function clearBubbles() {
    ui.stage.querySelectorAll('.bubble').forEach((b) => b.remove());
  }

  function bubble(a, text, cls = '') {
    clearBubbles();
    const b = document.createElement('div');
    b.className = `bubble ${cls}`;
    b.textContent = text;
    // Keep bubbles inside the stage for actors near the edges.
    b.style.top = pct(a.y - 18);
    if (a.x < 30) { b.style.left = pct(Math.max(2, a.x - 8)); b.classList.add('from-left'); }
    else if (a.x > 70) { b.style.right = pct(Math.max(2, 100 - a.x - 8)); b.classList.add('from-right'); }
    else { b.style.left = pct(a.x); b.classList.add('centered'); }
    ui.stage.appendChild(b);
    return b;
  }

  function restartAnim(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function hearts(a) {
    for (let i = 0; i < 4; i++) {
      const h = document.createElement('span');
      h.className = 'heart';
      h.textContent = ['💜', '💖', '✨', '💜'][i];
      h.style.left = pct(a.x + (i - 1.5) * 4);
      h.style.top = pct(a.y - 10);
      h.style.animationDelay = `${i * 0.12}s`;
      ui.stage.appendChild(h);
      setTimeout(() => h.remove(), 1800);
    }
  }

  function setMark(kind) {
    const m = ui.stage.querySelector('.mark');
    m.className = `mark ${kind || ''}`;
    m.textContent = kind === 'wrong' ? '✖' : kind === 'right' ? '✔' : '';
  }

  function setCaption(text) { ui.caption.textContent = text; }
  function setPhase(text, cls) { ui.phase.textContent = text; ui.phase.className = `phase ${cls}`; }

  // ---------- Steps ----------
  const LANG = 'fil-PH';
  const MOVE_MS = 900;

  async function runSteps(steps) {
    for (const s of steps) { check(); await step(s); }
  }

  async function step(s) {
    if ('say' in s) {
      clearBubbles();
      setCaption(s.say);
      await ui.speak(s.say, LANG);
      check();
      await sleep(250);
    } else if ('talk' in s) {
      const [id, text] = s.talk;
      bubble(actor(id), text);
      setCaption(text);
      await ui.speak(text, LANG);
      check();
      await sleep(350);
    } else if ('move' in s) {
      const list = Array.isArray(s.move[0]) ? s.move : [s.move];
      for (const [id, x, y] of list) place(actor(id), x, y);
      await sleep(MOVE_MS);
    } else if ('mood' in s) {
      const [id, e] = s.mood;
      const a = actor(id);
      a.mood.textContent = e;
      if (e) restartAnim(a.mood, 'pop');
      await sleep(500);
    } else if ('set' in s) {
      const [id, e] = s.set;
      actor(id).body.textContent = e;
      restartAnim(actor(id).body, 'pop');
      await sleep(500);
    } else if ('anim' in s) {
      const [id, name] = s.anim;
      restartAnim(actor(id).body, `a-${name}`);
      await sleep(800);
    } else if ('pose' in s) {
      const [id, pose] = s.pose;
      actor(id).el.classList.toggle('fallen', pose === 'fallen');
      await sleep(500);
    } else if ('hearts' in s) {
      hearts(actor(s.hearts));
      await sleep(700);
    } else if ('show' in s || 'hide' in s) {
      const ids = [].concat(s.show ?? s.hide);
      for (const id of ids) {
        actor(id).el.classList.toggle('hidden', 'hide' in s);
        await sleep(250);
      }
      await sleep(250);
    } else if ('mark' in s) {
      setMark(s.mark);
      await sleep(600);
    } else if ('wait' in s) {
      await sleep(s.wait);
    }
  }

  // ---------- Practice ----------
  function center(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  // Animated hand that shows the child what to drag where.
  function hintHand(fromEl, toEl) {
    const s = ui.stage.getBoundingClientRect();
    const a = center(fromEl);
    const b = center(toEl);
    const h = document.createElement('span');
    h.className = 'hint-hand';
    h.textContent = '👆';
    h.style.setProperty('--x1', `${a.x - s.left}px`);
    h.style.setProperty('--y1', `${a.y - s.top}px`);
    h.style.setProperty('--x2', `${b.x - s.left}px`);
    h.style.setProperty('--y2', `${b.y - s.top}px`);
    ui.stage.appendChild(h);
    return h;
  }

  // Lets the child drag `el` (an actor or word chip). Resolves with the drop target hit.
  // `onMiss(targetEl)` is called when dropped on a wrong target; the item then slides back.
  function dragUntil(el, getPos, setPos, targets, wrongTargets = []) {
    return new Promise((resolve, reject) => {
      const stage = ui.stage;
      let start = null;
      let hand = targets[0] ? hintHand(el, targets[0]) : null;
      el.classList.add('draggable');
      el.dataset.drag = '1';
      targets.forEach((t) => { t.classList.add('drop-target'); t.dataset.drop = '1'; });

      function finish() {
        el.classList.remove('draggable', 'dragging');
        delete el.dataset.drag;
        targets.forEach((t) => { t.classList.remove('drop-target'); delete t.dataset.drop; });
        el.removeEventListener('pointerdown', down);
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        hand?.remove();
        cleanups.delete(abort);
      }
      function abort() { finish(); reject(new Cancelled()); }
      cleanups.add(abort);

      function down(e) {
        e.preventDefault();
        hand?.remove();
        hand = null;
        start = getPos();
        el.classList.add('dragging');
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
        window.addEventListener('pointercancel', up);
      }
      function move(e) {
        const r = stage.getBoundingClientRect();
        const x = Math.min(98, Math.max(2, ((e.clientX - r.left) / r.width) * 100));
        const y = Math.min(98, Math.max(2, ((e.clientY - r.top) / r.height) * 100));
        setPos(x, y);
      }
      function up() {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        el.classList.remove('dragging');
        const p = center(el);
        const reach = stage.getBoundingClientRect().width * 0.14;
        const near = (t) => { const c = center(t); return Math.hypot(c.x - p.x, c.y - p.y) < reach; };
        const hit = targets.find(near);
        if (hit) { finish(); resolve(hit); return; }
        const miss = wrongTargets.find((w) => near(w.el));
        setPos(start.x, start.y); // slide back
        if (miss) ui.onWrongDrop?.(miss);
      }
      el.addEventListener('pointerdown', down);
    });
  }

  function dragActor(a, targetEls, wrong = []) {
    return dragUntil(a.el, () => ({ x: a.x, y: a.y }), (x, y) => place(a, x, y), targetEls, wrong);
  }

  async function snapTo(a, target, snap, index = 0) {
    if (snap === 'consume') {
      place(a, target.x, target.y - 2);
      await sleep(350);
      a.el.classList.add('hidden');
    } else {
      const s = snap || { dx: -14, dy: 0 };
      place(a, target.x + s.dx + index * 8, target.y + s.dy);
      await sleep(400);
    }
  }

  async function wrongDropSay(text) {
    setCaption(text);
    await ui.speak(text, LANG);
  }

  async function practiceTask(t) {
    if (t.setup) await runSteps(t.setup);
    setCaption(t.hint);
    const hintDone = ui.speak(t.hint, LANG);

    if (t.type === 'drag') {
      const item = actor(t.item);
      const target = actor(t.target);
      ui.onWrongDrop = (w) => wrongDropSay(w.say);
      await dragActor(item, [target.el], (t.wrong || []).map((w) => ({ el: actor(w.id).el, say: w.say })));
      await snapTo(item, target, t.snap);
    } else if (t.type === 'dragMany') {
      const target = actor(t.target);
      let placed = 0;
      const remaining = t.items.map(actor);
      while (placed < t.count) {
        // Every remaining item is draggable; whichever the child drops on the target counts.
        const attempts = remaining.map((a) => dragActor(a, [target.el]).then(() => a));
        attempts.forEach((p) => p.catch(() => {})); // the losers are cancelled below
        const done = await Promise.race(attempts);
        remaining.splice(remaining.indexOf(done), 1);
        cleanupDrags();
        await snapTo(done, target, t.snap, placed);
        placed++;
        check();
      }
    } else if (t.type === 'tap') {
      const a = actor(t.at);
      const b = bubble(a, t.label, 'tap-bubble');
      b.setAttribute('role', 'button');
      await new Promise((resolve, reject) => {
        const abort = () => { reject(new Cancelled()); };
        cleanups.add(abort);
        b.addEventListener('click', () => { cleanups.delete(abort); b.remove(); resolve(); }, { once: true });
      });
    } else if (t.type === 'fill') {
      const card = document.createElement('div');
      card.className = 'fill-card';
      const slot = document.createElement('span');
      slot.className = 'slot';
      slot.textContent = '＿＿';
      card.append(document.createTextNode(t.before ? `${t.before} ` : ''), slot, document.createTextNode(t.after));
      const chip = document.createElement('div');
      chip.className = 'chip';
      chip.textContent = t.word;
      const pos = { x: 50, y: 86 };
      const setPos = (x, y) => { pos.x = x; pos.y = y; chip.style.left = pct(x); chip.style.top = pct(y); };
      setPos(50, 86);
      ui.stage.append(card, chip);
      await dragUntil(chip, () => ({ ...pos }), setPos, [slot]);
      slot.textContent = t.word;
      slot.classList.add('filled');
      chip.remove();
      await sleep(400);
      card.remove();
    }
    await hintDone;
    check();
    ui.cheer?.();
    if (t.done) await runSteps(t.done);
  }

  // Removes listeners of drag promises that lost a Promise.race (dragMany).
  function cleanupDrags() {
    for (const c of [...cleanups]) c();
  }

  // ---------- Lesson flow ----------
  async function run() {
    try {
      build();
      setPhase(`${lesson.icon} ${lesson.title}`, 'intro');
      setCaption(lesson.intro);
      await ui.speak(lesson.intro, LANG);
      await sleep(400);

      setPhase('👀 Panoorin: Ano ang MALI?', 'wrong');
      await runSteps(lesson.watch.wrong);
      await sleep(900);

      build();
      setPhase('👀 Panoorin: Ano ang TAMA?', 'right');
      await runSteps(lesson.watch.right);
      await sleep(900);

      build();
      setPhase('🙌 Ikaw naman!', 'practice');
      for (const t of lesson.practice) await practiceTask(t);
      setMark('right');
      await sleep(900);
      ui.onFinish(lesson);
    } catch (e) {
      if (!(e instanceof Cancelled)) throw e;
    }
  }

  run();
  return {
    cancel() {
      dead = true;
      cleanupDrags();
      ui.stop();
    },
  };
}
