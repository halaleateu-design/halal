# EatHalal Go (GO) — Halal eat EU

Marketplace web + API for halal delivery (Porto pilot).

## Docs (internal)

- **[docs/PLANEAMENTO-EATHALAL-GO.md](docs/PLANEAMENTO-EATHALAL-GO.md)** — internal Notion sync only (not published on site)
- **[docs/ESTADO-TECNICO.md](docs/ESTADO-TECNICO.md)** — o que já está implementado no código
- **[mobile/README.md](mobile/README.md)** — **Android/iOS app** (Capacitor)  
- **[OPERATOR-CHECKLIST.txt](OPERATOR-CHECKLIST.txt)** — operação diária  
- **[RENDER-SETUP.txt](RENDER-SETUP.txt)** — deploy Render + env vars  

## Run locally

```bash
cd backend
npm install
node src/server.js
```

Open http://localhost:3001 — homepage, `waitlist.html`, `partners.html`, `admin/`.

## Test full delivery flow

```bash
npm run test:e2e
```

## Live

https://eathalaleu.netlify.app/waitlist.html  
https://halall-dm79.onrender.com

## Mobile app (Android / iOS)

```powershell
cd mobile
npm install
npm run sync
npx cap open android
```

Entry screen: **app.html** · Package: `eu.halaleat.go.app` · See [mobile/README.md](mobile/README.md).
