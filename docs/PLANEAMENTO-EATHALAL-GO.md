# Planeamento do projeto — EatHalal Go

> Documento vivo. Atualizar secções à medida que as decisões forem tomadas.  
> **English version:** [EATHALAL-GO-PLANNING.md](./EATHALAL-GO-PLANNING.md)  
> Código e deploy: ver também [ESTADO-TECNICO.md](./ESTADO-TECNICO.md).

---

## Visão geral

- **Objetivo:** Lançar um marketplace de entrega **100% halal** na UE, começando no **Porto (Portugal)**, com app/web para cliente, painel para restaurante/talho e app para estafeta — fase atual = **waitlist + parceiros + piloto WhatsApp/API**.
- **Problema que resolve:** Apps genéricas misturam halal e não-halal; consumidores e famílias muçulmanas querem confiança, menus claros e entrega fiável num só sítio.
- **Público-alvo:** Famílias e jovens halal no Porto (expansão EU); restaurantes/talhos halal locais; estafetas (bicycle/scooter/car).
- **Proposta de valor:** Só parceiros verificados halal · um ecrã para encomendar · transparência de taxas · suporte local (PT/EN).

---

## Escopo

### Inclui

- [x] Site público (homepage, categorias, menu demo, WhatsApp checkout)
- [x] Registo cliente / merchant / rider (`signup.html`, API `/auth/register`)
- [x] Candidatura merchant (`partners.html` → `/merchants/apply`)
- [x] Waitlist estafeta (`rider/index.html` → `/riders/apply`)
- [x] Waitlist cliente (`waitlist.html` → `/waitlist`)
- [x] Admin inbox (merchant + rider lists, tracking codes) — `admin/index.html`
- [x] Fluxo de encomenda API (cliente → merchant aceita → pool riders → claim → GPS → track)
- [ ] Pagamentos in-app (Stripe / MB Way)
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
| Descoberta | Waitlist + 10 restaurantes Porto mapeados | _definir_ | Em curso |
| MVP | 3–5 parceiros live + entregas piloto | _definir_ | Não iniciado |
| Beta | Pagamentos Stripe + app stores | _definir_ | Não iniciado |

---

## Decisões

- **Decisão:** Stack web + API monólito Node (Express + SQLite) em Render; frontend estático no mesmo host ou Netlify.
    - **Data:** 2025–2026
    - **Contexto:** equipa pequena, custo baixo, deploy rápido
    - **Opções consideradas:** Firebase-only, microserviços
    - **Escolha:** Node + SQLite + HTML estático
    - **Motivo:** simplicidade, E2E testável, um URL Render

- **Decisão:** Checkout WhatsApp enquanto PSP não está live.
    - **Data:** 2025–2026
    - **Contexto:** pagamentos in-app ainda não integrados
    - **Opções consideradas:** Stripe imediato vs WhatsApp manual
    - **Escolha:** `wa.me/351931430970` no site
    - **Motivo:** receita real antes de Stripe

- **Decisão:** Site de waitlist e B2B em inglês (EN).
    - **Data:** 2026
    - **Contexto:** piloto Porto com audiência PT/EN e turistas
    - **Opções consideradas:** PT-only vs EN-only vs bilingual
    - **Escolha:** `waitlist.html`, `waitlist-success.html`, `certification.html` em EN
    - **Motivo:** copy de lançamento e outreach internacional alinhados com flyers e Instagram

---

## Riscos e mitigação

- **Risco:** Render free — disco SQLite pode resetar
    - **Impacto:** perda de leads
    - **Probabilidade:** média
    - **Mitigação:** export semanal admin · backup · plano pago ou Postgres

- **Risco:** Emails de alerta não chegam (`NOTIFY_TO` / SMTP / Resend)
    - **Impacto:** leads só visíveis no admin
    - **Probabilidade:** média
    - **Mitigação:** `/api/v1/notify-status` · configurar Resend ou Gmail app password

- **Risco:** Deploy falhou / API base errada no admin
    - **Impacto:** operador não vê candidaturas
    - **Probabilidade:** baixa
    - **Mitigação:** API base = `https://…/api/v1` · `ADMIN_API_KEY` no Render Environment

---

## Métricas de sucesso

