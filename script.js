const menuData = window.MENU_DATA?.items || {};

/** @typedef {"all"|"cuisines"|"groups"} MenuFilterMode */

/** Cuisine slugs for halal diaspora kitchens we spotlight (subs only list cuisines that have ≥1 dish). */
const WORLD_CUISINES = ["indian", "pakistani", "bangladeshi", "moroccan", "tunisian", "arabic", "fusion"];

const CUISINE_LABELS = {
  indian: "Indian",
  pakistani: "Pakistani",
  bangladeshi: "Bangladeshi",
  moroccan: "Moroccan",
  tunisian: "Tunisian",
  arabic: "Arabic & Levant",
  fusion: "Fusion & western",
};

/**
 * Parent aisles: `groups` mode uses menu `groups`; `cuisines` mode uses optional `cuisines[]` on each item.
 */
const MENU_PARENT_FILTERS = {
  all: { label: "All", mode: "all" },
  world: { label: "Halal world kitchens", mode: "cuisines", cuisineList: WORLD_CUISINES },
  western: { label: "Pizza, burgers & boxes", mode: "groups", groups: ["Pizza & Burgers", "Family Meals"] },
  morning: { label: "Breakfast & bakery", mode: "groups", groups: ["Breakfast Bowls", "Bakery"] },
  drinks: { label: "Drinks", mode: "groups", groups: ["Drinks"] },
  sides: { label: "Sides & dips", mode: "groups", groups: ["Sauces & Sides"] },
};

const GROUP_DISPLAY_LABELS = {
  "Breakfast Bowls": "Breakfast bowls",
  "Pizza & Burgers": "Pizza & burgers",
  "Family Meals": "Family meals",
  "Asian Gravies": "Curries & rice",
  Drinks: "Drinks",
  "Sauces & Sides": "Sides & sauces",
  Bakery: "Bakery",
};

let menuBrowseState = { parent: "all", sub: "__all" };

function groupsOnItem(details) {
  return Array.isArray(details.groups) ? details.groups : [];
}

function cuisinesOnItem(details) {
  return Array.isArray(details.cuisines) ? details.cuisines : [];
}

function hasItemsInGroup(groupName) {
  return Object.values(menuData).some((d) => groupsOnItem(d).includes(groupName));
}

function hasItemsWithCuisine(slug) {
  return Object.values(menuData).some((d) => cuisinesOnItem(d).includes(slug));
}

function itemMatchesBrowse(details) {
  const { parent, sub } = menuBrowseState;
  const def = MENU_PARENT_FILTERS[parent];
  if (!def || def.mode === "all") return true;

  if (def.mode === "cuisines") {
    const c = cuisinesOnItem(details);
    if (!c.some((x) => def.cuisineList.includes(x))) return false;
    if (sub === "__all") return true;
    return c.includes(sub);
  }

  if (def.mode === "groups") {
    const g = groupsOnItem(details);
    if (!g.some((x) => def.groups.includes(x))) return false;
    if (sub === "__all") return true;
    return g.includes(sub);
  }

  return true;
}

function displayTagForItem(details) {
  const g = groupsOnItem(details);
  const c = cuisinesOnItem(details);
  const { parent, sub } = menuBrowseState;
  const def = MENU_PARENT_FILTERS[parent];

  if (parent === "all" || !def || def.mode === "all") {
    if (c.length) {
      const order = WORLD_CUISINES;
      const slug = [...c].sort((a, b) => order.indexOf(a) - order.indexOf(b))[0];
      return CUISINE_LABELS[slug] || slug;
    }
    if (g.length) return GROUP_DISPLAY_LABELS[g[0]] || g[0];
    return "Menu";
  }

  if (def.mode === "cuisines") {
    if (sub !== "__all" && c.includes(sub)) return CUISINE_LABELS[sub] || sub;
    for (const slug of def.cuisineList) {
      if (c.includes(slug)) return CUISINE_LABELS[slug] || slug;
    }
    return c[0] ? CUISINE_LABELS[c[0]] || c[0] : "Halal kitchen";
  }

  if (def.mode === "groups" && def.groups) {
    if (sub !== "__all" && g.includes(sub)) return GROUP_DISPLAY_LABELS[sub] || sub;
    for (const key of def.groups) {
      if (g.includes(key)) return GROUP_DISPLAY_LABELS[key] || key;
    }
  }

  if (c.length) return CUISINE_LABELS[c[0]] || c[0];
  if (g.length) return GROUP_DISPLAY_LABELS[g[0]] || g[0];
  return "Menu";
}

