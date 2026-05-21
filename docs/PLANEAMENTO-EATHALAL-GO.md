# Planeamento do projeto — EatHalal Go (GO)

> Documento vivo. Atualizar secções à medida que as decisões forem tomadas.  
> Código e deploy: ver também [ESTADO-TECNICO.md](./ESTADO-TECNICO.md).

---

## Visão geral

- **Objetivo:** Lançar um marketplace de entrega **100% halal** na UE, começando no **Porto (Portugal)**, com app/web para cliente, painel para restaurante/talho e app para estafeta — fase atual = **waitlist + parceiros + piloto WhatsApp/API**.
- **Problema que resolve:** Apps genéricas misturam halal e não-halal; consumidores e famílias muçulmanas querem confiança, menus claros e entrega fiável num só sítio.
- **Público-alvo:** Famílias e jovens halal no Porto (expansão EU); restaurantes/talhos halal locais; estafetas (bicycle/scooter/car).
- **Proposta de valor:** Só parceiros verificados halal · um ecrã para encomendar · transparência de taxas · suporte local (PT/EN).

**Marca no código:** GO / Halal eat EU · domínio/API: `halall-dm79.onrender.com` · email operacional: `halaleateu@gmail.com`

---

## Escopo

### Inclui (agora + MVP próximo)

- [x] Site público (homepage, categorias, menu demo, WhatsApp checkout)
- [x] Registo cliente / merchant / rider (`signup.html`, API `/auth/register`)
- [x] Candidatura merchant (`partners.html` → `/merchants/apply`)
- [x] Waitlist estafeta (`rider/index.html` → `/riders/apply`)
- [x] Waitlist cliente (`waitlist.html` → `/waitlist`)
- [x] Admin inbox (merchant + rider lists, tracking codes) — `admin/index.html`
- [x] Fluxo de encomenda API (cliente → merchant aceita → pool riders → claim → GPS → track)
- [ ] Pagamentos in-app (Stripe / MB Way) — **não incluído ainda**
- [ ] Apps nativas iOS/Android (Capacitor em `mobile/` — roadmap)
- [ ] Split automático de pagamentos (restaurante + estafeta + plataforma)

### Não inclui (por agora)

- [ ] Álcool, apostas, categorias não-halal
- [ ] Marketplace genérico fora do vertical halal
- [ ] Multi-cidade plena fora do piloto Porto (só preparação EU)
- [ ] Contabilidade/faturação automática PT (Lda + contabilista = processo manual)

---

## Entregáveis

- [ ] **MVP (descrição):** Porto · 3–5 restaurantes · waitlist ≥500 · pedidos via web/API ou WhatsApp · merchant aceita · 1+ rider · tracking público.
- [ ] **Protótipo (Figma/link):** _a definir_
- [x] **Backlog inicial:** este documento + [ESTADO-TECNICO.md](./ESTADO-TECNICO.md) + GitHub `halaleateu-design/halal`

---

## Requisitos

### Funcionais

- [x] Cliente: browse menu, pedido (guest ou conta), código de tracking
- [x] Restaurante: receber pedido (API + email opcional), aceitar, ver morada cliente
- [x] Estafeta: pool de jobs, claim, morada loja + cliente, GPS, estados picked_up → delivered
- [x] Operador: admin stats + listas merchant/rider + criar tracking manual
- [ ] Cliente: pagar cartão/MB Way/Apple Pay na app
- [ ] Estafeta: notificação push nativa
- [ ] Restaurante: tablet “novo pedido” com som

### Não funcionais

- [ ] **Performance:** API Render free tier; otimizar quando >1k DAU
- [x] **Segurança/privacidade:** JWT, `ADMIN_API_KEY`, env secrets no Render; GDPR pack antes de contas em massa
- [ ] **Acessibilidade:** melhorar formulários e contraste (auditoria pendente)

---

## Roadmap (alto nível)

| Fase | Meta | Prazo | Status |
| --- | --- | --- | --- |
| Descoberta | Waitlist + 10 restaurantes Porto mapeados | _definir_ | **Em curso** |
| MVP | 3–5 parceiros live + entregas piloto | _definir_ | Não iniciado |
| Beta | Pagamentos Stripe + app stores | _definir_ | Não iniciado |

