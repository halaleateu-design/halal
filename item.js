const itemDetails = window.MENU_DATA?.items || {};

const params = new URLSearchParams(window.location.search);
const itemName = params.get("item");

const imageEl = document.getElementById("detail-image");
const titleEl = document.getElementById("detail-title");
const priceEl = document.getElementById("detail-price");
const pointsEl = document.getElementById("detail-points");
const orderLinkEl = document.getElementById("detail-order-link");
const defaultFallback = "https://placehold.co/1200x800/f2f5fa/1f2533?text=Tayy+item";

function uiLang() {
  try {
    const sel = document.getElementById("lang-select");
    if (sel instanceof HTMLSelectElement && sel.value) return sel.value;
    return localStorage.getItem("halaleat_lang") || "en";
  } catch {
    return "en";
  }
}

function tr(key) {
  return window.TayyI18n?.t(uiLang(), key) || key;
}

function applyItemShellI18n() {
  document.querySelectorAll(".item-meta span[data-i18n]").forEach((el) => {
    const k = el.getAttribute("data-i18n");
    if (k) el.textContent = tr(k);
  });
}

function setDynamicMeta(itemName, details) {
  if (!itemName || !details) return;

  document.title = `${itemName} · Tayy · Porto`;
  const description = `${itemName} — EUR ${details.price.toFixed(2)}. ${details.points.join(" ")} Order via Tayy partner on WhatsApp in Porto.`;
  const keywords = `${itemName.toLowerCase()} porto, halal ${itemName.toLowerCase()}, halal food delivery porto, Tayy`;
  const canonicalUrl = `https://fanciful-moxie-6b5bba.netlify.app/item.html?item=${encodeURIComponent(itemName)}`;

  const ensureMeta = (attribute, key, value) => {
    let meta = document.head.querySelector(`meta[${attribute}="${key}"]`);
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute(attribute, key);
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", value);
  };

  ensureMeta("name", "description", description);
  ensureMeta("name", "keywords", keywords);
  ensureMeta("property", "og:title", document.title);
  ensureMeta("property", "og:description", description);
  ensureMeta("name", "twitter:title", document.title);
  ensureMeta("name", "twitter:description", description);

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", canonicalUrl);
}

async function setStandardImage(itemName, imageUrl) {
  const fallback = `https://placehold.co/1200x800/f2f5fa/1f2533?text=${encodeURIComponent(itemName)}`;
  const utils = window.Tayy_IMAGE_UTILS || window.HFC_IMAGE_UTILS;
  if (!utils?.resolveItemImage) {
    imageEl.src = imageUrl || fallback;
    return;
  }
  imageEl.src = await utils.resolveItemImage(itemName, imageUrl || fallback);
}

const details = itemDetails[itemName];

if (!details) {
  titleEl.textContent = tr("shell_item_not_found");
  priceEl.textContent = tr("shell_item_not_found_hint");
  pointsEl.innerHTML = "";
  imageEl.src = defaultFallback;
} else {
  setDynamicMeta(itemName, details);
  setStandardImage(itemName, details.image);
  imageEl.onerror = () => {
    imageEl.src = `https://placehold.co/1200x800/f2f5fa/1f2533?text=${encodeURIComponent(itemName)}`;
  };
  imageEl.alt = itemName;
  titleEl.textContent = itemName;
  priceEl.textContent = tr("shell_item_price").replace("{price}", details.price.toFixed(2));
  pointsEl.innerHTML = details.points.map((point) => `<li>${point}</li>`).join("");
  const text = encodeURIComponent(`Hello, I want to order: ${itemName} (EUR ${details.price.toFixed(2)})`);
  orderLinkEl.href = `https://wa.me/351931430970?text=${text}`;
}
applyItemShellI18n();

document.getElementById("lang-select")?.addEventListener("change", () => {
  applyItemShellI18n();
  if (!details) {
    titleEl.textContent = tr("shell_item_not_found");
    priceEl.textContent = tr("shell_item_not_found_hint");
    return;
  }
  priceEl.textContent = tr("shell_item_price").replace("{price}", details.price.toFixed(2));
});