/** Root homepage: `item.html` / `category.html` sit next to `index.html`. If you ever nest the app again, set `<html data-app-root="..">`. */
function assetPath(file) {
  const root = document.documentElement.getAttribute("data-app-root");
  if (!root) return file;
  const trimmed = root.replace(/\/+$/, "");
  return `${trimmed}/${file}`;
}

const specials = [
  { dish: "Healthy Oats Breakfast Bowl", discount: "12%" },
  { dish: "Egg Fried Rice", discount: "13%" },
  { dish: "Chicken Chilli", discount: "12%" },
  { dish: "Kung Pao Chicken", discount: "12%" },
  { dish: "Classic Chicken Biryani", discount: "14%" },
  { dish: "Stone Baked Chicken Pizza", discount: "12%" },
  { dish: "Crispy Fried Chicken Meal", discount: "13%" }
];

const dailySpecialEl = document.getElementById("daily-special");
const countdownEl = document.getElementById("countdown");
const notifyBtn = document.getElementById("notify-btn");
const notifyMsg = document.getElementById("notify-msg");
const ratingButtons = document.querySelectorAll(".star");
const ratingMsg = document.getElementById("rating-msg");
const orderForm = document.getElementById("order-form");
const orderMsg = document.getElementById("order-msg");
const reviewLink = document.getElementById("review-link");
const menuGridEl = document.getElementById("menu-grid");
const dishSelect = document.getElementById("dish");
const itemPreviewImage = document.getElementById("item-preview-image");
const itemPreviewTitle = document.getElementById("item-preview-title");
const itemPreviewList = document.getElementById("item-preview-list");
const weeklyPlanChecks = document.querySelectorAll(".weekly-plan-check");
const weeklyPlanSummary = document.getElementById("weekly-plan-summary");
const weeklyPlanOrderLink = document.getElementById("weekly-plan-order-link");
const homeSearchEl = document.getElementById("home-search");

let toastTimer;

function showToast(message) {
  const el = document.getElementById("app-toast");
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  requestAnimationFrame(() => el.classList.add("is-visible"));
  clearTimeout(toastTimer);
  const dismiss = () => {
    el.classList.remove("is-visible");
    setTimeout(() => {
      el.hidden = true;
    }, 400);
    el.removeEventListener("click", dismiss);
  };
  el.addEventListener("click", dismiss);
  toastTimer = setTimeout(dismiss, 3200);
}

function applyMenuFilter() {
  const empty = document.getElementById("menu-empty");
  if (!menuGridEl) return;
  const q = (homeSearchEl?.value || "").trim().toLowerCase();
  const cards = menuGridEl.querySelectorAll(".menu-item");
  let visible = 0;
  cards.forEach((card) => {
    const ok = !q || card.textContent.toLowerCase().includes(q);
    card.classList.toggle("is-hidden", !ok);
    if (ok) visible += 1;
  });
  if (empty) {
    empty.hidden = !(q && visible === 0);
  }
}

/** Curated picks for the “All” tab — short list so the page feels hand-picked, not endless. */
const ALL_TAB_CURATED = [
  "Classic Chicken Biryani",
  "Chicken Shawarma",
  "Moroccan Chicken Tagine",
  "Office Lunch Box",
  "Stone Baked Chicken Pizza",
  "Crispy Fried Chicken Meal",
  "Egg Fried Rice",
  "Fresh Orange Juice",
];

let menuAllExpanded = false;

function formatPrice(price) {
  return `EUR ${price.toFixed(2)}`;
}

function previewFallback(label = "Selected Item") {
  return `https://placehold.co/900x600/f2f5fa/1f2533?text=${encodeURIComponent(label)}`;
}