**Fases operacionais (negócio):**

1. **Fase atual (Waitlist):** gasto ~zero · site + listas · validar interesse Porto (meta ex.: 500 inscritos).
2. **Fase preparação:** fechar 3–5 restaurantes · mochilas estafetas · app em revisão Apple/Google.
3. **Go-live:** Stripe ativo · email/WhatsApp à waitlist · entregas oficiais.

---

## Decisões

- **Decisão:** Stack web + API monólito Node (Express + SQLite) em Render; frontend estático no mesmo host ou Netlify.
  - **Data:** 2025–2026
  - **Contexto:** equipa pequena, custo baixo, deploy rápido
  - **Opções consideradas:** Firebase-only, microserviços
  - **Escolha:** Node + SQLite + HTML estático
  - **Motivo:** simplicidade, E2E testável, um URL Render

- **Decisão:** Checkout WhatsApp enquanto PSP não está live.
  - **Escolha:** `wa.me/351931430970` no site
  - **Motivo:** receita real antes de Stripe

_Adicionar novas decisões abaixo._

---

## Riscos e mitigação

- **Risco:** Render free — disco SQLite pode resetar
  - **Impacto:** perda de leads
  - **Probabilidade:** média
  - **Mitigação:** export semanal admin · backup · plano pago ou Postgres

- **Risco:** Emails de alerta não chegam (`NOTIFY_TO` / SMTP / Resend)
  - **Impacto:** leads só visíveis no admin
  - **Mitigação:** `/api/v1/notify-status` · configurar Resend ou Gmail app password

- **Risco:** Deploy falhou / API base errada no admin
  - **Mitigação:** API base = `https://…/api/v1` · `ADMIN_API_KEY` no Render Environment

---

## Métricas de sucesso

- [ ] **Aquisição:** visitas site, conversão waitlist %
- [ ] **Ativação:** 1º pedido por utilizador registado
- [ ] **Retenção:** 2º pedido em 30 dias
- [ ] **Receita:** GMV, comissão 15–30%, taxa serviço
- [ ] **NPS/CSAT:** inquérito pós-entrega

---

## Parceria IHP (estratégia — não expor mensagens internas no site)

- **Objetivo:** cooperação com **Instituto Halal de Portugal** — canal digital de angariação + visibilidade de certificados; EatHalal não substitui a certificação oficial.
- **Proposta:** sem pedir dinheiro no primeiro contacto; reunião com waitlist + métricas Porto; selo “apoio institucional” + facilitação para parceiros que entram pela app.
- **Site (EN):** `certification.html` (B2B), `waitlist.html` + `waitlist-success.html` (referral queue).

---

## Waitlist (foco)

### Objetivo da waitlist

- [ ] Meta (ex.: **500 inscritos** até _DD/MM_)
- [x] Segmento prioritário: **Porto, Portugal** (piloto)

### Oferta e mensagem

- [ ] Promessa principal (1 frase): _ex.: “A primeira entrega halal-all-in-one do Porto, na tua porta.”_
- [ ] Incentivo: acesso antecipado / cupom lançamento
- [x] Prova: parceiro demo Porto Halal Kitchen · política halal no site

### Canais de aquisição

- [ ] Instagram/TikTok (@eathalaleu)
- [ ] Comunidades locais (Facebook/WhatsApp)
- [ ] Parcerias restaurantes/mesquitas
- [ ] SEO/Google Maps
- [ ] Referral

### Fluxo (implementado no site)

