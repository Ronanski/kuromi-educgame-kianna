# Noxie's Starry School

Educational game for kids ages 4-6, made for Kianna. Goth-cute kitty theme. Works on Android
as an installable web app (PWA): open the GitHub Pages link in Chrome, then **⋮ → Add to Home screen**.
It works offline after the first open.

## What's inside
- **Math**: counting 1-10, finding numbers 0-10, addition up to 10, simple subtraction
- **English**: picture → word, first letter of a word
- **Filipino**: larawan → salita, kulay, bilang (isa hanggang sampu)
- Questions are read aloud (voice), there are 5 questions per round, and stars unlock stickers
- **Para sa Magulang**: voice on/off, reset stars, and **Palitan ang Mascot** (use your own picture,
  which stays only on the phone and is never uploaded)

## Run and test
```
npm test          # unit tests for the question generators
npm run smoke     # plays every subject in headless Chromium (needs Playwright)
npm run serve     # local server at http://localhost:8080
```

## Copyright
The default mascot "Noxie" is an original character. No licensed characters or artwork are in this
repo, because the GitHub Pages site is public. Any personal picture a parent picks stays on their device.
