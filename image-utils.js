(() => {
  const CACHE_KEY = "GO_image_cache_v8";
  const memoryCache = new Map();

  try {
    const stored = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    Object.entries(stored).forEach(([key, value]) => {
      if (typeof value === "string" && value) {
        memoryCache.set(key, value);
      }
    });
  } catch (_error) {
    // Ignore parse/storage errors.
  }

  function saveCache() {
    try {
      const payload = Object.fromEntries(memoryCache.entries());
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch (_error) {
      // Ignore storage errors.
    }
  }

  function placeholder(itemName) {
    return `https://placehold.co/900x600/f2f5fa/1f2533?text=${encodeURIComponent(itemName)}`;
  }

  async function resolveItemImage(itemName, fallbackUrl = "") {
    const key = (itemName || "").trim().toLowerCase();
    if (!key) return fallbackUrl || placeholder("GO dish");

    const cached = memoryCache.get(key);
    if (cached) return cached;

    const finalUrl = fallbackUrl || placeholder(itemName);
    memoryCache.set(key, finalUrl);
    saveCache();
    return finalUrl;
  }

  const utils = { placeholder, resolveItemImage };
  window.GO_IMAGE_UTILS = utils;
  window.HFC_IMAGE_UTILS = utils;
})();
