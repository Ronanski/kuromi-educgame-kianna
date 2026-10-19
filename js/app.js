import { makeRound, ROUND_LENGTH } from './questions.js';
import { noxieSVG } from './character.js';

const STICKERS = ['🦇', '🌙', '⭐', '💜', '🎀', '🔮', '🍬', '🦄', '🌸', '🧁', '🐈‍⬛', '👑', '🍭', '🪐', '🌈', '🎈'];
const STARS_PER_STICKER = 5;
const STORE_KEY = 'noxie-school-v1';

const $ = (id) => document.getElementById(id);

// ---------- Saved progress (localStorage, safe if blocked) ----------
function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return { stars: 0, voice: true, mascot: null, ...JSON.parse(raw) };
  } catch { /* storage unavailable */ }
  return { stars: 0, voice: true, mascot: null };
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {
    // Most likely the custom picture is too big for storage: drop it, keep stars.
    if (state.mascot) { state.mascot = null; try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* ignore */ } }
  }
}
const state = load();

// ---------- Sound + voice ----------
let audioCtx;
function beep(freqs, dur = 0.12) {
  try {
    audioCtx ??= new (window.AudioContext || window.webkitAudioContext)();
    freqs.forEach((f, i) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'triangle';
      o.frequency.value = f;
      const t = audioCtx.currentTime + i * dur;
      g.gain.setValueAtTime(0.18, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g).connect(audioCtx.destination);
      o.start(t);
      o.stop(t + dur);
    });
  } catch { /* no audio */ }
}
const sfxRight = () => beep([660, 880, 1175]);
const sfxWrong = () => beep([300, 220], 0.15);

function speak(text, lang = 'en-US') {
  if (!state.voice || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices();
  // Filipino voices are rare; fall back to an English voice if missing.
  const v = voices.find((x) => x.lang.replace('_', '-').startsWith(lang))
    || voices.find((x) => x.lang.startsWith(lang.slice(0, 2)))
    || voices.find((x) => x.lang.startsWith('en'));
  if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = lang; }
  u.rate = 0.9;
  u.pitch = 1.2;
  speechSynthesis.speak(u);
}

// ---------- Screens ----------
function show(name) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === `screen-${name}`));
  if (name !== 'quiz' && 'speechSynthesis' in window) speechSynthesis.cancel();
}

function refreshStars() {
  $('star-total').textContent = state.stars;
  $('star-total-2').textContent = state.stars;
}

// ---------- Mascot (default SVG, or a parent-chosen picture kept on-device) ----------
const MASCOTS = ['mascot-home', 'mascot-quiz', 'mascot-result', 'mascot-preview'];

function renderMascots() {
  MASCOTS.forEach((id) => {
    const el = $(id);
    if (state.mascot) {
      el.innerHTML = '';
      const img = document.createElement('img');
      img.className = 'custom';
      img.alt = 'Mascot';
      img.src = state.mascot;
      el.appendChild(img);
    } else {
      el.innerHTML = noxieSVG();
    }
  });
}

