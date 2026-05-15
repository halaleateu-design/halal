# Tayy — Google Play (free listing)

Your app is a **Capacitor** wrapper around the same website in `www/`. Publishing on Play Store is **free** for a developer account (one-time **$25** registration fee to Google — not per app).

## Before you upload

1. Install **Node.js LTS**, **Android Studio**, JDK 17.
2. From `mobile/`:

```powershell
cd mobile
npm install
npm run copy-web
npx cap add android
npx cap sync
```

3. Open Android Studio:

```powershell
npx cap open android
```

4. In Android Studio: **Build → Generate Signed Bundle / APK** → choose **Android App Bundle (AAB)** for Play Console.

## Play Console checklist

| Item | Value |
|------|--------|
| App name | **Tayy** |
| Package name | `eu.tayy.app` (must match `capacitor.config.json`) |
| Category | Food & Drink |
| Contact email | halaleateu@gmail.com |
| Privacy policy URL | Your live site URL + privacy page (required) |
| Content rating | Complete questionnaire in Play Console |
| Screenshots | Phone 1080×1920 from emulator or device |

## Store listing text (draft)

**Short description:** Halal delivery & groceries in the EU — verified partners, Porto pilot.

**Full description:** Tayy is an EU halal marketplace. Browse menus, order via WhatsApp with verified partners, and follow us on Instagram @eathalaleu.

## Google Maps / Business

- Claim **[Google Business Profile](https://business.google.com/)** for your kitchen or office address.
- Put the same address in `site-config.js` → `maps.lat`, `maps.lng`, `maps.placeId`.
- Add your Play Store link to the Business Profile when live.

## iOS (iPhone)

Requires a **Mac** with Xcode. Same `npm run sync`, then `npx cap open ios`. Apple Developer Program is **$99/year** (unlike Play’s one-time fee).

## After website changes

```powershell
npm run sync
```

Then rebuild the AAB in Android Studio and upload a new version in Play Console.
