/**
 * Tap feedback — vibration (Android) + press friction + optional success/error pulse.
 */
(function () {
  if (window.__ehHapticLoaded) return;
  window.__ehHapticLoaded = true;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canVibrate =
    !reducedMotion && typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

  const PATTERNS = {
    light: 14,
    medium: [18, 10, 22],
    strong: [28, 14, 32],
    success: [12, 6, 12, 6, 20],
    error: [40, 20, 40],
  };

  const SELECTOR =
    'button:not([disabled]), input[type="submit"]:not([disabled]), input[type="button"]:not([disabled]), ' +
    '[role="button"]:not([aria-disabled="true"]), .btn, .btn-nav-solid, .btn-nav-ghost, .btn-eats-primary, .btn-eats-secondary, ' +
    '.eh-share-btn, .eh-wl-form button, .eh-btn-primary, .eh-track-form button, a.eh-launch-cta-outline, a.btn, label.btn, ' +
    '.go-mobile-app__card, .go-mobile-tabbar a, a.eh-btn-primary';

  let lastPulse = 0;

  function injectStyles() {
    if (document.getElementById("eh-haptic-styles")) return;
    const style = document.createElement("style");
    style.id = "eh-haptic-styles";
    style.textContent = `
      @media (prefers-reduced-motion: no-preference) {
        ${SELECTOR.split(",").map((s) => s.trim()).join(", ")} {
          transition: transform 0.12s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.12s ease, filter 0.12s ease;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .eh-haptic-press {
          transform: scale(0.95) !important;
          box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.12);
        }
        .eh-btn-primary.eh-haptic-press,
        .eh-track-form button.eh-haptic-press,
        .go-mobile-app__card.eh-haptic-press {
          transform: scale(0.96) !important;
        }
        .eh-btn-loading {
          opacity: 0.85;
          pointer-events: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function vibrate(kind) {
    if (!canVibrate) return;
    try {
      navigator.vibrate(PATTERNS[kind] || PATTERNS.light);
    } catch (_) {
      /* ignore */
    }
  }

  window.__ehHapticPulse = function (kind) {
    vibrate(kind === "error" ? "error" : kind === "success" ? "success" : "medium");
  };

  function tier(el) {
    if (
      el.matches(
        '[type="submit"], .btn-eats-primary, .btn-nav-solid, .eh-wl-form button, .eh-share-btn, .eh-btn-primary, .eh-track-form button, .go-mobile-app__card--primary, .btn.primary'
      )
    ) {
      return "medium";
    }
    if (el.matches(".go-mobile-app__card, .go-mobile-tabbar a")) return "light";
    if (el.matches(".btn-eats-secondary, .btn-nav-ghost, .eh-launch-cta-outline")) return "light";
    return "light";
  }

  function pressVisual(el) {
    if (reducedMotion) return;
    el.classList.add("eh-haptic-press");
    const clear = () => {
      el.classList.remove("eh-haptic-press");
      el.removeEventListener("pointerup", clear);
      el.removeEventListener("pointercancel", clear);
      el.removeEventListener("pointerleave", clear);
    };
    el.addEventListener("pointerup", clear, { once: true });
    el.addEventListener("pointercancel", clear, { once: true });
    el.addEventListener("pointerleave", clear, { once: true });
    window.setTimeout(clear, 240);
  }

  function onPointerDown(e) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const el = e.target.closest(SELECTOR);
    if (!el || el.disabled || el.getAttribute("aria-disabled") === "true") return;
    if (el.tagName === "A" && !el.getAttribute("href") && el.getAttribute("role") !== "button") return;

    const now = Date.now();
    if (now - lastPulse < 55) return;
    lastPulse = now;

    vibrate(tier(el));
    pressVisual(el);
  }

  injectStyles();
  document.addEventListener("pointerdown", onPointerDown, { passive: true, capture: true });
})();
