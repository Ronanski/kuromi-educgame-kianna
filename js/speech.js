// Voice for questions and stories. speak() returns a promise that resolves when the
// line is finished (or after an estimated reading time), so stories can wait for it.
//
// Android app (Capacitor): the WebView has no speechSynthesis, so the phone's native
// text-to-speech plugin is used instead. Undefined when running in a browser.
const nativeTTS = window.Capacitor?.isNativePlatform?.() ? window.Capacitor.Plugins?.TextToSpeech : undefined;

export const isNativeApp = Boolean(window.Capacitor);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Rough time a line takes to say aloud; also the pause when voice is off.
export function readingTime(text) {
  return Math.max(1200, text.length * 75);
}

// "cute" = high, playful voice for the mascot; "normal" = plain voice.
export const VOICE_STYLES = {
  cute: { pitch: 1.7, rate: 1.0 },
  normal: { pitch: 1.1, rate: 0.9 },
};

// Prefer a female/child-like voice when the device offers one; it sounds cuter when pitched up.
const SOFT_VOICE = /female|woman|girl|child|kid|zira|samantha|karen|tessa|fiona|victoria|google uk english female|-f\d|#female/i;

export function createSpeech({ enabled, style = () => 'cute', fast = false }) {
  const tone = () => VOICE_STYLES[style()] || VOICE_STYLES.cute;

  function stop() {
    if (nativeTTS) nativeTTS.stop().catch(() => {});
    else if ('speechSynthesis' in window) speechSynthesis.cancel();
  }

  function speakNative(text, lang) {
    const { pitch, rate } = tone();
    const opts = { text, rate, pitch, volume: 1.0, category: 'ambient' };
    return nativeTTS.stop().catch(() => {})
      .then(() => nativeTTS.speak({ ...opts, lang }))
      // Filipino voice may not be installed; retry in English.
      .catch(() => (lang !== 'en-US' ? nativeTTS.speak({ ...opts, lang: 'en-US' }) : undefined))
      .catch(() => {});
  }

  function speakBrowser(text, lang) {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();
    // Filipino voices are rare; fall back to an English voice if missing.
    const pickFrom = (list) => list.find((x) => SOFT_VOICE.test(x.name)) || list[0];
    const v = pickFrom(voices.filter((x) => x.lang.replace('_', '-').startsWith(lang)))
      || pickFrom(voices.filter((x) => x.lang.startsWith(lang.slice(0, 2))))
      || pickFrom(voices.filter((x) => x.lang.startsWith('en')));
    if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = lang; }
    const { pitch, rate } = tone();
    u.rate = rate;
    u.pitch = pitch;
    return new Promise((resolve) => {
      u.onend = resolve;
      u.onerror = resolve;
      speechSynthesis.speak(u);
    });
  }

  function speak(text, lang = 'en-US') {
    if (fast) return sleep(30);
    if (!enabled()) return sleep(readingTime(text));
    let done;
    if (nativeTTS) done = speakNative(text, lang);
    else if ('speechSynthesis' in window) done = speakBrowser(text, lang);
    else return sleep(readingTime(text));
    // Some engines never fire "end"; never let a story hang on it.
    return Promise.race([done, sleep(readingTime(text) + 2500)]);
  }

  if (!nativeTTS && 'speechSynthesis' in window) speechSynthesis.getVoices(); // warm up voice list
  return { speak, stop };
}
