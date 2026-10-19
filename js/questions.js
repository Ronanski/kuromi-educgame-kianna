// Question generators. Pure functions (no DOM) so they can be unit tested in Node.
// Every question: { subject, prompt, say, lang, visual, choices: [string], answer: string }

export const ROUND_LENGTH = 5;

const COUNT_ITEMS = [
  { e: '🍎', en: 'apples' }, { e: '⭐', en: 'stars' }, { e: '🦇', en: 'bats' },
  { e: '🍬', en: 'candies' }, { e: '🌙', en: 'moons' }, { e: '🎀', en: 'bows' },
  { e: '🐟', en: 'fish' }, { e: '🌸', en: 'flowers' },
];

export const EN_WORDS = [
  { e: '🐱', w: 'CAT' }, { e: '🐶', w: 'DOG' }, { e: '☀️', w: 'SUN' },
  { e: '🌙', w: 'MOON' }, { e: '⭐', w: 'STAR' }, { e: '🍎', w: 'APPLE' },
  { e: '🐟', w: 'FISH' }, { e: '🐦', w: 'BIRD' }, { e: '🏠', w: 'HOUSE' },
  { e: '🚗', w: 'CAR' }, { e: '📚', w: 'BOOK' }, { e: '🌳', w: 'TREE' },
  { e: '🍌', w: 'BANANA' }, { e: '🐷', w: 'PIG' }, { e: '🦋', w: 'BUTTERFLY' },
  { e: '🥚', w: 'EGG' }, { e: '🐸', w: 'FROG' }, { e: '🎈', w: 'BALLOON' },
];

export const FIL_WORDS = [
  { e: '🐱', w: 'PUSA', en: 'cat' }, { e: '🐶', w: 'ASO', en: 'dog' },
  { e: '☀️', w: 'ARAW', en: 'sun' }, { e: '🌙', w: 'BUWAN', en: 'moon' },
  { e: '⭐', w: 'BITUIN', en: 'star' }, { e: '🐟', w: 'ISDA', en: 'fish' },
  { e: '🐦', w: 'IBON', en: 'bird' }, { e: '🏠', w: 'BAHAY', en: 'house' },
  { e: '💧', w: 'TUBIG', en: 'water' }, { e: '🌸', w: 'BULAKLAK', en: 'flower' },
  { e: '🌳', w: 'PUNO', en: 'tree' }, { e: '📚', w: 'AKLAT', en: 'book' },
  { e: '🐔', w: 'MANOK', en: 'chicken' }, { e: '🍌', w: 'SAGING', en: 'banana' },
  { e: '🥭', w: 'MANGGA', en: 'mango' }, { e: '🐷', w: 'BABOY', en: 'pig' },
  { e: '🦋', w: 'PARU-PARO', en: 'butterfly' }, { e: '👁️', w: 'MATA', en: 'eye' },
];

export const FIL_COLORS = [
  { e: '🔴', w: 'PULA' }, { e: '🔵', w: 'ASUL' }, { e: '🟡', w: 'DILAW' },
  { e: '🟢', w: 'BERDE' }, { e: '🟣', w: 'LILA' }, { e: '⚫', w: 'ITIM' },
  { e: '⚪', w: 'PUTI' }, { e: '🟠', w: 'KAHEL' },
];

export const FIL_NUMBERS = ['ISA', 'DALAWA', 'TATLO', 'APAT', 'LIMA', 'ANIM', 'PITO', 'WALO', 'SIYAM', 'SAMPU'];

export function randInt(min, max, rng = Math.random) {
  return min + Math.floor(rng() * (max - min + 1));
}

export function pick(arr, rng = Math.random) {
  return arr[Math.floor(rng() * arr.length)];
}

