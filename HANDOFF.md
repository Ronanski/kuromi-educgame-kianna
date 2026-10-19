# Handoff / Status

## v0.1 (first version)
- Done: Home, Math/English/Filipino quiz, result screen, stickers (1 per 5 stars), parent screen
  (voice toggle, reset, custom mascot picture), PWA offline install, Pages workflow.
- Tested: unit tests (8), Playwright smoke test that plays all 3 subjects plus the custom mascot upload.
- Not yet tested: on a real Android phone (install, voice, offline). Filipino voice depends on the phone;
  if there is no fil-PH voice it falls back to an English voice.

## v0.1.0 APK
- Release workflow builds a debug-signed APK (installable, not for Play Store) and attaches it to the GitHub Release.
- The APK uses the phone's native text-to-speech and falls back to English if there is no Filipino voice.
- Not yet tested on a real phone. The Play Store would need a release keystore plus an AAB build (future work).

## Ideas next
- More question types (shapes, bigger/smaller, Filipino alphabet / ABAKADA)
- Difficulty levels, simple background music, native APK via Capacitor if needed
