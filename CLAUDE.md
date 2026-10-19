# CLAUDE.md

Read PROJECT_RULES.md and HANDOFF.md before changing anything.

- Plain HTML/CSS/JS (ES modules), no build step. Entry: `index.html` → `js/app.js`.
- `js/questions.js` is pure (no DOM) and is unit tested in `tests/questions.test.mjs`.
- `js/character.js` holds the original mascot SVG.
- Mabuting Asal: lessons are data in `js/values.js` (tested by `tests/values.test.mjs`); `js/scene.js` plays them
  (actors, steps, drag/tap/fill practice). `js/speech.js` is the shared voice (Cute/Normal style). `?fast=1` speeds
  stories up for tests.
- Deploy: `.github/workflows/pages.yml` runs tests on every PR and deploys to Pages on push to `main`.
- Android APK: `.github/workflows/release.yml` (Capacitor 7). On push to `main`, if tag `v<package.json version>`
  does not exist yet, it builds a debug-signed APK and publishes a GitHub Release. Bump `version` to ship a new APK.
  The `android/` project is generated in CI (not committed).
- Voice: browser `speechSynthesis` on the web; native `TextToSpeech` plugin inside the APK (WebView has no speechSynthesis).
- Before pushing: `npm test`, `npm run smoke` and `npm run smoke:values` (set `NODE_PATH=/opt/node22/lib/node_modules` in the cloud container).
- When you change any cached file, bump `CACHE` in `sw.js` so installed phones get the update.