- [ ] **Aquisição:** visitas site, conversão waitlist %
- [ ] **Ativação:** 1º pedido por utilizador registado
- [ ] **Retenção:** 2º pedido em 30 dias
- [ ] **Receita (se aplicável):** GMV, comissão 15–30%, taxa serviço
- [ ] **NPS/CSAT (se aplicável):** inquérito pós-entrega

---

## Waitlist (foco)

### Objetivo da waitlist

- [ ] **Meta (ex.: 500 inscritos até DD/MM)**
- [x] **Segmento prioritário:** Porto, Portugal (piloto)

### Oferta e mensagem

- [ ] **Promessa principal (1 frase):** _ex.: “A primeira plataforma de entrega 100% halal do Porto, na tua porta.”_
- [x] **Incentivo:** acesso antecipado · **1ª entrega grátis** + **desconto 1 ano** para os **primeiros 100** (`waitlist.html`)
- [x] **Prova/credenciais:** parceiro demo Porto Halal Kitchen · política halal no site · caminho IHP em `certification.html`

### Canais de aquisição

- [ ] Instagram/TikTok (@eathalaleu)
- [ ] Comunidades locais (Facebook/WhatsApp/Reddit)
- [ ] Parcerias (restaurantes/mosques/associações)
- [ ] SEO/Google Maps (se aplicável)
- [ ] Indicação (referral — implementado em `waitlist-success.html` com `?ref=`)

### Fluxo

1. [x] Landing page (copy + CTA) — `waitlist.html` (EN)
2. [x] Formulário (nome + email/WhatsApp + cidade) — integrado API `POST /api/v1/waitlist`
3. [x] Confirmação + mensagem de boas-vindas — `waitlist-success.html` (posição na fila + link referral)
4. [ ] Sequência de follow-up (2–3 mensagens) — email/WhatsApp manual

### Métricas

- [ ] **Visitas → conversão (%):**
- [ ] **Custo por lead (se pago):**
- [ ] **Crescimento diário/semana:**
- [ ] **Origem dos leads (canal):** _UTM a adicionar_

### Assets (imagens) — onde usar

> Cole/insira cada imagem no local indicado abaixo (para não se perderem).  
> **Dica:** nomeie os ficheiros antes de subir (ex.: `waitlist-qr.png`, `flyer-coming-soon.jpg`, etc.).

### Mensagem para pedir exportação “PDF Print” (Canva)

Hi! Look, I was speaking with the print shop about printing our flyers in A5 size (14.8 x 21 cm). To ensure that the QR Code works perfectly on phones and the image doesn't lose any quality (like what happened in our previous tests), we need to export the file with professional print settings.

Could you handle this on Canva using your computer and send me the final file? The guy at the print shop asked us to do exactly this:

1. Adjust the size: Make sure the design is in the correct vertical A5 proportion (14.8 x 21 cm).
2. Turn on margins: In the Canva menu, enable the 'Show print bleed' option (so we don't risk the printer's cutter cropping out text or leaving white edges).
3. Export in maximum quality (Most important):
   - Click on Share > Download.
   - Choose the file type: PDF Print.
   - Check the box for 'Crop marks and bleed'.
   - Under the color profile, change it from RGB to CMYK (best for professional printing).

If you can download the original PDF file with these settings, the print shop will be able to print it directly with maximum sharpness. Thanks!

### Imagens (para anexar aqui)

- [ ] Anexar/colar as imagens do flyer + QR code nesta secção (as que enviaste na conversa).
- [ ] **QR Code EatHalal (IMG_7543.png):** colocar na landing page, flyers impressos e bio do Instagram.
- [ ] **Pack “Questions?/Join our Community/English-Arabic” (533B5A1E…jpeg):** usar como carrossel no Instagram + material de rua (CTA para WhatsApp + link da waitlist).
- [ ] **Flyer “Porto’s Halal Revolution…” (82328078…jpeg):** peça principal para divulgação (impresso + redes). Versão A/B com e sem fundo do Porto.
- [ ] **Banner “Preparem-se para o lançamento” (IMG_7534.png):** topo da landing page / story / anúncio (paid) para conversão.
- [ ] **Kit de elementos (IMG_7533.png):** biblioteca de assets (logos, selos, badges) para futuras peças.

#### Novos assets (adicionados agora)

