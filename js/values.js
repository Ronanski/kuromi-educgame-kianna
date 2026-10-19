// "Mabuting Asal" (good manners) lessons. Pure data, no DOM, so tests can check it.
//
// Each lesson is played by js/scene.js in three parts:
//   1. watch.wrong  - animated example of the WRONG behaviour (marked ❌)
//   2. watch.right  - animated example of the RIGHT behaviour (marked ✅)
//   3. practice     - the child DOES the right action (drag / tap / fill), then `done` plays
//
// Actors: { id, e: emoji } or { id, kind: 'mascot' }, x/y = centre in % of the stage,
// size = % of stage width, hidden = starts invisible.
//
// Steps (one key each):
//   say: 'text'                       narrator caption + voice
//   talk: [id, 'text']                speech bubble over an actor + voice
//   move: [id, x, y] or [[id,x,y],…]  walk actor(s) to a spot (in parallel)
//   mood: [id, '😊']                  small feeling badge over an actor ('' clears it)
//   set: [id, '🥀']                   change an actor's emoji
//   anim: [id, 'bow'|'jump'|'shake'|'wiggle']
//   pose: [id, 'fallen'|'']           lasting pose
//   hearts: id                        floating hearts from an actor
//   show: id | [ids]   hide: id | [ids]
//   mark: 'wrong' | 'right'           big ❌ / ✅ on the stage
//   wait: ms
//
// Practice tasks:
//   { type: 'drag', item, target, hint, snap?: {dx, dy} | 'consume', wrong?: [{ id, say }], done }
//   { type: 'dragMany', items: [ids], target, count, hint, snap?, done }
//   { type: 'tap', at: actorId, label, hint, done }
//   { type: 'fill', before, after, word, hint, done }   drag the word chip into the blank
//   Any task may have `setup` steps that run before it starts.

export const STEP_KEYS = ['say', 'talk', 'move', 'mood', 'set', 'anim', 'pose', 'hearts', 'show', 'hide', 'mark', 'wait'];
export const TASK_TYPES = ['drag', 'dragMany', 'tap', 'fill'];
export const SCENES = ['home', 'park', 'school'];

const NOXIE = { id: 'noxie', kind: 'mascot', size: 17 };

