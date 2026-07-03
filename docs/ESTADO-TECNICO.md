# Estado técnico — GO / EatHalal (código vs planeamento)

Resumo para alinhar [PLANEAMENTO-EATHALAL-GO.md](./PLANEAMENTO-EATHALAL-GO.md) (Notion/internal) com o repositório `halal-food-website`.

## Já implementado

| Área | Ficheiros / API |
| --- | --- |
| Auth | `POST /api/v1/auth/register`, `login`, `me` |
| Merchant apply | `POST /api/v1/merchants/apply` + `partners.html` |
| Rider apply | `POST /api/v1/riders/apply` + `rider/index.html` |
| Customer waitlist | `POST /api/v1/waitlist` + `waitlist.html` |
| Delivery orders | `backend/src/routes/orders.js` — create, accept, rider pool/claim, GPS, status |
| Live updates | SSE `GET /api/v1/orders/stream/{merchant\|rider\|customer}` |
| Public tracking | `GET /api/v1/track/:code` + `track-order.html` |
| Admin | `GET/POST /api/v1/admin/*` + `admin/index.html` (precisa `ADMIN_API_KEY`) |
| Email alerts | `notify-email.js` — `NOTIFY_TO` + Resend ou SMTP |
| E2E test | `npm run test:e2e` → `scripts/run-e2e-automated.mjs` |

## Local vs produção

- **Local:** `cd backend && node src/server.js` → http://localhost:3001  
- **API client:** em `localhost` usa sempre `:3001/api/v1` (não Render).  
- **Produção:** https://halall-dm79.onrender.com/api/v1  

## Por fazer (roadmap técnico)

- Stripe / MB Way checkout
- Push notifications (FCM/APNs)
- Postgres em vez de SQLite em produção
- Email de confirmação ao utilizador (waitlist + pedido aceite — parcialmente no merchant/rider apply)
- Google Maps Directions API (chave) para rotas turn-by-turn no embed
- App Capacitor (`mobile/`) publicada nas stores

## Variáveis Render (mínimo)

Ver `backend/.env.example`: `JWT_SECRET`, `ADMIN_API_KEY`, `NOTIFY_TO`, `FRONTEND_URL`, `CORS_ORIGIN`, Resend ou SMTP.
