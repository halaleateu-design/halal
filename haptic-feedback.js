/**
 * Subtle tap feedback — Vibration API on supported phones + press animation everywhere.
 */
(function () {
  if (window.__ehHapticLoaded) return;
  window.__ehHapticLoaded = true;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canVibrate =
    !reducedMotion && typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

  const PATTERNS = {
    light: 8,
    medium: [10, 5, 12],
    strong: [16, 8, 18],
  };

  const SELECTOR =
    'button:not([disabled]), input[type="submit"]:not([disabled]), input[type="button"]:not([disabled]), ' +
    '[role="button"]:not([aria-disabled="true"]), .btn, .btn-nav-solid, .btn-nav-ghost, .btn-eats-primary, .btn-eats-secondary, ' +
    '.eh-share-btn, .eh-wl-form button, a.eh-launch-cta-outline, a.btn, label.btn';

  let lastPulse = 0;

  function injectStyles() {
    if (document.getElementById("eh-haptic-styles")) return;
    const style = document.createElement("style");
    style.id = "eh-haptic-styles";
    style.textContent = `
      @media (prefers-reduced-motion: no-preference) {
        ${SELECTOR.split(",").map((s) => s.trim()).join(", ")} {
          transition: transform 0.14s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.14s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .eh-haptic-press {
          transform: scale(0.96) !important;
        }
        .btn-eats-primary.eh-haptic-press,
        .eh-wl-form button.eh-haptic-press,
        .eh-share-btn.eh-haptic-press {
          transform: scale(0.94) !important;
          filter: brightness(1.05);
        }
      }
    `;
    document.head.appendChild(style);
  }

  function tier(el) {
    if (
      el.matches(
        '[type="submit"], .btn-eats-primary, .btn-nav-solid, .eh-wl-form button, .eh-share-btn, .btn.primary'
      )
    ) {
      return "medium";
    }
    if (el.matches(".btn-eats-secondary, .btn-nav-ghost, .eh-launch-cta-outline")) return "light";
    return "light";
  }

  function vibrate(t) {
    if (!canVibrate) return;
    try {
      navigator.vibrate(PATTERNS[t] || PATTERNS.light);
    } catch (_) {
      /* ignore */
    }
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
    window.setTimeout(clear, 220);
  }

  function onPointerDown(e) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const el = e.target.closest(SELECTOR);
    if (!el || el.disabled || el.getAttribute("aria-disabled") === "true") return;
    if (el.tagName === "A" && !el.getAttribute("href") && !el.getAttribute("role")) return;

    const now = Date.now();
    if (now - lastPulse < 70) return;
    lastPulse = now;

    const t = tier(el);
    vibrate(t);
    pressVisual(el);
  }

  injectStyles();
  document.addEventListener("pointerdown", onPointerDown, { passive: true, capture: true });
})();