1. [x] Landing: `waitlist.html` (Panel 1 — first 100 perks, EN)
2. [x] Success + referral: `waitlist-success.html` (queue #, WhatsApp/IG share, `?ref=`)
3. [x] B2B: `certification.html` (Panel 3 — IHP comparison, EN)
4. [x] API: `POST /api/v1/waitlist` + `GET /api/v1/waitlist/position/:id`
5. [ ] Confirmação email automática ao utilizador
6. [ ] Sequência follow-up 2–3 mensagens (manual/WhatsApp)

### Métricas

- [ ] Visitas → conversão (%)
- [ ] Custo por lead
- [ ] Crescimento semanal
- [ ] Origem (UTM — a adicionar)

### Próximas ações (esta semana)

- [ ] Definir meta e público
- [ ] Copy final headline + 3 bullets + CTA
- [x] Formulário integrado API
- [ ] 5 posts + 1 story com CTA
- [ ] 20 comunidades/parceiros outreach

---

## Próximos passos (negócio)

- [ ] Lista de **10 restaurantes (Porto)**
- [ ] Modelo de negócio e comissões (ver abaixo)
- [ ] Roteiro de abordagem parceiros

---

# PONTO 1: Como funcionam os sistemas e a tecnologia

Uma app como a EatHalal não é apenas “uma” aplicação — são **três superfícies** + **cérebro**:

| Sistema | Função | Estado no projeto GO |
| --- | --- | --- |
| **App / web cliente** | Menu, pedido, pagar, mapa estafeta | Web: `index.html`, `delivery-place-order.html`, `track-order.html` |
| **Painel restaurante** | Novo pedido → aceitar → pronto | `delivery-merchant-console.html` + SSE + email |
| **App estafeta** | Pool → claim → GPS → entregar | `delivery-rider-console.html` + SSE |
| **Backend (“cérebro”)** | Distâncias, preços, estados, notificações | `backend/src` — Maps embed (sem billing key); rotas `/api/v1/orders/*` |

Comunicação em tempo real hoje: **SSE** (`/api/v1/orders/stream/...`) + polling em `track-order.html`.

---

# PONTO 2: Pagamentos na prática

- Cliente paga na app (cartão, MB Way, Apple/Google Pay) → dinheiro entra na conta EatHalal → **split** semanal.
- Fornecedor previsto: **Stripe** ou **Adyen** (não ligado no código ainda).
- Exemplo pedido **20€**: 15€ comida + 3€ entrega + 2€ taxa serviço → Stripe fee → transferências restaurante / estafeta / margem plataforma.

**Hoje:** checkout **WhatsApp** e pedidos API sem captura de pagamento.

---

# PONTO 3: Matemática do lucro (business model)

1. **Comissão comida (15–30%, alvo ~20%):** ex. 15€ × 20% = **3€** plataforma  
2. **Taxa de serviço ao cliente:** fixa ex. 0,80–1,50€ / pedido  
3. **Margem entrega (opcional):** ex. cliente 3,50€ · estafeta 3€ · plataforma 0,50€  

_Lucro bruto = comissão + taxa serviço + margem entrega − custos infra/marketing._

---

# PONTO 4: Custos iniciais (lean)

| Área | Itens | Notas |
| --- | --- | --- |
| **Tech** | Render, domínio, Google Maps API, Apple 99$/ano, Google 25$ único | Render free no arranque |
| **Operação Porto** | 5–10 mochilas térmicas branded, flyers QR restaurantes, ads IG local | |
| **Legal PT** | Lda “Empresa na Hora” ~360€ + contabilista mensal | Obrigatório para faturação |

---

# PONTO 5: Passo a passo cronológico

1. **Waitlist (agora):** site online · quase zero custo · validar 500 inscritos Porto.  
2. **Preparação:** 3–5 restaurantes fechados · mochilas · riders da waitlist.  
3. **Go-live:** Stripe · aviso waitlist · entregas oficiais.

---

## Links úteis (equipa)

| O quê | URL / ficheiro |
| --- | --- |
| Site live | https://halall-dm79.onrender.com |
| Admin | https://halall-dm79.onrender.com/admin/ |
| Waitlist cliente | https://halall-dm79.onrender.com/waitlist.html |
| Merchant | https://halall-dm79.onrender.com/partners.html |
| Rider | https://halall-dm79.onrender.com/rider/index.html |
| Delivery hub (testes) | https://halall-dm79.onrender.com/delivery-hub.html |
| API health | https://halall-dm79.onrender.com/api/v1/health |
| Checklist operador | `OPERATOR-CHECKLIST.txt` |
| Render env | `RENDER-SETUP.txt` |
| Teste automático | `npm run test:e2e` |