- [ ] **Mockup landing/website completo (IMG_7443.png):** hero/thumbnail para apresentar o produto (pitch deck, LinkedIn, press kit) e como imagem principal em “Sobre/Como funciona”.
- [ ] **3 variações de hero/sections (IMG_7444.png):** usar para teste A/B da landing (headline/benefício/couriers) e como carrossel “Como funciona”.
- [ ] **Tríptico de estratégia (IMG_7438.png):** slide/1-pager interno para alinhar a mensagem (Benefício Direto vs Viral/Fila vs Distintivo) + carrossel educativo.
- [ ] **Grelha de posts/ads (IMG_7354.png):** banco de criativos para campanha (Instagram feed + ads). Separar em peças individuais quando necessário.
- [ ] **Screens da app (IMG_7336.png):** usar em “Features”, App Store/Google Play (futuro), pitch para parceiros e posts de produto.

### Próximas ações (esta semana)

- [ ] Definir meta e público
- [ ] Escrever copy da landing (headline + 3 bullets + CTA)
- [x] Criar formulário e integrar com API (substitui planilha/Notion — dados em `waitlist` DB + admin)
- [ ] Preparar 5 posts + 1 story com CTA
- [ ] Listar 20 comunidades/parceiros para outreach

---

## Próximos passos

- [ ] Lista de 10 Restaurantes (Porto)
- [ ] Modelo de Negócio e Comissões
- [ ] Roteiro de Abordagem para Parceiros

---

## PONTO 1: Como Funcionam os Sistemas e a Tecnologia?

Uma app como a EatHalal não é apenas "uma" aplicação; são **três sistemas integrados** que comunicam em tempo real:

1. **A App do Cliente:** Onde a pessoa vê o menu, escolhe a comida, paga e acompanha o estafeta no mapa.
2. **O Painel do Restaurante/Talho:** Um ecrã (normalmente num tablet ou telemóvel no balcão do parceiro) que apita quando entra um pedido. O restaurante aceita, prepara a comida e clica em "Pronto para Recolha".
3. **A App do Estafeta (Courier):** O sistema deteta qual é o estafeta mais próximo daquele restaurante e envia-lhe uma notificação: "Pedido disponível no Restaurante X. Ganho: 3,50€". O estafeta aceita, recolhe e entrega.

**O "Cérebro" (Backend):** No meio disto tudo, há um servidor central que calcula as distâncias automaticamente através da API do Google Maps, define o preço da entrega e distribui as tarefas.

**Estado no projeto GO (referência técnica):**

| Sistema | Ficheiros / rotas |
| --- | --- |
| App / web cliente | `index.html`, `delivery-place-order.html`, `track-order.html` |
| Painel restaurante | `delivery-merchant-console.html` + SSE + email |
| App estafeta | `delivery-rider-console.html` + SSE |
| Backend | `backend/src` · rotas `/api/v1/orders/*` · SSE `/api/v1/orders/stream/...` |

---

## PONTO 2: Como Funcionam os Pagamentos na Prática?

O cliente paga na app (via Cartão, MB Way ou Apple/Google Pay). O dinheiro **não vai direto para o restaurante**, vai primeiro para a conta da EatHalal.

**O Fluxo do Dinheiro (Gateway de Pagamento)**

Para processar os pagamentos na app com segurança absoluta, vocês precisam de usar um fornecedor como a **Stripe** ou a **Adyen**. O processo funciona assim:

1. O cliente faz um pedido de **20,00€** (15€ comida + 3€ taxa de entrega + 2€ taxa de serviço).
2. A **Stripe** processa o pagamento, cobra uma pequena taxa (ex: 1.4% + 0.25€) e retém o valor líquido na vossa conta digital da empresa.
3. **A Divisão (Split de Pagamentos):** Uma vez por semana (ou de 15 em 15 dias), o vosso sistema faz as transferências automáticas:
   - Envia a parte do restaurante (os 15€ menos a vossa comissão).
   - Envia a parte do estafeta (os 3€ da taxa de entrega).
   - O que sobra fica na vossa conta bancária (o vosso lucro bruto).

**Hoje no código:** checkout **WhatsApp** (`wa.me/351931430970`) e pedidos API sem captura de pagamento.

---

## PONTO 3: A Matemática do Lucro (Business Model)

