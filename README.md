# EatHalal Go (GO) — Halal eat EU

Marketplace web + API for halal delivery (Porto pilot).

## Docs (planeamento)

- **[docs/PLANEAMENTO-EATHALAL-GO.md](docs/PLANEAMENTO-EATHALAL-GO.md)** — visão, waitlist, pagamentos, roadmap, PONTOS 1–5  
- **[docs/ESTADO-TECNICO.md](docs/ESTADO-TECNICO.md)** — o que já está implementado no código  
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

https://halall-dm79.onrender.com
