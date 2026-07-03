# EatHalal GO — Android & iOS (Capacitor)

Native **EatHalal** app wrapping the same web codebase (`../`) via [Capacitor](https://capacitorjs.com/).

| Item | Value |
|------|--------|
| App name | **EatHalal** |
| Package / bundle | `eu.halaleat.go.app` |
| Entry screen | `app.html` (home hub + bottom tabs) |
| API (native) | `https://halall-dm79.onrender.com/api/v1` |

## Quick start (Windows → Android)

```powershell
cd mobile
npm install
npm run sync
npx cap open android
```

In **Android Studio**: Run ▶ on emulator or USB device.

Debug APK (after `android/` exists + JDK 17):

```powershell
npm run build:android
```

APK: `android\app\build\outputs\apk\debug\app-debug.apk`

## After website changes

```powershell
cd mobile
npm run sync
```

Then rebuild in Android Studio or `npm run build:android`.

## iOS

Requires **macOS + Xcode**. Same `npm run sync`, then `npx cap open ios`.

## Files (repo root)

- `app.html` — mobile home (waitlist, menu, track, partners)
- `mobile-native.js` — Capacitor splash, status bar, back button
- `mobile-app.css` — safe areas + bottom tab bar
- `api-client.js` — detects native app → uses production API

See also [PLAYSTORE.md](./PLAYSTORE.md) for Google Play listing.
