# APK signing

Android only installs an update when it is signed with the same key as the installed app.
The release workflow signs every APK with one permanent key, stored as the GitHub Actions
secret `ANDROID_KEYSTORE_B64` (the keystore file, base64-encoded). The key is never committed.

- Key format: alias `androiddebugkey`, store/key password `android` (debug-key format, used by `assembleDebug`).
- Public SHA-256 fingerprint (safe to share): `4D:A9:48:F2:3B:A8:DC:81:27:FE:74:52:38:A6:48:83:12:8F:75:16:C7:36:7B:3B:F2:65:F7:D1:83:0E:8E:95`
- The workflow stops the release if the secret is missing or the APK has a different fingerprint.
- Never replace the secret with a different key, or installed apps will refuse updates.
- Keep a private backup of the keystore file (e.g. in your own Google Drive). If it is lost,
  every phone must uninstall the app once more.

## Adding the secret (one time)
1. On GitHub open the repo → **Settings** → **Secrets and variables** → **Actions**.
2. Click **New repository secret**.
3. Name: `ANDROID_KEYSTORE_B64`. Secret: paste the whole text from the keystore base64 file, then click **Add secret**.