async function setPreviewStandardImage(itemName, imageUrl) {
  if (!itemPreviewImage) return;
  const utils = window.Tayy_IMAGE_UTILS || window.HFC_IMAGE_UTILS;
  const fallback = previewFallback(itemName);
  if (!utils?.resolveItemImage) {
    itemPreviewImage.src = imageUrl || fallback;
    return;
  }
  itemPreviewImage.src = await utils.resolveItemImage(itemName, imageUrl || fallback);
}

function countMenuMatches() {
  return Object.values(menuData).filter((details) => itemMatchesBrowse(details)).length;
}

function updateMenuShowMoreUi(totalVisible) {
  const btn = document.getElementById("menu-show-more");
  const note = document.getElementById("menu-browse-note");
  const onAll = menuBrowseState.parent === "all";
  const curatedCount = ALL_TAB_CURATED.filter((n) => menuData[n]).length;
  const totalMatching = onAll ? countMenuMatches() : totalVisible;

  if (btn) {
    if (onAll && !menuAllExpanded && totalMatching > curatedCount) {
      btn.hidden = false;
      btn.textContent = `Show ${totalMatching - curatedCount} more dishes`;
    } else if (onAll && menuAllExpanded) {
      btn.hidden = false;
      btn.textContent = "Show fewer dishes";
    } else {
      btn.hidden = true;
    }
  }
  if (note) {
    if (onAll && !menuAllExpanded) {
      note.hidden = false;
      note.textContent = "A small starter menu — tap below for the full list, or pick a kitchen row above.";
    } else {
      note.hidden = true;
    }
  }
}

function renderMenuCards() {
  if (!menuGridEl) return;
  menuGridEl.innerHTML = "";
  const entries = Object.entries(menuData);
  const onAll = menuBrowseState.parent === "all";
  let sortedEntries;

  if (onAll && !menuAllExpanded) {
    sortedEntries = ALL_TAB_CURATED.filter((itemName) => menuData[itemName]).map((itemName) => [
      itemName,
      menuData[itemName],
    ]);
  } else if (onAll && menuAllExpanded) {
    const curatedSet = new Set(ALL_TAB_CURATED);
    sortedEntries = [
      ...ALL_TAB_CURATED.filter((n) => menuData[n]).map((n) => [n, menuData[n]]),
      ...entries.filter(([name]) => !curatedSet.has(name)),
    ];
  } else {
    sortedEntries = entries;
  }

  let matched = 0;
  sortedEntries.forEach(([name, details]) => {
    if (!itemMatchesBrowse(details)) return;
    matched += 1;

    const tag = displayTagForItem(details);
    const card = document.createElement("article");
    card.className = "menu-item";
    card.dataset.menuTag = tag;
    card.innerHTML = `
      <h4>${name}</h4>
      <p>${details.points[0]}</p>
      <p class="tiny">${tag}</p>
      <p class="category-price">${formatPrice(details.price)}</p>
    `;
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      window.location.href = `${assetPath("item.html")}?item=${encodeURIComponent(name)}`;
    });

    menuGridEl.appendChild(card);
  });
  updateMenuShowMoreUi(matched);
  applyMenuFilter();
}