// Shrink the photo to 320px so it fits in localStorage and loads fast.
function setCustomMascot(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const max = 320;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      state.mascot = canvas.toDataURL('image/png');
      save();
      renderMascots();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function mascotReact(el, cls) {
  el.classList.remove('happy', 'oops');
  void el.offsetWidth; // restart animation
  el.classList.add(cls);
}

function confetti() {
  const box = $('confetti');
  for (let i = 0; i < 18; i++) {
    const s = document.createElement('span');
    s.textContent = ['⭐', '💜', '🌙', '✨', '🎀'][i % 5];
    s.style.left = `${Math.random() * 100}%`;
    s.style.animationDelay = `${Math.random() * 0.4}s`;
    box.appendChild(s);
    setTimeout(() => s.remove(), 2200);
  }
}

// ---------- Quiz flow ----------
let quiz = null;

function startQuiz(subject) {
  quiz = { subject, round: makeRound(subject), index: 0, correctFirstTry: 0, missed: false, locked: false };
  show('quiz');
  renderQuestion();
}

function renderQuestion() {
  const q = quiz.round[quiz.index];
  quiz.missed = false;
  quiz.locked = false;
  $('progress').innerHTML = quiz.round
    .map((_, i) => `<i class="${i < quiz.index ? 'done' : i === quiz.index ? 'now' : ''}"></i>`)
    .join('');
  $('q-prompt').textContent = q.prompt;
  const visual = $('q-visual');
  visual.textContent = q.visual;
  visual.classList.toggle('big', [...q.visual].length <= 3);
  const choices = $('q-choices');
  choices.innerHTML = '';
  q.choices.forEach((c) => {
    const b = document.createElement('button');
    b.className = 'choice';
    b.textContent = c;
    b.addEventListener('click', () => answer(b, c));
    choices.appendChild(b);
  });
  speak(q.say, q.lang);
}

function answer(btn, choice) {
  if (quiz.locked) return;
  const q = quiz.round[quiz.index];
  const mascot = $('mascot-quiz');
  if (choice === q.answer) {
    quiz.locked = true;
    btn.classList.add('right');
    if (!quiz.missed) quiz.correctFirstTry++;
    sfxRight();
    mascotReact(mascot, 'happy');
    speak(pickPraise(q.lang), q.lang);
    setTimeout(next, 1300);
  } else {
    btn.classList.add('wrong');
    btn.disabled = true;
    quiz.missed = true;
    sfxWrong();
    mascotReact(mascot, 'oops');
    speak(q.lang === 'fil-PH' ? 'Subukan ulit!' : 'Try again!', q.lang);
  }
}

function pickPraise(lang) {
  const en = ['Great job!', 'Yay! Correct!', 'You are so smart!', 'Awesome!'];
  const fil = ['Magaling!', 'Tama!', 'Ang galing mo!', 'Yehey!'];
  const list = lang === 'fil-PH' ? fil : en;
  return list[Math.floor(Math.random() * list.length)];
}

function next() {
  quiz.index++;
  if (quiz.index < quiz.round.length) renderQuestion();
  else finishQuiz();
}

function finishQuiz() {
  // Every question is eventually answered right; first-try answers earn a star each,
  // plus 1 bonus star for finishing so kids always get something.
  const earned = quiz.correctFirstTry + 1;
  const before = Math.floor(state.stars / STARS_PER_STICKER);
  state.stars += earned;
  save();
  refreshStars();
  const after = Math.floor(state.stars / STARS_PER_STICKER);

  $('result-title').textContent = quiz.correctFirstTry === ROUND_LENGTH ? 'Perfect! 🌟' : 'Great job!';
  $('result-stars').textContent = '⭐'.repeat(earned);
  $('result-sticker').textContent = after > before && before < STICKERS.length
    ? `New sticker unlocked: ${STICKERS[Math.min(after, STICKERS.length) - 1]}`
    : `+${earned} stars!`;
  show('result');
  confetti();
  sfxRight();
  speak(`Great job! You got ${earned} stars!`);
}

function renderStickers() {
  const unlocked = Math.floor(state.stars / STARS_PER_STICKER);
  $('sticker-grid').innerHTML = STICKERS
    .map((s, i) => (i < unlocked ? `<div class="sticker">${s}</div>` : '<div class="sticker locked">🔒</div>'))
    .join('');
}

// ---------- Wire up ----------
function init() {
  renderMascots();
  refreshStars();
  $('opt-voice').checked = state.voice;

  document.querySelectorAll('.subject-btn').forEach((b) =>
    b.addEventListener('click', () => startQuiz(b.dataset.subject)));
  $('btn-home').addEventListener('click', () => show('home'));
  $('btn-speak').addEventListener('click', () => {
    const q = quiz?.round[quiz.index];
    if (q) speak(q.say, q.lang);
  });
  $('btn-again').addEventListener('click', () => startQuiz(quiz.subject));
  $('btn-result-home').addEventListener('click', () => show('home'));
  $('btn-stickers').addEventListener('click', () => { renderStickers(); show('stickers'); });
  $('btn-stickers-home').addEventListener('click', () => show('home'));
  $('btn-parent').addEventListener('click', () => show('parent'));
  $('btn-parent-home').addEventListener('click', () => show('home'));
  $('mascot-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) setCustomMascot(file);
    e.target.value = '';
  });
  $('btn-mascot-default').addEventListener('click', () => { state.mascot = null; save(); renderMascots(); });
  $('opt-voice').addEventListener('change', (e) => { state.voice = e.target.checked; save(); });
  $('btn-reset').addEventListener('click', () => {
    if (confirm('I-reset ang lahat ng stars at stickers?')) { state.stars = 0; save(); refreshStars(); }
  });
  $('mascot-home').addEventListener('click', () => {
    mascotReact($('mascot-home'), 'happy');
    speak(state.mascot ? "Hi! Let's learn together!" : "Hi! I'm Noxie! Let's learn together!");
  });

  if ('speechSynthesis' in window) speechSynthesis.getVoices(); // warm up voice list
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

init();
