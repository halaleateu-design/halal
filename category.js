const params = new URLSearchParams(window.location.search);
const group = params.get("group") || "Family Meals";
const menuData = window.MENU_DATA?.items || {};

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

const titleEl = document.getElementById("category-title");
const subtitleEl = document.getElementById("category-subtitle");
const gridEl = document.getElementById("category-grid");
const summaryEl = document.getElementById("bulk-summary");
const orderBtnEl = document.getElementById("bulk-order-btn");

function applyCategoryChrome() {
  if (subtitleEl) subtitleEl.textContent = tr("shell_cat_subtitle").replace("{group}", group);
  if (orderBtnEl) orderBtnEl.textContent = tr("shell_cat_order_btn");
  document.querySelectorAll(".js-pick-label-text").forEach((el) => {
    el.textContent = tr("shell_cat_add_item");
  });
}

function setDynamicMeta(groupName, totalItems) {
  const safeGroup = groupName || "Menu";
  document.title = `${safeGroup} · Tayy · Porto`;

  const description = `Order ${safeGroup} on Tayy (featured partner kitchen). Browse ${totalItems} halal items, select multiple dishes, and place one WhatsApp order in Porto.`;
  const keywords = `${safeGroup.toLowerCase()} porto, halal ${safeGroup.toLowerCase()} porto, halal food delivery porto, Tayy`;
  const canonicalUrl = `https://fanciful-moxie-6b5bba.netlify.app/category.html?group=${encodeURIComponent(safeGroup)}`;

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

titleEl.textContent = group;
applyCategoryChrome();

const selected = new Set();

function formatPrice(price) {
  return `EUR ${price.toFixed(2)}`;
}

function fallbackImage(itemName) {
  return `https://placehold.co/900x600/f2f5fa/1f2533?text=${encodeURIComponent(itemName)}`;
}

async function applyStandardImage(imageEl, itemName, originalUrl) {
  const utils = window.Tayy_IMAGE_UTILS || window.HFC_IMAGE_UTILS;
  if (!utils?.resolveItemImage) {
    imageEl.src = originalUrl || fallbackImage(itemName);
    return;
  }

  const fallback = originalUrl || fallbackImage(itemName);
  imageEl.src = await utils.resolveItemImage(itemName, fallback);
}

function updateBulkSummary() {
  if (selected.size === 0) {
    summaryEl.textContent = tr("shell_cat_bulk_empty");
    orderBtnEl.href = "https://wa.me/351931430970";
    return;
  }

  const names = Array.from(selected);
  const total = names.reduce((sum, name) => sum + (menuData[name]?.price || 0), 0);
  const totalStr = formatPrice(total);
  summaryEl.textContent = tr("shell_cat_bulk_summary").replace("{count}", String(selected.size)).replace("{total}", totalStr);
  const orderText = encodeURIComponent(`Hello, I want to order these items: ${names.join(", ")}. Total: ${formatPrice(total)}`);
  orderBtnEl.href = `https://wa.me/351931430970?text=${orderText}`;
}

const entries = Object.entries(menuData).filter(([, value]) => value.groups?.includes(group));
setDynamicMeta(group, entries.length);

entries.forEach(([name, info]) => {
  const card = document.createElement("article");
  card.className = "menu-item";
  card.innerHTML = `
    <img src="${fallbackImage(name)}" alt="${name}" class="category-item-image">
    <h4>${name}</h4>
    <p>${info.points[0]}</p>
    <p class="category-price">${formatPrice(info.price)}</p>
    <label class="pick-label">
      <input type="checkbox" data-item="${name}">
      <span class="js-pick-label-text">Add this item</span>
    </label>
  `;

  const checkbox = card.querySelector("input[type='checkbox']");
  const image = card.querySelector(".category-item-image");
  if (image) {
    applyStandardImage(image, name, info.image);
    image.onerror = () => {
      image.src = fallbackImage(name);
    };
  }
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      selected.add(name);
    } else {
      selected.delete(name);
    }
    updateBulkSummary();
  });

  gridEl.appendChild(card);
});

applyCategoryChrome();

document.getElementById("lang-select")?.addEventListener("change", () => {
  applyCategoryChrome();
  updateBulkSummary();
});

updateBulkSummary();