document.getElementById("menu-show-more")?.addEventListener("click", () => {
  const wasExpanded = menuAllExpanded;
  menuAllExpanded = !menuAllExpanded;
  renderMenuCards();
  if (!wasExpanded && menuAllExpanded) {
    document.getElementById("menu-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

function fillDishSelect() {
  if (!dishSelect) return;
  const sortedNames = Object.keys(menuData).sort((a, b) => a.localeCompare(b));
  sortedNames.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    dishSelect.appendChild(option);
  });
}

const dayIndex = new Date().getDay();
const todaysSpecial = specials[dayIndex % specials.length];
if (dailySpecialEl) {
  dailySpecialEl.textContent = `${todaysSpecial.dish} (${todaysSpecial.discount} off)`;
}

function updateCountdown() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const distance = midnight - now;

  const hours = String(Math.floor((distance / (1000 * 60 * 60)) % 24)).padStart(2, "0");
  const mins = String(Math.floor((distance / (1000 * 60)) % 60)).padStart(2, "0");
  const secs = String(Math.floor((distance / 1000) % 60)).padStart(2, "0");

  if (countdownEl) {
    countdownEl.textContent = `${hours}:${mins}:${secs}`;
  }
}

updateCountdown();
setInterval(updateCountdown, 1000);

if (notifyBtn) {
  notifyBtn.addEventListener("click", () => {
    const currentState = notifyBtn.getAttribute("data-active");
    const isActive = currentState === "true";

    if (!isActive) {
      notifyBtn.setAttribute("data-active", "true");
      notifyBtn.textContent = "Reminder on";
      if (notifyMsg) notifyMsg.textContent = "We will surface daily partner specials here first; push alerts ship with the Tayy app.";
      return;
    }

    notifyBtn.setAttribute("data-active", "false");
    notifyBtn.textContent = "Remind me daily";
    if (notifyMsg) notifyMsg.textContent = "Reminder paused.";
  });
}

ratingButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const score = Number(button.dataset.score);

    ratingButtons.forEach((btn, index) => {
      btn.classList.toggle("active", index < score);
    });

    if (ratingMsg) ratingMsg.textContent = `Thanks — you rated this partner ${score}/5.`;
  });
});

if (orderForm) {
  orderForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("name")?.value.trim() ?? "";
    const phone = document.getElementById("phone")?.value.trim() ?? "";
    const dish = document.getElementById("dish")?.value ?? "";

    if (!name || !phone || !dish) {
      if (orderMsg) orderMsg.textContent = "Please fill all fields.";
      return;
    }

    if (orderMsg) {
      orderMsg.textContent = `Thanks ${name}. Your ${dish} request is logged — the kitchen will reach you on ${phone}.`;
    }
    orderForm.reset();
    renderItemPreview("");
  });
}

if (reviewLink) {
  reviewLink.addEventListener("click", () => {
    if (ratingMsg) ratingMsg.textContent = "Thanks — opening Google reviews for this partner.";
  });
}

document.querySelectorAll(".show-item").forEach((card) => {
  card.style.cursor = "pointer";
  card.addEventListener("click", () => {
    const group = card.dataset.group;
    if (!group) return;
    window.location.href = `${assetPath("category.html")}?group=${encodeURIComponent(group)}`;
  });
});

function setActiveInRow(row, activeBtn) {
  if (!row) return;
  row.querySelectorAll(".cat-btn").forEach((btn) => btn.classList.remove("active"));
  activeBtn?.classList.add("active");
}

function refreshMenuSubRow() {
  const subRow = document.getElementById("menu-sub-row");
  const subLabel = document.getElementById("menu-sub-aisle-label");
  if (!subRow || !subLabel) return;

  const { parent } = menuBrowseState;
  const def = MENU_PARENT_FILTERS[parent];

  if (parent === "all" || !def) {
    menuBrowseState.sub = "__all";
    subRow.hidden = true;
    subLabel.hidden = true;
    subRow.innerHTML = "";
    return;
  }

  if (def.mode === "cuisines") {
    const withStock = def.cuisineList.filter(hasItemsWithCuisine);
    if (withStock.length === 0) {
      menuBrowseState.sub = "__all";
      subRow.hidden = true;
      subLabel.hidden = true;
      subRow.innerHTML = "";
      return;
    }
    if (withStock.length === 1) {
      menuBrowseState.sub = "__all";
      subRow.hidden = true;
      subLabel.hidden = true;
      subRow.innerHTML = "";
      return;
    }
    subLabel.hidden = false;
    subLabel.textContent = `Within ${def.label}`;
    subRow.hidden = false;
    subRow.innerHTML = "";

    const allBtn = document.createElement("button");
    allBtn.type = "button";
    allBtn.className = "cat-btn cat-btn--sub active";
    allBtn.dataset.menuSub = "__all";
    allBtn.textContent = "All kitchens";
    subRow.appendChild(allBtn);

    withStock.forEach((slug) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "cat-btn cat-btn--sub";
      b.dataset.menuSub = slug;
      b.textContent = CUISINE_LABELS[slug] || slug;
      subRow.appendChild(b);
    });
    return;
  }

  if (def.mode !== "groups" || !def.groups) {
    menuBrowseState.sub = "__all";
    subRow.hidden = true;
    subLabel.hidden = true;
    subRow.innerHTML = "";
    return;
  }

  const groupsWithStock = def.groups.filter(hasItemsInGroup);
  if (groupsWithStock.length <= 1) {
    menuBrowseState.sub = "__all";
    subRow.hidden = true;
    subLabel.hidden = true;
    subRow.innerHTML = "";
    return;
  }

  subLabel.hidden = false;
  subLabel.textContent = `Within ${def.label}`;
  subRow.hidden = false;
  subRow.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.type = "button";
  allBtn.className = "cat-btn cat-btn--sub active";
  allBtn.dataset.menuSub = "__all";
  allBtn.textContent = "All types";
  subRow.appendChild(allBtn);

  groupsWithStock.forEach((g) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "cat-btn cat-btn--sub";
    b.dataset.menuSub = g;
    b.textContent = GROUP_DISPLAY_LABELS[g] || g;
    subRow.appendChild(b);
  });
}

