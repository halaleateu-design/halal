/**
 * UI copy for GO web shell (static). Production apps should load from CMS + professional translation.
 * Arabic sets document direction to RTL for layout testing.
 */
(function () {
  const STORAGE_KEY = "halaleat_lang";

  const STRINGS = {
    en: {
      nav_categories: "Categories",
      nav_menu: "Menu",
      nav_order: "Order",
      nav_sell: "Sell",
      nav_riders: "Riders",
      nav_orders: "Orders",
      nav_track: "Track order",
      nav_guest: "Continue as guest",
      nav_signup: "Sign up",
      nav_signin: "Sign in",
      nav_login: "Log in",
      auth_choice_title: "How would you like to continue?",
      auth_choice_lead:
        "Continue on GO (EU): sign in, create an account, or browse as a guest. Verification and “set password” emails will only come from our official GO domain once mail is live. Business: halaleateu@gmail.com",
      menu_view: "View menu",
      menu_all_cat: "All categories",
      menu_sell: "Sell on GO",
      menu_rider: "Rider waitlist",
      menu_whatsapp: "WhatsApp order",
      hero_tag: "Halal-only · One platform",
      hero_line1: "Order halal delivery",
      hero_line2: "near you",
      hero_lead:
        "Restaurants, groceries, butcher, halal food, snacks, and bakery — verified partners on one page. Search the menu or pick a category below.",
      search_placeholder: "Search dishes or area…",
      delivery_now: "Deliver now",
      delivery_schedule: "Schedule (soon)",
      find_food: "Find food",
      or_whatsapp: "Or message us on WhatsApp",
      browse_menu: "Browse menu",
      explore_cat: "Explore categories",
      trust_line:
        "Halal-only partners · Fresh handoffs · Order in seconds — checkout & instant payouts ship with the full GO app.",
      vertical_title: "What do you need today?",
      vertical_sub:
        "Everything on one homepage — tap a category. Restaurant menu is live now; other aisles open as partners join.",
      restaurants_near: "Halal near you",
      restaurants_sub:
        "Browse aisles and kitchen lines — only matching halal dishes stay on screen. Tap a card for the full plate. Cart, payments, and live courier tracking are planned in the GO Android & iOS apps after the web experience ships.",
      menu_world_hint:
        "Halal food for every Muslim — pick an aisle, then a kitchen line. Pizza &amp; boxes stay on their own row.",
      eu_brand_tagline: "Halal eat EU",
      eu_values_line:
        "This marketplace follows Islamic operating principles on what we list: alcohol, gambling, and plainly non-halal categories are not allowed. Partners certify halal sourcing for the food they publish.",
      halal_policy_heading: "Halal policy & trust",
      halal_policy_intro:
        "Short answers reduce ambiguity — scope tightens as each EU market goes fully live.",
      halal_faq_q: "What is our halal operating policy?",
      halal_faq_a:
        "We route discovery to verified halal partners only. We do not promote alcohol, gambling, tobacco, adult, or other forbidden storefront categories in this product shell.",
      halal_scope_faq_q: "What does halal mean for GO?",
      halal_scope_faq_a:
        "For food it is evidence-backed halal supply and preparation, documented on partner profiles — not the word alone. Finance-style halal (for example riba-free BNPL) appears only if we publish a licensed product per market.",
      trust_company_html:
        "<strong>GO</strong> — Porto pilot. <strong>Business:</strong> <a href=\"mailto:halaleateu@gmail.com\">halaleateu@gmail.com</a> · Partner cards still show <strong>WhatsApp</strong> for live orders until a central desk opens.",
      trust_refunds_html:
        "Refunds today follow what you agree with the partner over WhatsApp; with logged-in checkout, refunds and data use move to the published EU consumer &amp; GDPR pack.",
      trust_signals_title: "Trust signals",
      footer_business_html:
        '<div class="ue-business-mail"><span class="ue-business-mail__kicker">HalalEat EU — business</span><a class="ue-business-mail__email" href="mailto:halaleateu@gmail.com">halaleateu@gmail.com</a><p class="ue-business-mail__hint">Partners, riders, merchants, press &amp; general enquiries.</p></div>',
      drawer_menu_title: "Menu",
      drawer_login: "Log in",
      drawer_business: "Create a business account",
      drawer_restaurant: "Add your restaurant",
      drawer_deliver: "Sign up to deliver",
      drawer_app_line: "There's more to love in the GO app — coming soon.",
      drawer_app_iphone: "iPhone",
      drawer_app_android: "Android",
      footer_links_title: "Explore",
      footer_partner_title: "Partners & riders",
      lang_label: "Language",
      location_aria: "Choose delivery country & city",
      location_btn: "Set location",
      location_dialog_title: "Delivery region (EU)",
      location_country: "Country",
      location_city: "City / area",
      location_save: "Save",
      location_cancel: "Cancel",
      eu_bar_badge:
        "GO is built for the EU — GDPR & consumer rules first · Portugal (Porto) pilot, then more Member States.",
      footer_sub: "Verified halal partners · Porto pilot · EU rollout",
      footer_hours: "Open daily · Partner hours may vary",
      footer_whatsapp_aria: "Order on WhatsApp with GO partner",
      dock_home: "Home",
      dock_browse: "Browse",
      dock_orders: "Orders",
      dock_help: "Help",
      maps_heading: "Find us on Google Maps",
      maps_lead:
        "GO is launching from Porto, Portugal. Open directions in Google Maps or list your halal business when you join as a partner.",
      maps_open_btn: "Open in Google Maps",
      maps_list_btn: "Partner with GO",
      footer_social_html:
        '<nav class="ue-social-row" aria-label="Social media"><a class="ue-social-pill ue-social-pill--ig" href="https://www.instagram.com/eathalaleu/" target="_blank" rel="noopener noreferrer">Instagram @eathalaleu</a><a class="ue-social-pill ue-social-pill--tt" href="https://www.tiktok.com/@eathalaleu" target="_blank" rel="noopener noreferrer">TikTok @eathalaleu</a></nav>',
      shell_item_back: "← Back to menu",
      shell_item_chef: "Chef Pick",
      shell_item_partner: "GO · partner dish",
      shell_item_loading: "Loading item…",
      shell_item_delivery: "Delivery: 25-35 min",
      shell_item_fresh: "Freshly Prepared",
      shell_item_home: "Home Delivery Only",
      shell_item_included: "What's Included",
      shell_item_whatsapp: "Order on WhatsApp",
      shell_item_not_found: "Item not found",
      shell_item_not_found_hint: "Please go back and select a menu item.",
      shell_item_price: "Price: EUR {price}",
      shell_cat_back: "← Back to order",
      shell_cat_title: "Category Items",
      shell_cat_subtitle: "Pick multiple items from {group} and place one combined order.",
      shell_cat_bulk_empty: "No item selected yet.",
      shell_cat_bulk_summary: "{count} items selected • Total: {total}",
      shell_cat_add_item: "Add this item",
      shell_cat_order_btn: "Order Selected Items",
      shell_riders_h1_before: "Courier tools live on",
      shell_riders_p1:
        "This page is a friendly pointer for old links. Opening the folder from disk? Use <strong>rider/index.html</strong> — <code>rider/</code> alone shows a file listing in some browsers.",
      shell_riders_btn_panel: "Go to rider panel",
      shell_riders_btn_menu: "Order food instead",
      shell_riders_p2:
        "Bookmark <strong>rider/index.html</strong> (on a server, <strong>/rider/</strong> still resolves to the same page) separately from the customer app — same brand, different product surface.",
      shell_riders_open: "Open rider panel",
      shell_riders_brand: "Riders",
      shell_riders_nav_home: "Home",
      shell_riders_nav_sell: "Sell",
      shell_riders_footer_home: "← Home",
      auth_tag_customer: "Customer",
      auth_tag_create: "Create account",
      auth_nav_home: "Home",
      auth_nav_menu: "Menu",
      auth_nav_signup: "Sign up",
      auth_nav_signin: "Sign in",
      auth_guest: "Continue as guest",
      auth_signin_title: "Sign in",
      auth_signin_lead_html:
        "Access saved carts, reorder favourites, and rider-tracked deliveries when the account service is connected.",
      auth_email: "Email",
      auth_password: "Password",
      auth_forgot_html: "<a href=\"#\">Forgot password</a> <span aria-hidden=\"true\">·</span> OTP login ships with app",
      auth_submit_signin: "Sign in",
      auth_foot_new_html: "New here? <a href=\"signup.html\">Create an account</a>",
      auth_aside_login_title: "Without login",
      auth_aside_login_body_html:
        "Use <strong>Find food</strong> on the home page, pick dishes, and complete checkout on WhatsApp — same halal partner, no account required.",
      auth_aside_login_btn: "Order as guest",
      auth_footer_signin_html:
        "Secure sign-in is on the way. Until then, order as a guest from the home page. When email login is enabled, verification and password-reset messages will come only from official HalalEat EU addresses — we never ask for your card by email. <strong>Business:</strong> <a href=\"mailto:halaleateu@gmail.com\">halaleateu@gmail.com</a>",
      auth_signup_title: "Sign up",
      auth_signup_lead_html:
        "Save addresses, track orders, and sync across web &amp; app when accounts go live. This page is a <strong>UX prototype</strong> — no password is stored yet.",
      auth_name: "Full name",
      auth_phone: "Mobile",
      auth_pass: "Password",
      auth_terms_html:
        "I accept the <a href=\"index.html#\">Terms of use &amp; privacy (draft)</a> — final legal pack ships before public accounts.",
      auth_submit_create: "Create account",
      auth_foot_have_html: "Already registered? <a href=\"signin.html\">Sign in</a>",
      auth_aside_guest_title: "Guest flow",
      auth_aside_guest_body:
        "You can browse menus and order via WhatsApp without an account. Sign up only when you want saved details and order history in one place.",
      auth_aside_guest_btn: "Browse as guest",
      auth_footer_signup_html:
        "Secure accounts with email verification are on the way. Until then, order as a guest from the home page — same halal partners, WhatsApp checkout. Sign-up confirmations will be branded HalalEat EU only. <strong>Business:</strong> <a href=\"mailto:halaleateu@gmail.com\">halaleateu@gmail.com</a>",
    },
    pt: {
      nav_categories: "Categorias",
      nav_menu: "Menu",
      nav_order: "Encomendar",
      nav_sell: "Vender",
      nav_riders: "Estafetas",
      nav_orders: "Pedidos",
      nav_track: "Seguir encomenda",
      nav_signup: "Registar",
      nav_signin: "Entrar",
      nav_login: "Iniciar sessão",
      auth_choice_title: "Como pretende continuar?",
      auth_choice_lead:
        "Continue na GO (UE): entre, crie conta ou navegue como visitante. Emails de verificação e definição de palavra-passe virão só do nosso domínio oficial GO quando o correio estiver ativo. Negócios: halaleateu@gmail.com",
      menu_view: "Ver menu",
      menu_all_cat: "Todas as categorias",
      menu_sell: "Vender na GO",
      menu_rider: "Lista de estafetas",
      menu_whatsapp: "Encomendar WhatsApp",
      hero_tag: "Apenas halal · Uma plataforma",
      hero_line1: "Encomende comida halal",
      hero_line2: "perto de si",
      hero_lead:
        "Restaurantes, mercearias, talho, snacks e padaria halal — parceiros verificados numa página. Pesquise o menu ou escolha uma categoria.",
      search_placeholder: "Pesquisar pratos ou zona…",
      delivery_now: "Entregar já",
      delivery_schedule: "Agendar (em breve)",
      find_food: "Encontrar comida",
      or_whatsapp: "Ou envie mensagem no WhatsApp",
      browse_menu: "Ver menu",
      explore_cat: "Explorar categorias",
      trust_line:
        "Parceiros só halal · Entregas cuidadas · Checkout e pagamentos instantâneos na app completa.",
      vertical_title: "O que precisa hoje?",
      vertical_sub: "Tudo na mesma página — toque numa categoria. O menu de restaurante está ativo.",
      restaurants_near: "Halal perto de si",
      restaurants_sub:
        "Navegue por corredores e linhas de cozinha — só ficam pratos halal compatíveis no ecrã. Toque num cartão para o prato completo. Carrinho, pagamentos e tracking em tempo real estão planeados nas apps Android e iOS GO depois da experiência web.",
      menu_world_hint:
        "Comida halal para todos os muçulmanos — escolha um corredor e depois uma linha de cozinha. Pizza e menus caixa ficam noutra fila.",
      eu_brand_tagline: "Halal eat EU",
      eu_values_line:
        "Este mercado segue princípios islâmicos no que listamos: álcool, jogos de azar e categorias claramente não halal não são permitidos. Os parceiros certificam a origem halal da comida que publicam.",
      halal_policy_heading: "Política halal e confiança",
      halal_policy_intro:
        "Respostas curtas reduzem ambiguidade — o âmbito aperta à medida que cada mercado UE fica totalmente ativo.",
      halal_faq_q: "Qual é a nossa política halal?",
      halal_faq_a:
        "Encaminhamos a descoberta só para parceiros halal verificados. Não promovemos álcool, jogos, tabaco, conteúdo adulto ou outras vitrines proibidas neste produto.",
      halal_scope_faq_q: "O que significa halal na GO?",
      halal_scope_faq_a:
        "Para comida, significa cadeia e preparação halal com evidência no perfil do parceiro — não só a palavra. Finanças estilo halal (ex. BNPL sem riba) só se publicarmos produto licenciado por mercado.",
      trust_company_html:
        "<strong>GO</strong> — piloto no Porto. <strong>Negócios:</strong> <a href=\"mailto:halaleateu@gmail.com\">halaleateu@gmail.com</a> · Os cartões de parceiro mantêm <strong>WhatsApp</strong> para encomendas até haver suporte central.",
      trust_refunds_html:
        "Reembolsos hoje seguem o que acordar com o parceiro no WhatsApp; com checkout com sessão, reembolsos e dados passam para o pack RGPD/consumidor publicado por Estado-Membro.",
      trust_signals_title: "Sinais de confiança",
      footer_business_html:
        '<div class="ue-business-mail"><span class="ue-business-mail__kicker">GO UE — negócios</span><a class="ue-business-mail__email" href="mailto:halaleateu@gmail.com">halaleateu@gmail.com</a><p class="ue-business-mail__hint">Parceiros, estafetas, comerciantes, imprensa e contactos gerais.</p></div>',
      drawer_menu_title: "Menu",
      drawer_login: "Iniciar sessão",
      drawer_business: "Criar conta empresarial",
      drawer_restaurant: "Adicionar o seu restaurante",
      drawer_deliver: "Registar-se para entregar",
      drawer_app_line: "Há mais para descobrir na app GO — em breve.",
      drawer_app_iphone: "iPhone",
      drawer_app_android: "Android",
      footer_links_title: "Explorar",
      footer_partner_title: "Parceiros e estafetas",
      lang_label: "Idioma",
      location_aria: "País e cidade de entrega",
      location_btn: "Guardar local",
      location_dialog_title: "Região de entrega (UE)",
      location_country: "País",
      location_city: "Cidade / zona",
      location_save: "Guardar",
      location_cancel: "Cancelar",
      eu_bar_badge:
        "GO para a UE — RGPD e direito do consumidor em primeiro lugar · Piloto em Portugal (Porto), depois mais Estados-Membros.",
      footer_sub: "Parceiros halal verificados · Piloto no Porto · Expansão na UE",
      footer_hours: "Aberto todos os dias · Horários dos parceiros podem variar",
      footer_whatsapp_aria: "Encomendar no WhatsApp com parceiro GO",
      dock_home: "Início",
      dock_browse: "Explorar",
      dock_orders: "Pedidos",
      dock_help: "Ajuda",
      maps_heading: "Encontre-nos no Google Maps",
      maps_lead:
        "A GO arranca no Porto, Portugal. Abra direções no Google Maps ou junte-se como parceiro halal.",
      maps_open_btn: "Abrir no Google Maps",
      maps_list_btn: "Ser parceiro GO",
      footer_social_html:
        '<nav class="ue-social-row" aria-label="Redes sociais"><a class="ue-social-pill ue-social-pill--ig" href="https://www.instagram.com/eathalaleu/" target="_blank" rel="noopener noreferrer">Instagram @eathalaleu</a><a class="ue-social-pill ue-social-pill--tt" href="https://www.tiktok.com/@eathalaleu" target="_blank" rel="noopener noreferrer">TikTok @eathalaleu</a></nav>',
      shell_item_back: "← Voltar ao menu",
      shell_item_chef: "Escolha do chef",
      shell_item_partner: "GO · prato de parceiro",
      shell_item_loading: "A carregar…",
      shell_item_delivery: "Entrega: 25-35 min",
      shell_item_fresh: "Preparado na hora",
      shell_item_home: "Só entrega ao domicílio",
      shell_item_included: "O que inclui",
      shell_item_whatsapp: "Encomendar no WhatsApp",
      shell_item_not_found: "Artigo não encontrado",
      shell_item_not_found_hint: "Volte atrás e escolha um prato no menu.",
      shell_item_price: "Preço: EUR {price}",
      shell_cat_back: "← Voltar à encomenda",
      shell_cat_title: "Artigos da categoria",
      shell_cat_subtitle: "Escolha vários itens de {group} e faça uma encomenda conjunta.",
      shell_cat_bulk_empty: "Ainda sem itens selecionados.",
      shell_cat_bulk_summary: "{count} itens • Total: {total}",
      shell_cat_add_item: "Adicionar este item",
      shell_cat_order_btn: "Encomendar itens selecionados",
      shell_riders_h1_before: "Ferramentas de estafeta em",
      shell_riders_p1:
        "Esta página ajuda ligações antigas. Ao abrir a pasta no disco? Use <strong>rider/index.html</strong> — <code>rider/</code> sozinho pode mostrar listagem no browser.",
      shell_riders_btn_panel: "Ir ao painel de estafetas",
      shell_riders_btn_menu: "Encomendar comida",
      shell_riders_p2:
        "Guarde <strong>rider/index.html</strong> (no servidor, <strong>/rider/</strong> aponta para a mesma página) à parte da app de cliente — mesma marca, outro produto.",
      shell_riders_open: "Abrir painel de estafetas",
      shell_riders_brand: "Estafetas",
      shell_riders_nav_home: "Início",
      shell_riders_nav_sell: "Vender",
      shell_riders_footer_home: "← Início",
      auth_tag_customer: "Cliente",
      auth_tag_create: "Criar conta",
      auth_nav_home: "Início",
      auth_nav_menu: "Menu",
      auth_nav_signup: "Registar",
      auth_nav_signin: "Entrar",
      auth_guest: "Continuar como visitante",
      auth_signin_title: "Entrar",
      auth_signin_lead_html:
        "Aceda a carrinhos guardados, refaça favoritos e acompanhe entregas com estafeta quando o serviço de contas estiver ligado.",
      auth_email: "Email",
      auth_password: "Palavra-passe",
      auth_forgot_html: "<a href=\"#\">Esqueci a palavra-passe</a> <span aria-hidden=\"true\">·</span> OTP na app (em breve)",
      auth_submit_signin: "Entrar",
      auth_foot_new_html: "Novo aqui? <a href=\"signup.html\">Criar conta</a>",
      auth_aside_login_title: "Sem login",
      auth_aside_login_body_html:
        "Use <strong>Encontrar comida</strong> na página inicial, escolha pratos e finalize no WhatsApp — mesmo parceiro halal, sem conta.",
      auth_aside_login_btn: "Encomendar como visitante",
      auth_footer_signin_html:
        "Login seguro a caminho. Por agora, encomende como visitante na página inicial. Quando o email estiver ativo, verificação e reposição de palavra-passe virão só de endereços oficiais GO UE — nunca pedimos cartão por email. <strong>Negócios:</strong> <a href=\"mailto:halaleateu@gmail.com\">halaleateu@gmail.com</a>",
      auth_signup_title: "Registar",
      auth_signup_lead_html:
        "Guarde moradas, siga pedidos e sincronize web e app quando as contas estiverem ativas. Isto é um <strong>protótipo UX</strong> — ainda não guardamos palavras-passe.",
      auth_name: "Nome completo",
      auth_phone: "Telemóvel",
      auth_pass: "Palavra-passe",
      auth_terms_html:
        "Aceito os <a href=\"index.html#\">Termos e privacidade (rascunho)</a> — pacote legal final antes de contas públicas.",
      auth_submit_create: "Criar conta",
      auth_foot_have_html: "Já tem conta? <a href=\"signin.html\">Entrar</a>",
      auth_aside_guest_title: "Fluxo visitante",
      auth_aside_guest_body:
        "Pode ver menus e encomendar por WhatsApp sem conta. Registe-se só quando quiser dados guardados e histórico num só sítio.",
      auth_aside_guest_btn: "Explorar como visitante",
      auth_footer_signup_html:
        "Contas com verificação por email a caminho. Por agora, encomende como visitante na página inicial — mesmos parceiros halal, checkout WhatsApp. Confirmações de registo serão só da marca GO UE. <strong>Negócios:</strong> <a href=\"mailto:halaleateu@gmail.com\">halaleateu@gmail.com</a>",
    },
    ur: {
      nav_categories: "اقسام",
      nav_menu: "مینو",
      nav_order: "آرڈر",
      nav_sell: "فروخت",
      nav_riders: "رائیڈر",
      nav_orders: "آرڈرز",
      nav_guest: "بغیر لاگ ان",
      nav_signup: "سائن اپ",
      nav_signin: "سائن ان",
      menu_view: "مینو دیکھیں",
      menu_all_cat: "تمام اقسام",
      menu_sell: "GO پر بیچیں",
      menu_rider: "رائیڈر لسٹ",
      menu_whatsapp: "واٹس ایپ آرڈر",
      hero_tag: "صرف حلال · ایک پلیٹ فارم",
      hero_line1: "حلال ڈلیوری",
      hero_line2: "اپنے قریب",
      hero_lead:
        "ریسٹورنٹ، گروسری، قصائی، سنیکس اور بیکری — تصدیق شدہ پارٹنرز۔ مینو تلاش کریں یا ذیل میں قسم چنیں۔",
      search_placeholder: "ڈش یا علاقہ تلاش…",
      delivery_now: "ابھی ڈلیور",
      delivery_schedule: "شیڈول (جلد)",
      find_food: "کھانا تلاش",
      or_whatsapp: "یا واٹس ایپ پر پیغام",
      browse_menu: "مینو براؤز",
      explore_cat: "اقسام دیکھیں",
      trust_line: "صرف حلال پارٹنرز · تیز آرڈر · مکمل ایپ میں چیک آؤٹ اور ادائیگیاں۔",
      vertical_title: "آج کیا چاہیے؟",
      vertical_sub: "ایک صفحے پر سب — قسم پر ٹیپ کریں۔ ریسٹورنٹ مینو ابھی فعال ہے۔",
      restaurants_near: "قریبی ریسٹورنٹ",
      restaurants_sub:
        "پہلے کورidor، پھر کچن کی قسم — صرف میل کھانے والے کارڈز۔ تفصیل کے لیے کارڈ پر ٹیپ کریں۔",
      menu_world_hint:
        "ہر مسلمان کے لیے حلال کھانا — پہلے عالمی راہ، پھر لائن۔ پیزا اور باکس الگ قطار میں۔",
      drawer_menu_title: "مینو",
      lang_label: "زبان",
      location_aria: "ملک اور شہر",
      location_btn: "محفوظ کریں",
      location_dialog_title: "ڈیلیوری علاقہ (یورپی یونین)",
      location_country: "ملک",
      location_city: "شہر",
      location_save: "محفوظ",
      location_cancel: "بند",
      eu_bar_badge:
        "GO یورپی یونین کے لیے — GDPR اور صارف حقوق اولین · پرتگال (پورٹو) پائلٹ، پھر مزید رکن ممالک۔",
      footer_sub: "تصدیق شدہ حلال پارٹنرز · پورٹو پائلٹ · یورپ میں پھیلاؤ",
      footer_hours: "روزانہ کھلا · پارٹنر اوقات مختلف ہو سکتے ہیں",
      footer_whatsapp_aria: "GO پارٹنر کے ذریعے واٹس ایپ آرڈر",
      dock_home: "ہوم",
      dock_browse: "براؤز",
      dock_orders: "آرڈرز",
      dock_help: "مدد",
    },
    fr: {
      nav_categories: "Catégories",
      nav_menu: "Menu",
      nav_order: "Commander",
      nav_sell: "Vendre",
      nav_riders: "Livreurs",
      nav_orders: "Commandes",
      nav_guest: "Continuer en invité",
      nav_signup: "S'inscrire",
      nav_signin: "Connexion",
      menu_view: "Voir le menu",
      menu_all_cat: "Toutes les catégories",
      menu_sell: "Vendre sur GO",
      menu_rider: "Liste livreurs",
      menu_whatsapp: "Commander WhatsApp",
      hero_tag: "Halal uniquement · Une plateforme",
      hero_line1: "Commandez halal",
      hero_line2: "près de vous",
      hero_lead:
        "Restaurants, courses, boucherie, snacks et boulangerie — partenaires vérifiés. Recherchez le menu ou choisissez une catégorie.",
      search_placeholder: "Rechercher un plat ou une zone…",
      delivery_now: "Livrer maintenant",
      delivery_schedule: "Planifier (bientôt)",
      find_food: "Trouver à manger",
      or_whatsapp: "Ou message WhatsApp",
      browse_menu: "Parcourir le menu",
      explore_cat: "Explorer les catégories",
      trust_line:
        "Partenaires halal · Remises soignées · Paiement et checkout dans l'app complète.",
      vertical_title: "De quoi avez-vous besoin ?",
      vertical_sub: "Tout sur une page — touchez une catégorie. Menu restaurant déjà en ligne.",
      restaurants_near: "Restaurants près de vous",
      restaurants_sub:
        "Choisissez un rayon puis une cuisine. Touchez une fiche pour les détails.",
      menu_world_hint:
        "Halal pour chaque musulman — choisissez l’allée puis la ligne. Pizza et menus coffret à part.",
      drawer_menu_title: "Menu",
      lang_label: "Langue",
      location_aria: "Pays et ville",
      location_btn: "Enregistrer",
      location_dialog_title: "Zone de livraison (UE)",
      location_country: "Pays",
      location_city: "Ville / zone",
      location_save: "Enregistrer",
      location_cancel: "Annuler",
      eu_bar_badge:
        "GO pour l’UE — RGPD et droit des consommateurs d’abord · Pilote Portugal (Porto), puis autres États membres.",
      footer_sub: "Partenaires halal vérifiés · Pilote à Porto · Déploiement UE",
      footer_hours: "Ouvert tous les jours · Horaires partenaires variables",
      footer_whatsapp_aria: "Commander sur WhatsApp avec un partenaire GO",
      dock_home: "Accueil",
      dock_browse: "Parcourir",
      dock_orders: "Commandes",
      dock_help: "Aide",
    },
    ar: {
      nav_categories: "الفئات",
      nav_menu: "القائمة",
      nav_order: "اطلب",
      nav_sell: "بيع",
      nav_riders: "السائقون",
      nav_orders: "الطلبات",
      nav_guest: "متابعة كضيف",
      nav_signup: "تسجيل",
      nav_signin: "دخول",
      menu_view: "عرض القائمة",
      menu_all_cat: "كل الفئات",
      menu_sell: "البيع على GO",
      menu_rider: "قائمة انتظار السائقين",
      menu_whatsapp: "طلب واتساب",
      hero_tag: "حلال فقط · منصة واحدة",
      hero_line1: "اطلب توصيل حلال",
      hero_line2: "بالقرب منك",
      hero_lead:
        "مطاعم وبقالة وجزار ومقبلات ومخبز — شركاء موثوقون. ابحث في القائمة أو اختر فئة.",
      search_placeholder: "ابحث عن طبق أو منطقة…",
      delivery_now: "توصيل الآن",
      delivery_schedule: "جدولة (قريباً)",
      find_food: "ابحث عن الطعام",
      or_whatsapp: "أو راسلنا على واتساب",
      browse_menu: "تصفح القائمة",
      explore_cat: "استكشف الفئات",
      trust_line: "شركاء حلال فقط · تسليم آمن · الدفع في التطبيق الكامل.",
      vertical_title: "ماذا تحتاج اليوم؟",
      vertical_sub: "كل شيء في صفحة واحدة — اضغط على فئة. قائمة المطاعم جاهزة.",
      restaurants_near: "مطاعم بالقرب منك",
      restaurants_sub: "اختر الممر ثم نوع المطبخ. اضغط على البطاقة للتفاصيل.",
      menu_world_hint:
        "طعام حلال لكل مسلم — اختر الممر ثم الخط. البيتزا والوجبات في صف منفصل.",
      drawer_menu_title: "القائمة",
      lang_label: "اللغة",
      location_aria: "البلد والمدينة",
      location_btn: "حفظ",
      location_dialog_title: "منطقة التوصيل (الاتحاد الأوروبي)",
      location_country: "الدولة",
      location_city: "المدينة",
      location_save: "حفظ",
      location_cancel: "إلغاء",
      eu_bar_badge:
        "GO للاتحاد الأوروبي — GDPR وحقوق المستهلك أولاً · تجربة في البرتغال (بورتو) ثم دول أخرى.",
      footer_sub: "شركاء حلال موثوقون · بورتو · التوسع في أوروبا",
      footer_hours: "مفتوح يومياً · ساعات الشركاء قد تختلف",
      footer_whatsapp_aria: "اطلب عبر واتساب مع شريك GO",
      dock_home: "الرئيسية",
      dock_browse: "تصفح",
      dock_orders: "الطلبات",
      dock_help: "مساعدة",
    },
    bn: {
      nav_categories: "ক্যাটাগরি",
      nav_menu: "মেনু",
      nav_order: "অর্ডার",
      nav_sell: "বিক্রি",
      nav_riders: "রাইডার",
      nav_orders: "অর্ডারসমূহ",
      nav_guest: "লগইন ছাড়াই",
      nav_signup: "সাইন আপ",
      nav_signin: "সাইন ইন",
      menu_view: "মেনু দেখুন",
      menu_all_cat: "সব ক্যাটাগরি",
      menu_sell: "GO-এ বিক্রি",
      menu_rider: "রাইডার তালিকা",
      menu_whatsapp: "হোয়াটসঅ্যাপ অর্ডার",
      hero_tag: "শুধু হালাল · এক প্ল্যাটফর্ম",
      hero_line1: "হালাল ডেলিভারি",
      hero_line2: "আপনার কাছে",
      hero_lead:
        "রেস্টুরেন্ট, মুদি, কসাই, স্ন্যাকস ও বেকারি — যাচাইকৃত পার্টনার। মেনু খুঁজুন বা ক্যাটাগরি বেছে নিন।",
      search_placeholder: "খাবার বা এলাকা খুঁজুন…",
      delivery_now: "এখন ডেলিভার",
      delivery_schedule: "সময়সূচি (শীঘ্রই)",
      find_food: "খাবার খুঁজুন",
      or_whatsapp: "অথবা হোয়াটসঅ্যাপ",
      browse_menu: "মেনু ব্রাউজ",
      explore_cat: "ক্যাটাগরি দেখুন",
      trust_line: "শুধু হালাল পার্টনার · দ্রুত অর্ডার · সম্পূর্ণ অ্যাপে পেমেন্ট।",
      vertical_title: "আজ কী চান?",
      vertical_sub: "এক পাতায় সব — ক্যাটাগরিতে ট্যাপ করুন। রেস্টুরেন্ট মেনু লাইভ।",
      restaurants_near: "কাছের রেস্টুরেন্ট",
      restaurants_sub: "প্রথম করিডর, তারপর রান্নার ধরন — মিলিয়ে কার্ড দেখান।",
      menu_world_hint:
        "প্রত্যেক মুসলমানের জন্য হালাল খাবার — প্রথম বিশ্ব পথ, তারপর লাইন। পিজ্জা ও বক্স আলাদা সারিতে।",
      drawer_menu_title: "মেনু",
      lang_label: "ভাষা",
      location_aria: "দেশ ও শহর",
      location_btn: "সংরক্ষণ",
      location_dialog_title: "ডেলিভারি অঞ্চল (ইইউ)",
      location_country: "দেশ",
      location_city: "শহর",
      location_save: "সংরক্ষণ",
      location_cancel: "বাতিল",
      eu_bar_badge:
        "GO ইইউর জন্য — GDPR ও ভোক্তা অধিকার আগে · পর্তুগাল (পোর্টো) পাইলট, তারপর আরও সদস্য রাষ্ট্র।",
      footer_sub: "যাচাইকৃত হালাল পার্টনার · পোর্টো পাইলট · ইইউ সম্প্রসারণ",
      footer_hours: "প্রতিদিন খোলা · পার্টনারের সময় ভিন্ন হতে পারে",
      footer_whatsapp_aria: "GO পার্টনারের মাধ্যমে হোয়াটসঅ্যাপ অর্ডার",
      dock_home: "হোম",
      dock_browse: "ব্রাউজ",
      dock_orders: "অর্ডার",
      dock_help: "সাহায্য",
    },
  };

  function cloneEnStrings() {
    return JSON.parse(JSON.stringify(STRINGS.en));
  }

  STRINGS.de = Object.assign(cloneEnStrings(), {
    drawer_menu_title: "Menü",
    nav_categories: "Kategorien",
    nav_menu: "Menü",
    nav_order: "Bestellen",
    nav_sell: "Verkaufen",
    nav_riders: "Fahrer",
    nav_orders: "Bestellungen",
    nav_guest: "Als Gast fortfahren",
    nav_signup: "Registrieren",
    nav_signin: "Anmelden",
    menu_view: "Menü ansehen",
    menu_all_cat: "Alle Kategorien",
    menu_sell: "Auf GO verkaufen",
    menu_rider: "Fahrer-Warteliste",
    menu_whatsapp: "WhatsApp-Bestellung",
    hero_tag: "Nur Halal · Eine Plattform",
    hero_line1: "Halal-Lieferung bestellen",
    hero_line2: "bei Ihnen in der Nähe",
    hero_lead:
      "Restaurants, Lebensmittel, Metzgerei, Halal-Lebensmittel, Snacks und Bäckerei — geprüfte Partner auf einer Seite. Suchen Sie im Menü oder wählen Sie unten eine Kategorie.",
    search_placeholder: "Gerichte oder Ort suchen…",
    delivery_now: "Jetzt liefern",
    delivery_schedule: "Planen (bald)",
    find_food: "Essen finden",
    or_whatsapp: "Oder per WhatsApp",
    browse_menu: "Menü durchsuchen",
    explore_cat: "Kategorien entdecken",
    trust_line:
      "Nur Halal-Partner · Frische Übergaben · In Sekunden bestellen — Checkout in der vollen GO-App.",
    vertical_title: "Was brauchen Sie heute?",
    vertical_sub:
      "Alles auf einer Startseite — tippen Sie auf eine Kategorie. Das Restaurantmenü ist jetzt live.",
    restaurants_near: "Restaurants in Ihrer Nähe",
    restaurants_sub:
      "Wählen Sie einen Gang, dann eine Küche oder Box — nur passende Gerichte bleiben sichtbar. Tippen Sie auf eine Karte für Details.",
    menu_world_hint:
      "Halal-Essen für jeden Muslim — wählen Sie einen Gang, dann eine Küchenlinie. Pizza und Boxen bleiben in einer eigenen Reihe.",
    lang_label: "Sprache",
    location_aria: "Land und Stadt wählen",
    location_btn: "Ort speichern",
    location_dialog_title: "Lieferregion (EU)",
    location_country: "Land",
    location_city: "Stadt / Region",
    location_save: "Speichern",
    location_cancel: "Abbrechen",
    eu_bar_badge:
      "GO für die EU — DSGVO und Verbraucherrecht zuerst · Pilot Portugal (Porto), dann weitere Mitgliedstaaten.",
    footer_sub: "Geprüfte Halal-Partner · Porto-Pilot · EU-Rollout",
    footer_hours: "Täglich geöffnet · Partnerzeiten können abweichen",
    footer_whatsapp_aria: "Per WhatsApp beim GO-Partner bestellen",
    dock_home: "Start",
    dock_browse: "Entdecken",
    dock_orders: "Bestellungen",
    dock_help: "Hilfe",
  });

  STRINGS.tr = Object.assign(cloneEnStrings(), {
    drawer_menu_title: "Menü",
    nav_categories: "Kategoriler",
    nav_menu: "Menü",
    nav_order: "Sipariş",
    nav_sell: "Satış",
    nav_riders: "Kuryeler",
    nav_orders: "Siparişler",
    nav_guest: "Misafir olarak devam",
    nav_signup: "Kayıt ol",
    nav_signin: "Giriş yap",
    menu_view: "Menüyü gör",
    menu_all_cat: "Tüm kategoriler",
    menu_sell: "GO'te sat",
    menu_rider: "Kurye bekleme listesi",
    menu_whatsapp: "WhatsApp sipariş",
    hero_tag: "Sadece helal · Tek platform",
    hero_line1: "Helal teslimat siparişi",
    hero_line2: "size yakın",
    hero_lead:
      "Restoranlar, marketler, kasap, helal gıda, atıştırmalıklar ve fırın — doğrulanmış ortaklar tek sayfada. Menüde arayın veya aşağıdan kategori seçin.",
    search_placeholder: "Yemek veya bölge ara…",
    delivery_now: "Şimdi teslim",
    delivery_schedule: "Planla (yakında)",
    find_food: "Yemek bul",
    or_whatsapp: "Ya da WhatsApp",
    browse_menu: "Menüye göz at",
    explore_cat: "Kategorileri keşfet",
    trust_line:
      "Sadece helal ortaklar · Hızlı sipariş · Tam uygulamada ödeme ve kasa.",
    vertical_title: "Bugün neye ihtiyacınız var?",
    vertical_sub:
      "Her şey tek ana sayfada — bir kategoriye dokunun. Restoran menüsü şu an yayında.",
    restaurants_near: "Yakınınızdaki restoranlar",
    restaurants_sub:
      "Önce koridor, sonra mutfak veya kutu tipi — eşleşen yemekler ekranda kalır. Detay için karta dokunun.",
    menu_world_hint:
      "Her Müslüman için helal yemek — önce dünya koridoru, sonra mutfak hattı. Pizza ve kutular ayrı sırada.",
    lang_label: "Dil",
    location_aria: "Teslimat ülkesi ve şehri",
    location_btn: "Konumu kaydet",
    location_dialog_title: "Teslimat bölgesi (AB)",
    location_country: "Ülke",
    location_city: "Şehir / bölge",
    location_save: "Kaydet",
    location_cancel: "İptal",
    eu_bar_badge:
      "GO AB için — GDPR ve tüketici hakları önce · Portekiz (Porto) pilotu, ardından diğer üye devletler.",
    footer_sub: "Doğrulanmış helal ortaklar · Porto pilotu · AB genişlemesi",
    footer_hours: "Her gün açık · Ortak saatleri değişebilir",
    footer_whatsapp_aria: "GO ortağıyla WhatsApp’tan sipariş",
    dock_home: "Ana sayfa",
    dock_browse: "Göz at",
    dock_orders: "Siparişler",
    dock_help: "Yardım",
  });

  const EU_LANG_STUBS = [
    "it",
    "es",
    "nl",
    "pl",
    "sv",
    "da",
    "fi",
    "no",
    "is",
    "ga",
    "mt",
    "el",
    "ro",
    "bg",
    "hu",
    "cs",
    "sk",
    "hr",
    "sl",
    "lt",
    "lv",
    "et",
    "uk",
    "ru",
    "sr",
    "bs",
    "mk",
    "sq",
    "hy",
    "ka",
  ];

  EU_LANG_STUBS.forEach((code) => {
    if (!STRINGS[code]) STRINGS[code] = cloneEnStrings();
  });

  /** Merchant / partner shell (partners.html) — keyed by merch_* */
  const PARTNER = {
    en: {
      merch_nav_overview: "Overview",
      merch_nav_business: "Business",
      merch_nav_catalogue: "Catalogue",
      merch_nav_halal: "Halal",
      merch_nav_ops: "Operations",
      merch_nav_payouts: "Payouts",
      merch_nav_legal: "Contract",
      merch_nav_submit: "Submit",
      merch_brand_tag: "Merchant portal",
      merch_footer_note:
        "Merchant portal prototype — connect API + object storage for real submissions.",
      merch_top_home: "Home",
      merch_top_deliver: "Deliver",
      merch_top_order: "Order food",
      merch_menu_apply: "Start application",
      merch_menu_customer: "Customer site",
      merch_menu_catalog: "Catalogue import",
      merch_menu_riders: "Riders",
      merch_hero_kicker: "Merchant portal · prototype",
      merch_back_home: "← Home",
      merch_hero_title: "Onboard your halal business A → Z",
      merch_hero_lead:
        "One structured flow: business profile, <strong>machine-readable price list</strong> (CSV we publish), optional PDF/XLSX, halal proofs, operations, and payout readiness. Wire storage + import jobs before production — this page is UX only.",
      merch_hero_btn_profile: "Business profile",
      merch_hero_btn_catalog: "Catalogue &amp; prices",
      merch_contact_banner_html:
        '<div class="ue-business-mail ue-business-mail--compact merch-hero-mail"><span class="ue-business-mail__kicker">Business · HalalEat EU</span><a class="ue-business-mail__email" href="mailto:halaleateu@gmail.com">halaleateu@gmail.com</a><p class="ue-business-mail__hint">Merchant onboarding, partnerships &amp; press.</p></div>',
    },
    pt: {
      merch_nav_overview: "Visão geral",
      merch_nav_business: "Negócio",
      merch_nav_catalogue: "Catálogo",
      merch_nav_halal: "Halal",
      merch_nav_ops: "Operações",
      merch_nav_payouts: "Pagamentos",
      merch_nav_legal: "Contrato",
      merch_nav_submit: "Enviar",
      merch_brand_tag: "Portal do comerciante",
      merch_footer_note:
        "Protótipo do portal — ligue API e armazenamento de objetos antes de produção.",
      merch_top_home: "Início",
      merch_top_deliver: "Entregar",
      merch_top_order: "Encomendar",
      merch_menu_apply: "Iniciar candidatura",
      merch_menu_customer: "Site do cliente",
      merch_menu_catalog: "Importar catálogo",
      merch_menu_riders: "Estafetas",
      merch_hero_kicker: "Portal do comerciante · protótipo",
      merch_back_home: "← Início",
      merch_hero_title: "Integre o seu negócio halal de A a Z",
      merch_hero_lead:
        "Um fluxo estruturado: perfil empresarial, <strong>lista de preços legível por máquina</strong> (CSV que publicamos), PDF/XLSX opcional, provas halal, operações e prontidão de pagamentos. Ligue armazenamento + jobs de importação antes de produção — esta página é só UX.",
      merch_hero_btn_profile: "Perfil empresarial",
      merch_hero_btn_catalog: "Catálogo e preços",
      merch_contact_banner_html:
        '<div class="ue-business-mail ue-business-mail--compact merch-hero-mail"><span class="ue-business-mail__kicker">Negócios · GO UE</span><a class="ue-business-mail__email" href="mailto:halaleateu@gmail.com">halaleateu@gmail.com</a><p class="ue-business-mail__hint">Onboarding de lojas, parcerias e imprensa.</p></div>',
    },
    ur: {
      merch_nav_overview: "جائزہ",
      merch_nav_business: "کاروبار",
      merch_nav_catalogue: "کیٹلاگ",
      merch_nav_halal: "حلال",
      merch_nav_ops: "آپریشن",
      merch_nav_payouts: "ادائیگیاں",
      merch_nav_legal: "معاہدہ",
      merch_nav_submit: "جمع کرائیں",
      merch_brand_tag: "مرچنٹ پورٹل",
      merch_footer_note: "پروٹو ٹائپ — پروڈکشن سے پہلے API جوڑیں۔",
      merch_top_home: "ہوم",
      merch_top_deliver: "ڈلیوری",
      merch_top_order: "کھانا آرڈر",
      merch_menu_apply: "درخواست شروع",
      merch_menu_customer: "کسٹمر سائٹ",
      merch_menu_catalog: "کیٹلاگ درآمد",
      merch_menu_riders: "رائیڈر",
      merch_hero_kicker: "مرچنٹ پورٹل · پروٹو ٹائپ",
    },
    fr: {
      merch_nav_overview: "Aperçu",
      merch_nav_business: "Entreprise",
      merch_nav_catalogue: "Catalogue",
      merch_nav_halal: "Halal",
      merch_nav_ops: "Opérations",
      merch_nav_payouts: "Paiements",
      merch_nav_legal: "Contrat",
      merch_nav_submit: "Envoyer",
      merch_brand_tag: "Portail marchand",
      merch_footer_note:
        "Prototype du portail — connectez l’API et le stockage objet avant la production.",
      merch_top_home: "Accueil",
      merch_top_deliver: "Livrer",
      merch_top_order: "Commander",
      merch_menu_apply: "Démarrer la demande",
      merch_menu_customer: "Site client",
      merch_menu_catalog: "Import catalogue",
      merch_menu_riders: "Coursiers",
      merch_hero_kicker: "Portail marchand · prototype",
    },
    ar: {
      merch_nav_overview: "نظرة عامة",
      merch_nav_business: "الأعمال",
      merch_nav_catalogue: "الكتالوج",
      merch_nav_halal: "حلال",
      merch_nav_ops: "التشغيل",
      merch_nav_payouts: "المدفوعات",
      merch_nav_legal: "العقد",
      merch_nav_submit: "إرسال",
      merch_brand_tag: "بوابة التاجر",
      merch_footer_note: "نموذج أولي — اربط واجهة API والتخزين قبل الإنتاج.",
      merch_top_home: "الرئيسية",
      merch_top_deliver: "التوصيل",
      merch_top_order: "اطلب طعامًا",
      merch_menu_apply: "بدء الطلب",
      merch_menu_customer: "موقع العملاء",
      merch_menu_catalog: "استيراد الكتالوج",
      merch_menu_riders: "السائقون",
      merch_hero_kicker: "بوابة التاجر · نموذج",
    },
    bn: {
      merch_nav_overview: "সংক্ষিপ্ত",
      merch_nav_business: "ব্যবসা",
      merch_nav_catalogue: "ক্যাটালগ",
      merch_nav_halal: "হালাল",
      merch_nav_ops: "অপারেশন",
      merch_nav_payouts: "পেমেন্ট",
      merch_nav_legal: "চুক্তি",
      merch_nav_submit: "জমা দিন",
      merch_brand_tag: "মার্চেন্ট পোর্টাল",
      merch_footer_note: "প্রোটোটাইপ — প্রোডাকশনের আগে API যুক্ত করুন।",
      merch_top_home: "হোম",
      merch_top_deliver: "ডেলিভারি",
      merch_top_order: "অর্ডার খাবার",
      merch_menu_apply: "আবেদন শুরু",
      merch_menu_customer: "কাস্টমার সাইট",
      merch_menu_catalog: "ক্যাটালগ ইমপোর্ট",
      merch_menu_riders: "রাইডার",
      merch_hero_kicker: "মার্চেন্ট পোর্টাল · প্রোটোটাইপ",
    },
  };

  PARTNER.de = {
    ...PARTNER.en,
    merch_brand_tag: "Händlerportal",
    merch_nav_overview: "Überblick",
    merch_nav_business: "Unternehmen",
    merch_nav_catalogue: "Katalog",
    merch_nav_halal: "Halal",
    merch_nav_ops: "Betrieb",
    merch_nav_payouts: "Auszahlungen",
    merch_nav_legal: "Vertrag",
    merch_nav_submit: "Senden",
    merch_footer_note:
      "Händlerportal-Prototyp — API und Objektspeicher vor Produktion anbinden.",
    merch_top_home: "Startseite",
    merch_top_deliver: "Liefern",
    merch_top_order: "Essen bestellen",
    merch_menu_apply: "Antrag starten",
    merch_menu_customer: "Kundenseite",
    merch_menu_catalog: "Katalog importieren",
    merch_menu_riders: "Fahrer",
    merch_hero_kicker: "Händlerportal · Prototyp",
  };

  PARTNER.tr = {
    ...PARTNER.en,
    merch_brand_tag: "Satıcı portalı",
    merch_nav_overview: "Genel bakış",
    merch_nav_business: "İşletme",
    merch_nav_catalogue: "Katalog",
    merch_nav_halal: "Helal",
    merch_nav_ops: "Operasyon",
    merch_nav_payouts: "Ödemeler",
    merch_nav_legal: "Sözleşme",
    merch_nav_submit: "Gönder",
    merch_footer_note:
      "Satıcı portalı prototipi — canlıya almadan önce API ve nesne depolama bağlayın.",
    merch_top_home: "Ana sayfa",
    merch_top_deliver: "Teslimat",
    merch_top_order: "Yemek siparişi",
    merch_menu_apply: "Başvuruyu başlat",
    merch_menu_customer: "Müşteri sitesi",
    merch_menu_catalog: "Katalog içe aktar",
    merch_menu_riders: "Kuryeler",
    merch_hero_kicker: "Satıcı portalı · prototip",
  };

  /** Rider portal (rider/index.html) — keys rider_* */
  const RIDER = {
    en: {
      rider_brand_tag: "Rider portal",
      rider_nav_home: "Home",
      rider_nav_order: "Order food",
      rider_nav_why: "Why ride",
      rider_nav_req: "Requirements",
      rider_nav_sell: "Sell",
      rider_top_waitlist: "Rider waitlist",
      rider_toc_waitlist: "Rider waitlist",
      rider_toc_why: "Why ride",
      rider_toc_req: "Requirements",
      rider_toc_safety: "Safety & data",
      rider_toc_ops: "Dispatch & earnings",
      rider_toc_faq: "FAQ",
      rider_back_customer: "← Customer site",
      rider_hero_kicker: "EU · Halal logistics layer",
      rider_hero_title: "Deliver with GO",
      rider_hero_lead:
        "Halal-first runs with clear handoff rules and upfront fees — launching in Portugal, then more EU cities.",
      rider_hero_sell: "Selling instead?",
      rider_hero_note_html:
        "For dispatch timing, fees, and compliance detail, see <a href=\"#rider-faq\">FAQ</a>.",
      rider_cta_join: "Join rider waitlist",
      rider_cta_dispatch: "How dispatch works",
      rider_h2_waitlist: "Rider waitlist",
      rider_waitlist_lead_html:
        "<strong>Quick signup.</strong> Add your details — we’ll invite you when dispatch opens in your area. App, Maps, and Play Console notes are in the <a href=\"#rider-faq\">FAQ</a>.",
      rider_lbl_name: "Full name",
      rider_lbl_email: "Rider email",
      rider_lbl_phone: "Mobile",
      rider_lbl_country: "Country",
      rider_lbl_city: "City / town",
      rider_lbl_postal: "Postal / ZIP code",
      rider_lbl_vehicle: "Vehicle",
      rider_lbl_notes: "Experience & availability",
      rider_ph_name: "e.g. Ahmed Khan",
      rider_ph_email: "you@example.com",
      rider_ph_phone: "+351 912 345 678",
      rider_ph_city: "Porto",
      rider_ph_postal: "e.g. 4000-292",
      rider_ph_notes: "e.g. 20h/week evenings · Bolt + Glovo · PT + EN + URDU",
      rider_country_placeholder: "Choose country…",
      rider_country_other: "Other — note in availability box",
      rider_hint_name: "Use the name you want on your rider profile and payouts.",
      rider_hint_email: "Required — payouts & onboarding. Same as GO sign-up links your profile.",
      rider_hint_phone: "Include country code. WhatsApp-capable numbers help the kitchen reach you.",
      rider_hint_country: "Where you legally work — tax & insurance depend on this.",
      rider_hint_city: "Where you usually start your shift — we match offers to this area first.",
      rider_hint_postal: "Official format for your area — used for zoning & compliance.",
      rider_hint_vehicle: "We’ll confirm registration and insurance rules for this class before you go live.",
      rider_hint_notes: "Rough hours, other platforms, and languages — helps us route the right offers.",
      rider_vehicle_empty: "Choose vehicle type",
      rider_v_bicycle: "Bicycle",
      rider_v_ebike: "E-bike",
      rider_v_moto: "Motorcycle / scooter",
      rider_v_car: "Car",
      rider_confirm_check:
        "I confirm I have the legal right to work in my country and, where required, valid insurance for the vehicle type I selected above.",
      rider_btn_submit: "Join rider waitlist",
      rider_h2_why: "Why ride with us",
      rider_why_d_h: "Demand",
      rider_why_d_p: "Orders from verified kitchens & future grocery aisles — same-day growth as Porto expands.",
      rider_why_t_h: "Transparency",
      rider_why_t_p:
        "See distance, fee, and estimated time <strong>before</strong> you accept. No blind batching in rider app MVP.",
      rider_why_p_h: "Payouts",
      rider_why_p_p: "Per-drop fees + tips routed through a licensed PSP (e.g. Stripe Connect) when accounts are enabled.",
      rider_h2_req: "What you need (Portugal / EU)",
      rider_req_1_html:
        "<strong>Right to work</strong> — valid work permit or EU citizenship for the country where you deliver.",
      rider_req_2_html:
        "<strong>Vehicle compliance</strong> — registration and inspection where the law requires it; follow local e-bike rules.",
      rider_req_3_html:
        "<strong>Insurance</strong> — liability and goods-in-transit cover that matches your vehicle class.",
      rider_req_4_html:
        "<strong>Tax ID</strong> — NIF in Portugal or the local equivalent; GO provides fee statements for your records.",
      rider_req_5_html:
        "<strong>Phone</strong> — Android or iPhone with mobile data for navigation and in-app chat; a thermal bag is recommended.",
      rider_h2_safety: "Safety, GDPR & support",
      rider_safety_p1:
        "Rider location is processed under GDPR / Lei 58/2019 — purpose-limited to dispatch, ETA, and incident review. Customers do not get your personal phone number in-app chat MVP.",
      rider_safety_p2:
        "24/7 safety escalation and order issue queue ship with production ops — this static page is UX only.",
      rider_h2_ops: "Dispatch, proof & earnings",
      rider_ops_lead:
        "Three-step offer → deliver → earn loop — built for halal-only pickups with clear proof-of-delivery rules.",
      rider_ops_o_h: "Offer",
      rider_ops_o_p: "Pickup, drop-off, distance, fee before accept.",
      rider_ops_e_h: "Execute",
      rider_ops_e_p: "Navigation, in-app chat, photo / PIN proof of delivery.",
      rider_ops_n_h: "Earn",
      rider_ops_n_p: "Per-drop fees + tips; weekly payout after fraud checks.",
      rider_h2_faq: "FAQ",
      rider_faq_sum_model: "How is GO different from typical gig apps?",
      rider_faq_body_model:
        "We prioritise predictable offers, a halal-only partner network, and EU-grade compliance — clear rules and documentation instead of opaque gig churn.",
      rider_faq_sum_dispatch: "What happens when dispatch and payments go live?",
      rider_faq_body_dispatch:
        "You’ll receive platform-assigned halal pickups with proof of delivery. Per-drop fees stay visible <strong>before</strong> you accept, with tips and payouts routed through a licensed payment provider when accounts are enabled — first in Portugal, then more EU markets.",
      rider_faq_sum_zone: "Can I choose my zone?",
      rider_faq_body_zone:
        "Yes — base city + radius you set in rider profile; offers only inside that polygon.",
      rider_faq_sum_multi: "Multi-app while waiting?",
      rider_faq_body_multi:
        "Allowed where law permits; GO does not exclusivity-lock riders in pilot phase.",
      rider_faq_sum_apps: "When do apps ship?",
      rider_faq_body_apps:
        "Roadmap: rider beta after merchant CSV import + PSP — watch this page or email <a href=\"mailto:halaleateu@gmail.com\">halaleateu@gmail.com</a> from the waitlist.",
      rider_faq_sum_appdo: "What will the rider app do?",
      rider_faq_body_appdo:
        "Offers, turn-by-turn navigation, proof of delivery, and earnings — once native rider apps ship.",
      rider_faq_app_o_h: "Offer",
      rider_faq_app_o_p: "Pickup, drop-off, distance, and fee before you accept.",
      rider_faq_app_e_h: "Execute",
      rider_faq_app_e_p: "Navigation, chat, and handover confirmation.",
      rider_faq_app_n_h: "Earn",
      rider_faq_app_n_p: "Per-drop fees and tips, tied to payouts when payments are live.",
      rider_faq_sum_maps: "Google Play Console & Maps — partner checklist",
      rider_faq_body_maps_html:
        "<strong>Two tracks:</strong> Google Play for publishing the customer and rider apps; Google Maps Platform for routing and (later) live location. Live rider dots need GPS → your backend → a map SDK, with EU privacy and foreground-service rules in mind.",
      rider_faq_maps_play: "Play Console",
      rider_faq_maps_cloud: "Google Cloud",
      rider_faq_maps_plat: "Maps Platform",
      rider_faq_maps_live: "Live tracking",
      rider_faq_maps_play_p:
        "<a href=\"https://play.google.com/console\" target=\"_blank\" rel=\"noopener noreferrer\">play.google.com/console</a> — one-time developer fee; separate listings for GO and GO Rider when you ship.",
      rider_faq_maps_cloud_p:
        "<a href=\"https://console.cloud.google.com/\" target=\"_blank\" rel=\"noopener noreferrer\">console.cloud.google.com</a> — project, billing account, and IAM for your team.",
      rider_faq_maps_plat_p:
        "<a href=\"https://mapsplatform.google.com/\" target=\"_blank\" rel=\"noopener noreferrer\">mapsplatform.google.com</a> — enable the SDKs you need, use API key restrictions, and monitor quotas.",
      rider_faq_maps_live_p:
        "Stream <code>lat,lng</code> to your server; clients subscribe over your channel of choice. Apply GDPR minimisation, retention limits, and Android foreground-service requirements in the EU.",
      rider_faq_maps_terms_html:
        "<a href=\"https://cloud.google.com/maps-platform/terms\" target=\"_blank\" rel=\"noopener noreferrer\">Maps Platform terms</a> (Google).",
      rider_footer_business_html:
        '<div class="ue-business-mail ue-business-mail--compact rider-footer-mailcard"><span class="ue-business-mail__kicker">Business · HalalEat EU</span><a class="ue-business-mail__email" href="mailto:halaleateu@gmail.com">halaleateu@gmail.com</a></div>',
      rider_footer_demo: "Dispatch not active in this demo ·",
      rider_footer_customer: "Customer site",
      rider_footer_merchants: "Merchants",
    },
    pt: {
      rider_brand_tag: "Portal do estafeta",
      rider_nav_home: "Início",
      rider_nav_order: "Encomendar comida",
      rider_nav_why: "Porquê entregar",
      rider_nav_req: "Requisitos",
      rider_nav_sell: "Vender",
      rider_top_waitlist: "Lista de estafetas",
      rider_toc_waitlist: "Lista de estafetas",
      rider_toc_why: "Porquê",
      rider_toc_req: "Requisitos",
      rider_toc_safety: "Segurança e dados",
      rider_toc_ops: "Dispatch e ganhos",
      rider_toc_faq: "FAQ",
      rider_back_customer: "← Site do cliente",
      rider_hero_kicker: "UE · Camada logística halal",
      rider_hero_title: "Entregue com a GO",
      rider_hero_lead:
        "Corridas halal em primeiro lugar, regras claras de entrega e taxas antecipadas — arranque em Portugal, depois mais cidades da UE.",
      rider_hero_sell: "Prefere vender?",
      rider_hero_note_html:
        "Para prazos de dispatch, taxas e conformidade, veja as <a href=\"#rider-faq\">FAQ</a>.",
      rider_cta_join: "Entrar na lista",
      rider_cta_dispatch: "Como funciona o dispatch",
      rider_h2_waitlist: "Lista de estafetas",
      rider_waitlist_lead_html:
        "<strong>Inscrição rápida.</strong> Deixe os seus dados — convidamo-lo quando o dispatch abrir na sua zona. Notas sobre app, Maps e Play Console estão nas <a href=\"#rider-faq\">FAQ</a>.",
      rider_lbl_name: "Nome completo",
      rider_lbl_email: "Email do estafeta",
      rider_lbl_phone: "Telemóvel",
      rider_lbl_country: "País",
      rider_lbl_city: "Cidade / localidade",
      rider_lbl_postal: "Código postal",
      rider_lbl_vehicle: "Veículo",
      rider_lbl_notes: "Experiência e disponibilidade",
      rider_ph_name: "ex.: Ahmed Khan",
      rider_ph_email: "exemplo@email.com",
      rider_ph_phone: "+351 912 345 678",
      rider_ph_city: "Porto",
      rider_ph_postal: "ex.: 4000-292",
      rider_ph_notes: "ex.: 20h/semana à noite · Bolt + Glovo · PT + EN + URDU",
      rider_country_placeholder: "Escolha o país…",
      rider_country_other: "Outro — indique nas notas",
      rider_hint_name: "Nome que quer no perfil de estafeta e nos pagamentos.",
      rider_hint_email: "Obrigatório — onboarding e pagamentos. Igual ao registo GO liga o perfil.",
      rider_hint_phone: "Indique o indicativo. Números com WhatsApp ajudam a cozinha a contactá-lo.",
      rider_hint_country: "País onde trabalha legalmente — fiscalidade e seguro dependem disto.",
      rider_hint_city: "Onde costuma iniciar o turno — priorizamos ofertas nesta área.",
      rider_hint_postal: "Formato oficial na sua zona — zonagem e conformidade.",
      rider_hint_vehicle: "Confirmamos matrícula e seguro para esta classe antes de ir a produção.",
      rider_hint_notes: "Horas aproximadas, outras plataformas e idiomas — ajuda a encaminhar ofertas.",
      rider_vehicle_empty: "Escolha o tipo de veículo",
      rider_v_bicycle: "Bicicleta",
      rider_v_ebike: "E-bike",
      rider_v_moto: "Mota / trotinete",
      rider_v_car: "Carro",
      rider_confirm_check:
        "Confirmo que tenho direito legal ao trabalho no meu país e, quando exigido, seguro válido para o tipo de veículo que selecionei.",
      rider_btn_submit: "Entrar na lista de estafetas",
      rider_h2_why: "Porquê connosco",
      rider_why_d_h: "Procura",
      rider_why_d_p: "Pedidos de cozinhas verificadas e futuras mercearias — crescimento à medida que o Porto expande.",
      rider_why_t_h: "Transparência",
      rider_why_t_p:
        "Veja distância, taxa e tempo estimado <strong>antes</strong> de aceitar. Sem batches cegos no MVP.",
      rider_why_p_h: "Pagamentos",
      rider_why_p_p: "Taxas por entrega + gorjetas via PSP licenciado (ex.: Stripe Connect) quando ativo.",
      rider_h2_req: "O que precisa (Portugal / UE)",
      rider_req_1_html:
        "<strong>Direito ao trabalho</strong> — autorização válida ou cidadania UE no país onde entrega.",
      rider_req_2_html:
        "<strong>Veículo em conformidade</strong> — matrícula e inspeção quando a lei exige; regras locais de e-bike.",
      rider_req_3_html:
        "<strong>Seguro</strong> — responsabilidade civil e mercadorias em trânsito adequados à classe do veículo.",
      rider_req_4_html:
        "<strong>NIF fiscal</strong> — NIF em Portugal ou equivalente local; a GO emite extratos de comissões.",
      rider_req_5_html:
        "<strong>Telemóvel</strong> — Android ou iPhone com dados para navegação e chat na app; saco térmico recomendado.",
      rider_h2_safety: "Segurança, RGPD e apoio",
      rider_safety_p1:
        "Localização do estafeta tratada ao abrigo do RGPD / Lei 58/2019 — só dispatch, ETA e revisão de incidentes. O cliente não vê o seu número pessoal no MVP de chat.",
      rider_safety_p2:
        "Escalamento 24/7 e fila de pedidos em produção — esta página é só UX.",
      rider_h2_ops: "Dispatch, prova e ganhos",
      rider_ops_lead:
        "Três passos oferta → entregar → ganhar — pensado para recolhas só halal com regras claras de prova de entrega.",
      rider_ops_o_h: "Oferta",
      rider_ops_o_p: "Recolha, entrega, distância, taxa antes de aceitar.",
      rider_ops_e_h: "Execução",
      rider_ops_e_p: "Navegação, chat na app, foto / PIN como prova de entrega.",
      rider_ops_n_h: "Ganhar",
      rider_ops_n_p: "Taxas por entrega + gorjetas; pagamento semanal após controlos antifraude.",
      rider_h2_faq: "FAQ",
      rider_faq_sum_model: "Em que difere a GO das apps de gig típicas?",
      rider_faq_body_model:
        "Priorizamos ofertas previsíveis, rede só halal e conformidade ao nível da UE — regras e documentação claras.",
      rider_faq_sum_dispatch: "O que muda quando dispatch e pagamentos estiverem ativos?",
      rider_faq_body_dispatch:
        "Receberá recolhas halal atribuídas pela plataforma com prova de entrega. Taxas visíveis <strong>antes</strong> de aceitar; gorjetas e repasses via PSP licenciado — primeiro Portugal, depois mais mercados UE.",
      rider_faq_sum_zone: "Posso escolher a minha zona?",
      rider_faq_body_zone:
        "Sim — cidade base + raio no perfil; ofertas só dentro desse polígono.",
      rider_faq_sum_multi: "Várias apps enquanto espero?",
      rider_faq_body_multi:
        "Permitido onde a lei permitir; na fase piloto não exigimos exclusividade.",
      rider_faq_sum_apps: "Quando saem as apps?",
      rider_faq_body_apps:
        "Roadmap: beta de estafeta após importação CSV de lojas + PSP — acompanhe esta página ou escreva para <a href=\"mailto:halaleateu@gmail.com\">halaleateu@gmail.com</a> a partir da lista.",
      rider_faq_sum_appdo: "O que fará a app do estafeta?",
      rider_faq_body_appdo:
        "Ofertas, navegação passo a passo, prova de entrega e ganhos — quando as apps nativas estiverem prontas.",
      rider_faq_app_o_h: "Oferta",
      rider_faq_app_o_p: "Recolha, entrega, distância e taxa antes de aceitar.",
      rider_faq_app_e_h: "Execução",
      rider_faq_app_e_p: "Navegação, chat e confirmação de entrega.",
      rider_faq_app_n_h: "Ganhar",
      rider_faq_app_n_p: "Taxas e gorjetas ligadas a pagamentos quando ativos.",
      rider_faq_sum_maps: "Google Play Console e Maps — checklist parceiro",
      rider_faq_body_maps_html:
        "<strong>Dois eixos:</strong> Google Play para publicar apps de cliente e estafeta; Maps Platform para rotas e (mais tarde) localização em tempo real. Pontos ao vivo precisam de GPS → backend → SDK de mapa, com RGPD e serviço em primeiro plano no Android na UE.",
      rider_faq_maps_play: "Play Console",
      rider_faq_maps_cloud: "Google Cloud",
      rider_faq_maps_plat: "Maps Platform",
      rider_faq_maps_live: "Localização em tempo real",
      rider_faq_maps_play_p:
        "<a href=\"https://play.google.com/console\" target=\"_blank\" rel=\"noopener noreferrer\">play.google.com/console</a> — taxa única de programador; listagens separadas GO e GO Rider.",
      rider_faq_maps_cloud_p:
        "<a href=\"https://console.cloud.google.com/\" target=\"_blank\" rel=\"noopener noreferrer\">console.cloud.google.com</a> — projeto, faturação e IAM.",
      rider_faq_maps_plat_p:
        "<a href=\"https://mapsplatform.google.com/\" target=\"_blank\" rel=\"noopener noreferrer\">mapsplatform.google.com</a> — SDKs, chaves restritas e quotas.",
      rider_faq_maps_live_p:
        "Envie <code>lat,lng</code> ao servidor; clientes subscrevem o canal. Minimização RGPD, retenção e serviço em primeiro plano Android na UE.",
      rider_faq_maps_terms_html:
        "<a href=\"https://cloud.google.com/maps-platform/terms\" target=\"_blank\" rel=\"noopener noreferrer\">Termos Maps Platform</a> (Google).",
      rider_footer_business_html:
        '<div class="ue-business-mail ue-business-mail--compact rider-footer-mailcard"><span class="ue-business-mail__kicker">Negócios · GO UE</span><a class="ue-business-mail__email" href="mailto:halaleateu@gmail.com">halaleateu@gmail.com</a></div>',
      rider_footer_demo: "Dispatch inativo neste demo ·",
      rider_footer_customer: "Site do cliente",
      rider_footer_merchants: "Comerciantes",
    },
  };

  const LANG_OPTION_LABELS = {
    en: "English",
    pt: "Português",
    fr: "Français",
    de: "Deutsch",
    tr: "Türkçe",
    it: "Italiano",
    es: "Español",
    nl: "Nederlands",
    pl: "Polski",
    sv: "Svenska",
    da: "Dansk",
    fi: "Suomi",
    no: "Norsk",
    is: "Íslenska",
    ga: "Gaeilge",
    mt: "Malti",
    el: "Ελληνικά",
    ro: "Română",
    bg: "Български",
    hu: "Magyar",
    cs: "Čeština",
    sk: "Slovenčina",
    hr: "Hrvatski",
    sl: "Slovenščina",
    lt: "Lietuvių",
    lv: "Latviešu",
    et: "Eesti",
    uk: "Українська",
    ru: "Русский",
    sr: "Srpski",
    bs: "Bosanski",
    mk: "Македонски",
    sq: "Shqip",
    hy: "Հայերեն",
    ka: "ქართული",
    ar: "العربية",
    ur: "اردو",
    bn: "বাংলা",
  };

  function resolveUiLang(lang) {
    if (!lang) return "en";
    if (STRINGS[lang]) return lang;
    const base = String(lang).split("-")[0];
    if (STRINGS[base]) return base;
    return "en";
  }

  function fillLangSelect(sel) {
    if (!(sel instanceof HTMLSelectElement) || sel.dataset.halalEatLangFilled === "1") return;
    sel.dataset.halalEatLangFilled = "1";
    const prev = sel.value || "en";
    const codes = Object.keys(STRINGS).sort((a, b) => {
      const la = LANG_OPTION_LABELS[a] || a;
      const lb = LANG_OPTION_LABELS[b] || b;
      return la.localeCompare(lb, "en");
    });
    sel.innerHTML = codes
      .map((code) => {
        const label = LANG_OPTION_LABELS[code] || code;
        return `<option value="${code}">${label}</option>`;
      })
      .join("");
    if ([...sel.options].some((o) => o.value === prev)) sel.value = prev;
    else sel.value = "en";
  }

  function t(lang, key) {
    const L = resolveUiLang(lang);
    if (key && String(key).startsWith("rider_")) {
      const row = RIDER[L] || RIDER.en;
      if (row[key] != null) return row[key];
      return RIDER.en[key] != null ? RIDER.en[key] : key;
    }
    if (key && String(key).startsWith("merch_")) {
      const L = resolveUiLang(lang);
      const row = { ...PARTNER.en, ...(PARTNER[L] || {}) };
      return row[key] != null && row[key] !== "" ? row[key] : key;
    }
    const bundle = STRINGS[L] || STRINGS.en;
    return bundle[key] != null ? bundle[key] : STRINGS.en[key] || key;
  }

  function applyLanguage(lang) {
    lang = resolveUiLang(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" || lang === "ur" ? "rtl" : "ltr";

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      el.textContent = t(lang, key);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (!key) return;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.placeholder = t(lang, key);
    });

    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      if (key) el.innerHTML = t(lang, key);
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria");
      if (key) el.setAttribute("aria-label", t(lang, key));
    });

    const dw = document.getElementById("delivery-when");
    if (dw && dw.options[0]) dw.options[0].textContent = t(lang, "delivery_now");
    if (dw && dw.options[1]) dw.options[1].textContent = t(lang, "delivery_schedule");

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (_) {
      /* ignore */
    }
  }

  function initI18n() {
    const sel = document.getElementById("lang-select");
    const hasI18n =
      document.querySelector("[data-i18n], [data-i18n-placeholder], [data-i18n-html], [data-i18n-aria]");
    if (!sel && !hasI18n) return;
    if (sel instanceof HTMLSelectElement) fillLangSelect(sel);
    let saved = "en";
    try {
      saved = localStorage.getItem(STORAGE_KEY) || "en";
    } catch (_) {}
    saved = resolveUiLang(saved);
    if (sel instanceof HTMLSelectElement) {
      if ([...sel.options].some((o) => o.value === saved)) sel.value = saved;
      else sel.value = "en";
      applyLanguage(sel.value);
      sel.addEventListener("change", () => applyLanguage(sel.value));
    } else {
      applyLanguage(saved);
    }
  }

  window.GOI18n = { applyLanguage, t, STRINGS, PARTNER, RIDER, fillLangSelect, resolveUiLang };
  window.HalalEatI18n = window.GOI18n;

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initI18n);
  else initI18n();
})();
