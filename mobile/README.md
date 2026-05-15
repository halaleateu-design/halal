# Tayy — Android & iOS (Capacitor)

This folder wraps your **static Tayy website** (`../`) inside native shells using [Capacitor](https://capacitorjs.com/). You get real **Android** and **iOS** projects you can open in Android Studio and Xcode, ship to Play Store / App Store, and add native plugins later (push, biometrics, etc.).

## Business contact (in-app)

The bundled site shows **HalalEat EU business email** on footers and trust sections: **[halaleateu@gmail.com](mailto:halaleateu@gmail.com)** — same as the desktop web build after you run `npm run copy-web` / `npm run sync`.

## What you need

| Platform | Requirements |
|----------|----------------|
| **All** | [Node.js](https://nodejs.org/) **LTS** (v18+), npm |
| **Android** | [Android Studio](https://developer.android.com/studio) (SDK + platform tools), JDK 17 |
| **iOS** | **macOS** + Xcode + CocoaPods (`sudo gem install cocoapods`) — Apple does not allow iOS builds on Windows |

## One-time setup (from this `mobile/` folder)

```powershell
cd mobile
npm install
npm run copy-web
npx cap add android
npx cap add ios
npx cap sync
```

- `npm run copy-web` runs `scripts/sync-web.ps1` and copies `*.html`, `*.css`, `*.js`, `assets/`, `rider/`, etc. from the repo root into `www/`.
- After `cap add`, folders `android/` and `ios/` appear (they are listed in `.gitignore` here — commit them if your team wants them in git).

## Run on device / emulator

```powershell
npx cap open android
npx cap open ios
```

Then use **Run** in Android Studio or Xcode.

## After you change the website

From `mobile/`:

```powershell
npm run sync
```

This recopies the web files and pushes them into the native projects.

## Debug APK (Android, command line)

After `android/` exists:

```powershell
cd android
.\gradlew.bat assembleDebug
```

APK path (typical): `android\app\build\outputs\apk\debug\app-debug.apk`

## Notes (Roman Urdu / English)

- **Windows par sirf Android** build/debug asaan hai. **iPhone (iOS) ke liye Mac + Xcode zaroori** hai — yeh Apple ki policy hai, Capacitor isko change nahi karta.
- Play Store / App Store par publish karne ke liye **developer accounts**, **signing keys**, aur **privacy policy** alag se tayar karni hoti hain.
- Agar aap site ko Netlify / server par host karte ho aur app mein sirf **URL** kholna ho to baad mein `capacitor.config.json` mein `server.url` add kar sakte ho (online-first mode). Abhi default **offline bundled** `www/` hai taake app bina internet ke bhi homepage dikha sake (static assets).

## App ID

Bundle ID: `eu.halaleat.app` — change in `capacitor.config.json` if you use another id before store submission.