function initMenuCategoryNav() {
  const parentRow = document.getElementById("menu-parent-row");
  if (!parentRow) return;

  parentRow.innerHTML = "";
  Object.entries(MENU_PARENT_FILTERS).forEach(([id, spec]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "cat-btn cat-btn--parent";
    b.dataset.menuParent = id;
    b.textContent = spec.label;
    if (id === menuBrowseState.parent) b.classList.add("active");
    parentRow.appendChild(b);
  });

  refreshMenuSubRow();
}

document.getElementById("menu-category-stack")?.addEventListener("click", (event) => {
  const parentBtn = event.target.closest("[data-menu-parent]");
  if (parentBtn) {
    const parent = parentBtn.dataset.menuParent;
    if (!parent || !MENU_PARENT_FILTERS[parent]) return;
    menuBrowseState = { parent, sub: "__all" };
    if (parent !== "all") menuAllExpanded = false;
    setActiveInRow(document.getElementById("menu-parent-row"), parentBtn);
    refreshMenuSubRow();
    renderMenuCards();
    return;
  }

  const subBtn = event.target.closest("[data-menu-sub]");
  if (subBtn) {
    const sub = subBtn.dataset.menuSub;
    if (sub == null) return;
    menuBrowseState.sub = sub;
    setActiveInRow(document.getElementById("menu-sub-row"), subBtn);
    renderMenuCards();
  }
});

function renderItemPreview(itemName) {
  if (!itemPreviewTitle || !itemPreviewImage || !itemPreviewList) return;
  const details = menuData[itemName];
  if (!details) {
    itemPreviewTitle.textContent = "Select an item";
    itemPreviewImage.src = previewFallback("Select Item");
    itemPreviewList.innerHTML = "<li>Item image will show here</li><li>Main ingredients list</li><li>Serving style and notes</li>";
    return;
  }

  itemPreviewTitle.textContent = itemName;
  setPreviewStandardImage(itemName, details.image);
  itemPreviewImage.onerror = () => {
    itemPreviewImage.src = previewFallback(itemName);
  };
  itemPreviewList.innerHTML = [`Price: ${formatPrice(details.price)}`, ...details.points].map((point) => `<li>${point}</li>`).join("");
}

if (dishSelect) {
  dishSelect.addEventListener("change", () => {
    renderItemPreview(dishSelect.value);
  });
}

if (homeSearchEl) {
  homeSearchEl.addEventListener("input", applyMenuFilter);
}

document.querySelectorAll("[data-vertical]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const v = btn.dataset.vertical;
    document.querySelectorAll("[data-vertical]").forEach((b) => b.classList.remove("vertical-card--active"));
    btn.classList.add("vertical-card--active");
    if (v === "restaurants") {
      document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    showToast("Groceries, butcher, halal food, snacks & bakery — partner listings open next. Order from the restaurant menu below today.");
  });
});