export const LESSONS = [
  {
    id: 'mano',
    icon: '🙏',
    title: 'Pagmamano',
    en: 'Respect our elders',
    scene: 'home',
    phrase: 'Mano po!',
    tip: 'Kapag may dumating na lolo, lola, tito o tita, sabay kayong magmano. Mas natututo ang bata kapag nakikita ka niyang ginagawa ito.',
    actors: [
      { ...NOXIE, x: 28, y: 62 },
      { id: 'lola', e: '👵', x: 78, y: 62, size: 16 },
      { id: 'toy', e: '🧸', x: 12, y: 78, size: 8 },
    ],
    intro: 'Dumating si Lola! Ano ang dapat gawin ni Noxie?',
    watch: {
      wrong: [
        { move: ['noxie', 18, 66] },
        { anim: ['noxie', 'wiggle'] },
        { say: 'Naglalaro lang si Noxie. Hindi niya pinansin si Lola.' },
        { mood: ['lola', '😔'] },
        { mark: 'wrong' },
        { say: 'Nalungkot si Lola. Hindi ito tama.' },
      ],
      right: [
        { say: 'Tumayo si Noxie at lumapit kay Lola.' },
        { move: ['noxie', 62, 62] },
        { anim: ['noxie', 'bow'] },
        { talk: ['noxie', 'Mano po, Lola!'] },
        { talk: ['lola', 'Kaawaan ka ng Diyos, apo.'] },
        { mood: ['lola', '😊'] },
        { hearts: 'lola' },
        { mark: 'right' },
        { say: 'Masaya si Lola! Ganito ang paggalang sa nakatatanda.' },
      ],
    },
    practice: [
      {
        type: 'drag', item: 'noxie', target: 'lola', snap: { dx: -16, dy: 0 },
        hint: 'Ikaw naman! I-drag si Noxie papunta kay Lola para magmano.',
        done: [
          { anim: ['noxie', 'bow'] },
          { talk: ['noxie', 'Mano po, Lola!'] },
          { mood: ['lola', '😊'] },
          { hearts: 'lola' },
        ],
      },
    ],
  },

  {
    id: 'po',
    icon: '🗣️',
    title: 'Po at Opo',
    en: 'Speak politely',
    scene: 'home',
    phrase: 'Opo, salamat po!',
    tip: 'Gamitin din ninyo ang po at opo sa bahay, lalo na kapag kausap si Lolo, Lola o ang mga bisita.',
    actors: [
      { ...NOXIE, x: 28, y: 62 },
      { id: 'lolo', e: '👴', x: 75, y: 62, size: 16 },
    ],
    intro: 'Kapag kausap natin ang nakatatanda, gumagamit tayo ng po at opo.',
    watch: {
      wrong: [
        { talk: ['lolo', 'Kumain ka na ba, apo?'] },
        { talk: ['noxie', 'Oo.'] },
        { mood: ['lolo', '😐'] },
        { mark: 'wrong' },
        { say: 'Kulang! Walang po o opo. Hindi ito magalang.' },
      ],
      right: [
        { talk: ['lolo', 'Kumain ka na ba, apo?'] },
        { talk: ['noxie', 'Opo, Lolo! Kumain na po ako.'] },
        { mood: ['lolo', '😊'] },
        { hearts: 'lolo' },
        { mark: 'right' },
        { say: 'Magalang! Opo ang sagot natin sa nakatatanda.' },
      ],
    },
    practice: [
      {
        type: 'fill', before: 'Salamat', after: '!', word: 'po',
        hint: 'Ikaw naman! I-drag ang po sa patlang.',
        done: [{ talk: ['noxie', 'Salamat po!'] }, { hearts: 'lolo' }],
      },
      {
        type: 'fill', before: 'Magandang umaga', after: ', Lolo!', word: 'po',
        hint: 'Isa pa! Ilagay ang po.',
        done: [{ talk: ['noxie', 'Magandang umaga po, Lolo!'] }, { mood: ['lolo', '😊'] }],
      },
      {
        type: 'fill', before: '', after: ', Lolo!', word: 'Opo',
        hint: 'Tinatanong ka ni Lolo kung gusto mo ng gatas. I-drag ang Opo.',
        setup: [{ talk: ['lolo', 'Gusto mo ba ng gatas?'] }],
        done: [{ talk: ['noxie', 'Opo, Lolo!'] }, { hearts: 'lolo' }],
      },
    ],
  },

  {
    id: 'salamat',
    icon: '💝',
    title: 'Salamat Po',
    en: 'Say thank you',
    scene: 'home',
    phrase: 'Salamat po!',
    tip: 'Ipaalala ang "Ano ang sasabihin?" tuwing may ibinibigay sa bata, at magpasalamat ka rin sa kanya.',
    actors: [
      { ...NOXIE, x: 28, y: 62 },
      { id: 'nanay', e: '👩', x: 76, y: 62, size: 16 },
      { id: 'apple', e: '🍎', x: 66, y: 66, size: 8 },
    ],
    intro: 'May ibibigay si Nanay kay Noxie.',
    watch: {
      wrong: [
        { move: ['apple', 38, 66] },
        { move: [['noxie', 8, 62], ['apple', 14, 66]] },
        { say: 'Kinuha ni Noxie ang mansanas at tumakbo agad.' },
        { mood: ['nanay', '😔'] },
        { mark: 'wrong' },
        { say: 'Hindi siya nagpasalamat. Hindi ito tama.' },
      ],
      right: [
        { move: ['apple', 38, 66] },
        { talk: ['noxie', 'Salamat po, Nanay!'] },
        { mood: ['nanay', '😊'] },
        { hearts: 'nanay' },
        { mark: 'right' },
        { say: 'Kapag may ibinigay sa atin, magsabi ng Salamat po!' },
      ],
    },
    practice: [
      {
        type: 'drag', item: 'apple', target: 'noxie', snap: { dx: 9, dy: 4 },
        hint: 'Ikaw naman! I-drag ang mansanas papunta kay Noxie.',
        done: [],
      },
      {
        type: 'tap', at: 'noxie', label: 'Salamat po! 💜',
        hint: 'Ano ang sasabihin ni Noxie? I-tap ang Salamat po!',
        done: [{ talk: ['noxie', 'Salamat po, Nanay!'] }, { mood: ['nanay', '😊'] }, { hearts: 'nanay' }],
      },
    ],
  },

  {
    id: 'share',
    icon: '🍪',
    title: 'Pagbabahagi',
    en: 'Share with others',
    scene: 'park',
    phrase: 'Hati tayo!',
    tip: 'Magpraktis ng paghahati sa merienda: hayaan ang bata ang mag-abot sa kapatid o kaibigan.',
    actors: [
      { ...NOXIE, x: 25, y: 58 },
      { id: 'friend', e: '👧', x: 76, y: 58, size: 16 },
      { id: 'c1', e: '🍪', x: 12, y: 84, size: 8 },
      { id: 'c2', e: '🍪', x: 23, y: 84, size: 8 },
      { id: 'c3', e: '🍪', x: 34, y: 84, size: 8 },
      { id: 'c4', e: '🍪', x: 45, y: 84, size: 8 },
    ],
    intro: 'May apat na cookies si Noxie. Wala ang kaibigan niya.',
    watch: {
      wrong: [
        { mood: ['friend', '🥺'] },
        { say: 'Kinain lahat ni Noxie nang mag-isa.' },
        { hide: ['c1', 'c2', 'c3', 'c4'] },
        { mood: ['friend', '😢'] },
        { mark: 'wrong' },
        { say: 'Malungkot ang kaibigan. Hindi tama ang hindi pagbabahagi.' },
      ],
      right: [
        { mood: ['friend', '🥺'] },
        { move: [['c3', 70, 84], ['c4', 78, 84]] },
        { talk: ['noxie', 'Heto, hati tayo!'] },
        { mood: ['friend', '😊'] },
        { talk: ['friend', 'Salamat, Noxie!'] },
        { hearts: 'friend' },
        { mark: 'right' },
        { say: 'Masarap magbahagi! Pareho silang masaya.' },
      ],
    },
    practice: [
      {
        type: 'dragMany', items: ['c1', 'c2', 'c3', 'c4'], target: 'friend', count: 2, snap: { dx: -5, dy: 24 },
        setup: [{ mood: ['friend', '🥺'] }],
        hint: 'Ikaw naman! I-drag ang dalawang cookie sa kaibigan.',
        done: [{ talk: ['friend', 'Salamat, Noxie!'] }, { mood: ['friend', '😊'] }, { hearts: 'friend' }],
      },
    ],
  },

  {
    id: 'ligpit',
    icon: '🧸',
    title: 'Pagliligpit',
    en: 'Clean up after playing',
    scene: 'home',
    phrase: 'Ligpit na!',
    tip: 'Gawing laro ang pagliligpit, halimbawa "Sino ang mauuna?". Purihin ang bata pagkatapos.',
    actors: [
      { ...NOXIE, x: 28, y: 56 },
      { id: 'box', e: '📦', x: 72, y: 62, size: 15 },
      { id: 't1', e: '🧸', x: 12, y: 82, size: 8 },
      { id: 't2', e: '🚗', x: 34, y: 86, size: 8 },
      { id: 't3', e: '🧩', x: 52, y: 82, size: 8 },
      { id: 't4', e: '⚽', x: 90, y: 84, size: 8 },
      { id: 'nanay', e: '👩', x: 92, y: 56, size: 15, hidden: true },
    ],
    intro: 'Tapos nang maglaro si Noxie. Ano ang gagawin sa mga laruan?',
    watch: {
      wrong: [
        { say: 'Iniwan ni Noxie ang mga laruan sa sahig.' },
        { move: ['noxie', 8, 56] },
        { show: 'nanay' },
        { anim: ['nanay', 'shake'] },
        { mood: ['nanay', '😟'] },
        { mark: 'wrong' },
        { say: 'Muntik madapa si Nanay sa mga laruan! Hindi ito tama.' },
      ],
      right: [
        { move: ['t1', 72, 60] }, { hide: 't1' },
        { move: ['t2', 72, 60] }, { hide: 't2' },
        { move: ['t3', 72, 60] }, { hide: 't3' },
        { move: ['t4', 72, 60] }, { hide: 't4' },
        { talk: ['noxie', 'Ligpit na!'] },
        { show: 'nanay' },
        { mood: ['nanay', '😊'] },
        { hearts: 'nanay' },
        { mark: 'right' },
        { say: 'Ibalik ang mga laruan sa lalagyan pagkatapos maglaro.' },
      ],
    },
    practice: [
      {
        type: 'dragMany', items: ['t1', 't2', 't3', 't4'], target: 'box', count: 4, snap: 'consume',
        hint: 'Ikaw naman! I-drag ang lahat ng laruan sa kahon.',
        done: [{ talk: ['noxie', 'Malinis na!'] }, { show: 'nanay' }, { mood: ['nanay', '😊'] }, { hearts: 'nanay' }],
      },
    ],
  },

  {
    id: 'basura',
    icon: '🗑️',
    title: 'Tamang Tapunan',
    en: 'Throw trash in the bin',
    scene: 'park',
    phrase: 'Sa basurahan!',
    tip: 'Kapag nasa labas kayo, hanapin ninyo nang magkasama ang basurahan bago magtapon.',
    actors: [
      { ...NOXIE, x: 26, y: 58 },
      { id: 'cup', e: '🥤', x: 36, y: 66, size: 8 },
      { id: 'bin', e: '🗑️', x: 80, y: 62, size: 15 },
      { id: 'flower', e: '🌷', x: 56, y: 82, size: 9 },
    ],
    intro: 'Naubos na ni Noxie ang inumin niya. Saan itatapon ang baso?',
    watch: {
      wrong: [
        { move: ['cup', 52, 86] },
        { say: 'Itinapon ni Noxie ang basura kahit saan.' },
        { set: ['flower', '🥀'] },
        { mark: 'wrong' },
        { say: 'Dumumi ang paligid at nalanta ang bulaklak. Hindi ito tama.' },
      ],
      right: [
        { move: ['noxie', 62, 58] },
        { move: ['cup', 80, 58] },
        { hide: 'cup' },
        { hearts: 'flower' },
        { mark: 'right' },
        { say: 'Itapon ang basura sa basurahan. Ang linis ng paligid!' },
      ],
    },
    practice: [
      {
        type: 'drag', item: 'cup', target: 'bin', snap: 'consume',
        hint: 'Ikaw naman! I-drag ang basura sa basurahan.',
        done: [{ hearts: 'flower' }, { talk: ['noxie', 'Malinis na ang paligid!'] }],
      },
    ],
  },

  {
    id: 'sorry',
    icon: '🤝',
    title: 'Pag-sorry',
    en: 'Say sorry and help',
    scene: 'park',
    phrase: 'Sorry po!',
    tip: 'Kapag may nasaktan ang bata, tulungan siyang lumapit, mag-sorry at tumulong, hindi lang magsalita.',
    actors: [
      { ...NOXIE, x: 14, y: 58 },
      { id: 'friend', e: '👦', x: 62, y: 58, size: 16 },
    ],
    intro: 'Naghahabulan si Noxie at ang kaibigan niya.',
    watch: {
      wrong: [
        { move: ['noxie', 52, 58] },
        { pose: ['friend', 'fallen'] },
        { mood: ['friend', '😢'] },
        { move: ['noxie', 8, 58] },
        { mark: 'wrong' },
        { say: 'Nabangga ni Noxie ang kaibigan at iniwan niya. Hindi ito tama.' },
      ],
      right: [
        { move: ['noxie', 52, 58] },
        { pose: ['friend', 'fallen'] },
        { mood: ['friend', '😢'] },
        { talk: ['noxie', 'Sorry! Okay ka lang ba?'] },
        { pose: ['friend', ''] },
        { mood: ['friend', '😊'] },
        { talk: ['friend', 'Okay lang ako. Salamat!'] },
        { hearts: 'friend' },
        { mark: 'right' },
        { say: 'Kapag may nasaktan tayo, mag-sorry at tumulong.' },
      ],
    },
    practice: [
      {
        type: 'drag', item: 'noxie', target: 'friend', snap: { dx: -15, dy: 0 },
        setup: [{ pose: ['friend', 'fallen'] }, { mood: ['friend', '😢'] }],
        hint: 'Ikaw naman! I-drag si Noxie sa kaibigan para tulungan siya.',
        done: [
          { talk: ['noxie', 'Sorry! Okay ka lang ba?'] },
          { pose: ['friend', ''] },
          { mood: ['friend', '😊'] },
          { hearts: 'friend' },
        ],
      },
    ],
  },

  {
    id: 'pila',
    icon: '🚶',
    title: 'Pagpila',
    en: 'Wait for your turn',
    scene: 'school',
    phrase: 'Hihintayin ko ang turn ko.',
    tip: 'Sa tindahan o sa palaruan, ipakita kung saan ang dulo ng pila at purihin ang bata kapag naghintay siya.',
    actors: [
      { ...NOXIE, x: 10, y: 58 },
      { id: 'tindera', e: '🧑‍🍳', x: 90, y: 56, size: 14 },
      { id: 'k1', e: '👧', x: 74, y: 60, size: 13 },
      { id: 'k2', e: '👦', x: 60, y: 60, size: 13 },
      { id: 'k3', e: '🧒', x: 46, y: 60, size: 13 },
      { id: 'spot', e: '👣', x: 31, y: 80, size: 8 },
    ],
    intro: 'Pila sa kantina. Gusto ring bumili ni Noxie.',
    watch: {
      wrong: [
        { move: ['noxie', 84, 66] },
        { say: 'Sumingit si Noxie sa unahan!' },
        { mood: ['k1', '😠'] }, { mood: ['k2', '😠'] }, { mood: ['k3', '😠'] },
        { mark: 'wrong' },
        { say: 'Nagalit ang lahat. Hindi ito tama.' },
      ],
      right: [
        { move: ['noxie', 31, 60] },
        { talk: ['noxie', 'Hihintayin ko ang turn ko.'] },
        { mood: ['k3', '😊'] },
        { hearts: 'noxie' },
        { mark: 'right' },
        { say: 'Pumila sa dulo at maghintay ng turn. Magaling!' },
      ],
    },
    practice: [
      {
        type: 'drag', item: 'noxie', target: 'spot', snap: { dx: 0, dy: -20 },
        wrong: [
          { id: 'k1', say: 'Ay, unahan iyan! Sa dulo tayo pipila.' },
          { id: 'k2', say: 'Hindi diyan. Sa dulo ng pila tayo.' },
          { id: 'tindera', say: 'Ay, unahan iyan! Sa dulo tayo pipila.' },
        ],
        hint: 'Ikaw naman! I-drag si Noxie sa dulo ng pila, sa may bakas ng paa.',
        done: [{ hide: 'spot' }, { talk: ['noxie', 'Hihintayin ko ang turn ko.'] }, { mood: ['k3', '😊'] }, { hearts: 'noxie' }],
      },
    ],
  },
];

export function lessonById(id) {
  return LESSONS.find((l) => l.id === id);
}