export function shuffle(arr, rng = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Returns `answer` plus (count - 1) distinct distractors from `pool`, shuffled.
export function makeChoices(answer, pool, count = 3, rng = Math.random) {
  const others = shuffle(pool.filter((p) => p !== answer), rng).slice(0, count - 1);
  return shuffle([answer, ...others], rng);
}

function numberChoices(answer, min, max, rng) {
  const pool = [];
  for (let n = min; n <= max; n++) pool.push(String(n));
  // Prefer near numbers so it is a real choice, but keep them distinct.
  const near = pool.filter((n) => Math.abs(Number(n) - answer) <= 3);
  return makeChoices(String(answer), near.length >= 3 ? near : pool, 3, rng);
}

const repeat = (e, n) => Array(n).fill(e).join('');

// ---------- Math ----------
const mathTypes = [
  function counting(rng) {
    const item = pick(COUNT_ITEMS, rng);
    const n = randInt(1, 10, rng);
    return {
      prompt: `How many ${item.en}?`,
      say: `How many ${item.en}? Count them!`,
      visual: repeat(item.e, n),
      choices: numberChoices(n, 1, 10, rng),
      answer: String(n),
    };
  },
  function findNumber(rng) {
    const n = randInt(0, 10, rng);
    return {
      prompt: `Find the number ${n}`,
      say: `Find the number ${n}`,
      visual: '🔢',
      choices: numberChoices(n, 0, 10, rng),
      answer: String(n),
    };
  },
  function addition(rng) {
    const a = randInt(1, 5, rng);
    const b = randInt(1, 5, rng);
    const item = pick(COUNT_ITEMS, rng);
    return {
      prompt: `${a} + ${b} = ?`,
      say: `${a} plus ${b}. How many in all?`,
      visual: `${repeat(item.e, a)} ➕ ${repeat(item.e, b)}`,
      choices: numberChoices(a + b, 2, 10, rng),
      answer: String(a + b),
    };
  },
  function subtraction(rng) {
    const a = randInt(2, 6, rng);
    const b = randInt(1, a - 1, rng);
    return {
      prompt: `${a} - ${b} = ?`,
      say: `There are ${a} candies. Eat ${b}. How many are left?`,
      visual: `${repeat('🍬', a)} ➖ ${b}`,
      choices: numberChoices(a - b, 0, 6, rng),
      answer: String(a - b),
    };
  },
];

// ---------- English ----------
const englishTypes = [
  function pictureToWord(rng) {
    const item = pick(EN_WORDS, rng);
    return {
      prompt: 'What is this?',
      say: 'What is this?',
      visual: item.e,
      choices: makeChoices(item.w, EN_WORDS.map((x) => x.w), 3, rng),
      answer: item.w,
    };
  },
  function firstLetter(rng) {
    const item = pick(EN_WORDS, rng);
    const letter = item.w[0];
    const letters = 'ABCDEFGHIJKLMNOPRSTUW'.split('');
    return {
      prompt: `${item.w.toLowerCase()} starts with...`,
      say: `${item.w.toLowerCase()}. What letter does ${item.w.toLowerCase()} start with?`,
      visual: item.e,
      choices: makeChoices(letter, letters, 3, rng),
      answer: letter,
    };
  },
];

// ---------- Filipino ----------
const filipinoTypes = [
  function larawan(rng) {
    const item = pick(FIL_WORDS, rng);
    return {
      prompt: 'Ano ito?',
      say: 'Ano ito?',
      visual: item.e,
      choices: makeChoices(item.w, FIL_WORDS.map((x) => x.w), 3, rng),
      answer: item.w,
    };
  },
  function kulay(rng) {
    const item = pick(FIL_COLORS, rng);
    return {
      prompt: 'Anong kulay ito?',
      say: 'Anong kulay ito?',
      visual: item.e,
      choices: makeChoices(item.w, FIL_COLORS.map((x) => x.w), 3, rng),
      answer: item.w,
    };
  },
  function bilang(rng) {
    const n = randInt(1, 10, rng);
    return {
      prompt: 'Ilan ang bituin?',
      say: 'Ilan ang bituin? Bilangin natin!',
      visual: repeat('⭐', n),
      choices: makeChoices(FIL_NUMBERS[n - 1], FIL_NUMBERS, 3, rng),
      answer: FIL_NUMBERS[n - 1],
    };
  },
];

export const SUBJECTS = {
  math: { types: mathTypes, lang: 'en-US' },
  english: { types: englishTypes, lang: 'en-US' },
  filipino: { types: filipinoTypes, lang: 'fil-PH' },
};

export function makeQuestion(subject, rng = Math.random) {
  const s = SUBJECTS[subject];
  if (!s) throw new Error(`Unknown subject: ${subject}`);
  const q = pick(s.types, rng)(rng);
  return { subject, lang: s.lang, ...q };
}

// A round avoids showing the exact same question twice in a row.
export function makeRound(subject, length = ROUND_LENGTH, rng = Math.random) {
  const round = [];
  let guard = 0;
  while (round.length < length && guard++ < 200) {
    const q = makeQuestion(subject, rng);
    const prev = round[round.length - 1];
    if (prev && prev.prompt === q.prompt && prev.visual === q.visual) continue;
    round.push(q);
  }
  return round;
}