const EU_DELIVERY_COUNTRIES = [
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "BG", name: "Bulgaria" },
  { code: "HR", name: "Croatia" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czechia" },
  { code: "DK", name: "Denmark" },
  { code: "EE", name: "Estonia" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "GR", name: "Greece" },
  { code: "HU", name: "Hungary" },
  { code: "IE", name: "Ireland" },
  { code: "IT", name: "Italy" },
  { code: "LV", name: "Latvia" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MT", name: "Malta" },
  { code: "NL", name: "Netherlands" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "RO", name: "Romania" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
];

/** Major cities / metros per EU country (browse + future delivery zones). First = default when switching country. */
const EU_CITIES_BY_CODE = {
  AT: ["Vienna", "Graz", "Linz", "Salzburg", "Innsbruck", "Klagenfurt", "Bregenz", "Wels", "Sankt Pölten", "Dornbirn", "Wiener Neustadt", "Steyr", "Leonding", "Klosterneuburg"],
  BE: ["Brussels", "Antwerp", "Ghent", "Charleroi", "Liège", "Bruges", "Namur", "Leuven", "Mechelen", "Aalst", "Hasselt", "Ostend", "Kortrijk", "Genk"],
  BG: ["Sofia", "Plovdiv", "Varna", "Burgas", "Ruse", "Stara Zagora", "Pleven", "Sliven", "Dobrich", "Shumen", "Pernik", "Yambol", "Haskovo", "Blagoevgrad"],
  HR: ["Zagreb", "Split", "Rijeka", "Osijek", "Zadar", "Slavonski Brod", "Pula", "Sesvete", "Karlovac", "Varaždin", "Šibenik", "Dubrovnik", "Velika Gorica"],
  CY: ["Nicosia", "Limassol", "Larnaca", "Paphos", "Famagusta", "Paralimni", "Morphou", "Kyrenia"],
  CZ: ["Prague", "Brno", "Ostrava", "Plzeň", "Liberec", "Olomouc", "České Budějovice", "Hradec Králové", "Ústí nad Labem", "Pardubice", "Zlín", "Havířov", "Kladno", "Most"],
  DK: ["Copenhagen", "Aarhus", "Odense", "Aalborg", "Esbjerg", "Randers", "Kolding", "Horsens", "Vejle", "Roskilde", "Herning", "Silkeborg", "Fredericia", "Sønderborg"],
  EE: ["Tallinn", "Tartu", "Narva", "Pärnu", "Kohtla-Järve", "Viljandi", "Rakvere", "Maardu", "Kuressaare", "Sillamäe", "Valga"],
  FI: ["Helsinki", "Espoo", "Tampere", "Vantaa", "Oulu", "Turku", "Jyväskylä", "Lahti", "Kuopio", "Pori", "Kouvola", "Joensuu", "Lappeenranta", "Vaasa"],
  FR: ["Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille", "Rennes", "Reims", "Le Havre", "Toulon", "Grenoble", "Dijon", "Angers", "Nîmes", "Clermont-Ferrand", "Aix-en-Provence"],
  DE: ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Leipzig", "Dortmund", "Essen", "Bremen", "Dresden", "Hanover", "Nuremberg", "Duisburg", "Bochum", "Wuppertal", "Bielefeld", "Bonn", "Münster", "Karlsruhe", "Mannheim", "Augsburg", "Freiburg"],
  GR: ["Athens", "Thessaloniki", "Patras", "Heraklion", "Larissa", "Volos", "Rhodes", "Ioannina", "Chania", "Agrinio", "Kalamata", "Kavala"],
  HU: ["Budapest", "Debrecen", "Szeged", "Miskolc", "Pécs", "Győr", "Nyíregyháza", "Kecskemét", "Székesfehérvár", "Szombathely", "Szolnok", "Tatabánya"],
  IE: ["Dublin", "Cork", "Limerick", "Galway", "Waterford", "Drogheda", "Dundalk", "Swords", "Bray", "Navan", "Ennis", "Kilkenny", "Carlow"],
  IT: ["Rome", "Milan", "Naples", "Turin", "Palermo", "Genoa", "Bologna", "Florence", "Bari", "Catania", "Verona", "Venice", "Messina", "Padua", "Trieste", "Brescia", "Parma", "Prato", "Modena", "Reggio Calabria", "Perugia", "Ravenna", "Livorno"],
  LV: ["Riga", "Daugavpils", "Liepāja", "Jelgava", "Jūrmala", "Ventspils", "Rēzekne", "Valmiera", "Jēkabpils", "Ogre", "Tukums", "Salaspils"],
  LT: ["Vilnius", "Kaunas", "Klaipėda", "Šiauliai", "Panevėžys", "Alytus", "Marijampolė", "Mažeikiai", "Jonava", "Utena", "Kėdainiai", "Telšiai"],
  LU: ["Luxembourg City", "Esch-sur-Alzette", "Differdange", "Dudelange", "Pétange", "Sanem", "Hesperange", "Bertrange", "Strassen"],
  MT: ["Valletta", "Birkirkara", "Qormi", "Mosta", "Żabbar", "Sliema", "St. Paul's Bay", "Fgura", "Naxxar", "Żebbuġ", "Marsaskala"],
  NL: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Groningen", "Tilburg", "Almere", "Breda", "Nijmegen", "Haarlem", "Arnhem", "Zaanstad", "Amersfoort", "Apeldoorn", "Maastricht", "Leiden", "Dordrecht", "Zwolle"],
  PL: ["Warsaw", "Kraków", "Łódź", "Wrocław", "Poznań", "Gdańsk", "Szczecin", "Bydgoszcz", "Lublin", "Katowice", "Białystok", "Gdynia", "Częstochowa", "Radom", "Sosnowiec", "Toruń", "Kielce", "Gliwice", "Zabrze", "Olsztyn"],
  PT: ["Porto", "Lisbon", "Braga", "Coimbra", "Aveiro", "Setúbal", "Faro", "Funchal", "Viseu", "Leiria", "Évora", "Guimarães", "Matosinhos", "Cascais", "Amadora", "Almada", "Vila Nova de Gaia", "Ponta Delgada"],
  RO: ["Bucharest", "Cluj-Napoca", "Timișoara", "Iași", "Constanța", "Brașov", "Craiova", "Galați", "Ploiești", "Oradea", "Brăila", "Arad", "Pitești", "Sibiu", "Bacău", "Târgu Mureș", "Baia Mare", "Buzău", "Botoșani"],
  SK: ["Bratislava", "Košice", "Prešov", "Žilina", "Banská Bystrica", "Trnava", "Martin", "Trenčín", "Poprad", "Prievidza", "Zvolen"],
  SI: ["Ljubljana", "Maribor", "Celje", "Koper", "Velenje", "Novo Mesto", "Ptuj", "Kranj", "Murska Sobota", "Nova Gorica"],
  ES: ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Málaga", "Murcia", "Palma", "Las Palmas de Gran Canaria", "Bilbao", "Alicante", "Córdoba", "Valladolid", "Vigo", "Gijón", "Granada", "Santa Cruz de Tenerife", "Pamplona", "Santander", "Toledo"],
  SE: ["Stockholm", "Gothenburg", "Malmö", "Uppsala", "Västerås", "Örebro", "Linköping", "Helsingborg", "Jönköping", "Norrköping", "Lund", "Umeå", "Gävle", "Borås", "Sundsvall", "Eskilstuna"],
};

function citiesForCountry(code) {
  const list = EU_CITIES_BY_CODE[code];
  return Array.isArray(list) && list.length ? list : ["Porto"];
}

function defaultCityForCountry(code) {
  return citiesForCountry(code)[0];
}

function fillCitySelect(countryCode, selectedCity) {
  const citySel = document.getElementById("city-select");
  if (!(citySel instanceof HTMLSelectElement)) return;
  const cities = citiesForCountry(countryCode);
  const want = (selectedCity || "").trim();
  const inList = want !== "" && cities.includes(want);
  citySel.replaceChildren();
  if (want !== "" && !inList) {
    citySel.add(new Option(want, want));
  }
  for (const c of cities) {
    citySel.add(new Option(c, c));
  }
  if (want !== "") {
    citySel.value = want;
    if (citySel.value !== want) {
      citySel.value = cities[0];
    }
  } else {
    citySel.value = cities[0];
  }
}

const REGION_STORAGE_KEY = "halaleat_region";

function readSavedRegion() {
  try {
    const raw = localStorage.getItem(REGION_STORAGE_KEY);
    if (!raw) return { code: "PT", city: "Porto" };
    const o = JSON.parse(raw);
    if (o && o.code && o.city) {
      const codeOk = EU_DELIVERY_COUNTRIES.some((c) => c.code === o.code);
      if (codeOk) return { code: o.code, city: o.city };
    }
  } catch (_) {
    /* ignore */
  }
  return { code: "PT", city: "Porto" };
}

function writeSavedRegion(region) {
  try {
    localStorage.setItem(REGION_STORAGE_KEY, JSON.stringify(region));
  } catch (_) {
    /* ignore */
  }
}

function regionLabel(region) {
  const row = EU_DELIVERY_COUNTRIES.find((c) => c.code === region.code);
  const country = row?.name || region.code;
  return `${region.city}, ${country}`;
}

function applyRegionToPill() {
  const pillText = document.getElementById("location-pill-text");
  if (!pillText) return;
  pillText.textContent = regionLabel(readSavedRegion());
}

function initLocationDialog() {
  const dialog = document.getElementById("location-dialog");
  const pill = document.getElementById("location-pill");
  const sel = document.getElementById("country-select");
  const citySel = document.getElementById("city-select");
  if (!dialog || !pill || !sel || !citySel) return;

  sel.innerHTML = EU_DELIVERY_COUNTRIES.map((c) => `<option value="${c.code}">${c.name}</option>`).join("");

  function syncFormFromSaved() {
    const r = readSavedRegion();
    sel.value = r.code;
    fillCitySelect(r.code, r.city);
  }

  applyRegionToPill();
  syncFormFromSaved();

  sel.addEventListener("change", () => {
    fillCitySelect(sel.value, defaultCityForCountry(sel.value));
  });

  pill.addEventListener("click", () => {
    syncFormFromSaved();
    if (window.HalalEatI18n?.applyLanguage) {
      const langSel = document.getElementById("lang-select");
      const lang = langSel instanceof HTMLSelectElement ? langSel.value : "en";
      window.HalalEatI18n.applyLanguage(lang);
    }
    dialog.showModal();
  });

  document.getElementById("location-cancel")?.addEventListener("click", () => dialog.close());
  document.getElementById("location-save")?.addEventListener("click", () => {
    const cityVal = (citySel.value || "").trim() || defaultCityForCountry(sel.value);
    writeSavedRegion({ code: sel.value, city: cityVal });
    applyRegionToPill();
    dialog.close();
    showToast(`Delivery preview: ${regionLabel(readSavedRegion())} — live routing ships with the app.`);
  });
}

document.getElementById("btn-find-food")?.addEventListener("click", () => {
  document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
  homeSearchEl?.focus();
});

initLocationDialog();

fillDishSelect();
initMenuCategoryNav();
renderMenuCards();

function updateWeeklyPlanOrder() {
  if (!weeklyPlanSummary || !weeklyPlanOrderLink) return;

  const selectedPlans = Array.from(weeklyPlanChecks)
    .filter((input) => input.checked)
    .map((input) => `${input.dataset.planDay}: ${input.dataset.planName}`);

  if (selectedPlans.length === 0) {
    weeklyPlanSummary.textContent = "No weekly plan selected yet.";
    weeklyPlanOrderLink.href = "https://wa.me/351931430970";
    return;
  }

  weeklyPlanSummary.textContent = `${selectedPlans.length} weekly plan option(s) selected.`;
  const planText = encodeURIComponent(`Hello, I want to order these weekly plan option(s): ${selectedPlans.join(" | ")}`);
  weeklyPlanOrderLink.href = `https://wa.me/351931430970?text=${planText}`;
}

weeklyPlanChecks.forEach((input) => {
  input.addEventListener("change", updateWeeklyPlanOrder);
});

updateWeeklyPlanOrder();