Como é que a EatHalal ganha dinheiro para pagar os custos e gerar lucro? Existem **3 fontes de receita principais**:

**Comissão sobre a Comida (A maior fatia):** Vocês cobram uma percentagem a cada restaurante por cada venda feita na app. No mercado, isto ronda os **15% a 30%**. Se cobrarem **20%**, num pedido de 15€ de comida, **3,00€** ficam para a EatHalal.

**Taxa de Serviço ao Cliente:** Uma taxa fixa (ex: 0,80€ ou 1,50€) cobrada ao cliente por cada pedido para ajudar a manter os custos do sistema.

**Margem na Taxa de Entrega (Opcional):** O cliente paga uma taxa de entrega (ex: 3,50€). Vocês podem passar 3,00€ para o estafeta e reter 0,50€, ou passar os 100% para o estafeta para o motivar (como sugerimos no flyer) e lucrar apenas nas duas taxas anteriores.

---

## PONTO 4: Custos Iniciais (O que tens de comprar e gastar?)

Para começares o negócio no terreno de forma enxuta (lean), sem desperdiçar dinheiro, o vosso foco de investimento deve ser este:

**1. Custos de Tecnologia e Infraestrutura (Essencial)**

- **Alojamento do Site/App:** Servidores (como AWS, Firebase ou Heroku). No início, com poucos utilizadores, o custo é muito baixo ou quase gratuito, mas vai subindo à medida que tiverem milhares de acessos.
- **Licenças de Developer:** Cerca de 99$/ano para a Apple App Store e 25$ (taxa única) para a Google Play Store.
- **APIs de Mapas:** O Google Maps cobra por cada vez que o mapa é carregado ou uma rota é calculada. Eles dão um crédito gratuito mensal substancial, mas é um custo a prever quando o negócio crescer.

**2. Custos de Operação e Marketing (Para arrancar no Porto)**

- **Equipamento para os Estafetas:** Para o arranque, vale a pena investir na compra de **5 a 10 mochilas térmicas verdes com o logo da EatHalal** para dar aos primeiros estafetas. Isto garante a qualidade da comida e funciona como publicidade gratuita nas ruas do Porto.
- **Material Promocional:** Impressão dos flyers de recrutamento de estafetas e autocolantes com QR Code para colocar nas portas dos restaurantes parceiros.
- **Marketing Digital:** Pequenos anúncios focados no Instagram/Facebook localizados estritamente na região geográfica do Porto para atrair os primeiros inscritos na Waitlist.

**3. Custos Legais (Constituição da Empresa)**

- **Criar a Empresa (Lda):** Em Portugal, podes fazer isto através da "Empresa na Hora". O custo do registo comercial ronda os 360€. Precisas também de prever o custo de um **Contabilista Certificado** (obrigatório para empresas), que tratará da faturação e impostos mensais.

---

## PONTO 5: O Passo a Passo Cronológico para Começar

Para não te sentires sobrecarregado, divide o teu trabalho em 3 fases bem definidas:

**Fase Atual (Waitlist):** Gasto quase zero. O objetivo é apenas pôr o site online com a lista de espera e testar o interesse do mercado do Porto. Se tiverem 500 pessoas inscritas em poucas semanas, sabem que o negócio vai dar dinheiro.

**Fase de Preparação:** Enquanto a app é aprovada na Apple e Google, vocês vão à rua fechar os primeiros 3 a 5 restaurantes e compram as primeiras mochilas para os estafetas que se inscreveram.

**Fase de Lançamento (Go-Live):** Ativam-se os pagamentos na Stripe, avisa-se toda a gente da lista por e-mail/WhatsApp e começam as entregas oficiais.

---

## Referência técnica (equipa dev)

| O quê | URL / ficheiro |
| --- | --- |
| Site live | https://halall-dm79.onrender.com |
| Waitlist cliente | https://halall-dm79.onrender.com/waitlist.html |
| Admin | https://halall-dm79.onrender.com/admin/ |
| Merchant | https://halall-dm79.onrender.com/partners.html |
| Rider | https://halall-dm79.onrender.com/rider/index.html |
| API health | https://halall-dm79.onrender.com/api/v1/health |
| Checklist operador | `OPERATOR-CHECKLIST.txt` |
| Teste automático | `npm run test:e2e` |
