function premToast(message, isError) {
  const el = document.getElementById("prem-toast");
  if (!el) return;
  el.textContent = message;
  el.classList.toggle("is-error", !!isError);
  el.classList.add("is-on");
  clearTimeout(premToast._t);
  premToast._t = setTimeout(() => {
    el.classList.remove("is-on", "is-error");
  }, 5200);
}

function setFormBusy(form, busy) {
  if (!form) return;
  form.querySelectorAll("button[type=submit], input[type=submit]").forEach((btn) => {
    btn.disabled = busy;
    if (busy) btn.dataset.prevLabel = btn.textContent;
    else if (btn.dataset.prevLabel) btn.textContent = btn.dataset.prevLabel;
  });
  form.classList.toggle("is-submitting", busy);
}

async function withApi(form, fn, successMsg) {
  if (!window.TayyApi) {
    premToast("API not loaded. Check site scripts.", true);
    return false;
  }
  setFormBusy(form, true);
  try {
    const data = await fn();
    premToast(data.message || successMsg);
    form.reset();
    const fileNote = document.getElementById("partner-file-status");
    if (fileNote) fileNote.textContent = "";
    return true;
  } catch (err) {
    premToast(err.message || "Something went wrong. Try again.", true);
    return false;
  } finally {
    setFormBusy(form, false);
  }
}

document.getElementById("partner-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  withApi(form, () => window.TayyApi.submitMerchant(form), "Application received.");
});

document.getElementById("partner-form")?.addEventListener("change", (event) => {
  const t = event.target;
  if (!(t instanceof HTMLInputElement) || t.type !== "file") return;
  const form = event.currentTarget;
  const out = document.getElementById("partner-file-status");
  if (!out || !(form instanceof HTMLFormElement)) return;
  const lines = [];
  form.querySelectorAll('input[type="file"]').forEach((inp) => {
    if (inp.files?.length) {
      lines.push(`${inp.name}: ${Array.from(inp.files).map((f) => f.name).join(", ")}`);
    }
  });
  out.textContent = lines.length ? lines.join(" · ") : "";
});

document.getElementById("rider-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  withApi(form, () => window.TayyApi.submitRider(form), "You're on the waitlist.");
});

document.getElementById("signup-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.target;
  const fd = new FormData(form);
  const ok = await withApi(
    form,
    () =>
      window.TayyApi.register({
        name: fd.get("name"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        password: fd.get("password"),
      }),
    "Account created — welcome to Tayy."
  );
  if (ok) setTimeout(() => { window.location.href = "index.html"; }, 1400);
});

document.getElementById("signin-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.target;
  const fd = new FormData(form);
  const ok = await withApi(
    form,
    () =>
      window.TayyApi.login({
        email: fd.get("email"),
        password: fd.get("password"),
      }),
    "Signed in successfully."
  );
  if (ok) setTimeout(() => { window.location.href = "index.html"; }, 1200);
});

function syncUeMenuDrawerBodyClass() {
  const anyOpen = !!document.querySelector("details.ue-menu[open]");
  document.body.classList.toggle("ue-menu-drawer-open", anyOpen);
}

function initHalalEatUeMenus() {
  if (window.__halalEatUeMenuInit) return;
  window.__halalEatUeMenuInit = true;

  document.querySelectorAll("details.ue-menu").forEach((details) => {
    const panel = details.querySelector(".ue-menu-panel");
    if (!panel || details.querySelector(".ue-menu-backdrop")) return;
    const backdrop = document.createElement("div");
    backdrop.className = "ue-menu-backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    details.insertBefore(backdrop, panel);
    backdrop.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      details.open = false;
      syncUeMenuDrawerBodyClass();
    });
  });

  document.addEventListener(
    "pointerdown",
    (event) => {
      const t = event.target;
      if (!(t instanceof Node)) return;
      document.querySelectorAll("details.ue-menu[open]").forEach((details) => {
        if (!details.contains(t)) details.open = false;
      });
      syncUeMenuDrawerBodyClass();
    },
    true
  );

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    document.querySelectorAll("details.ue-menu[open]").forEach((d) => {
      d.open = false;
    });
    syncUeMenuDrawerBodyClass();
  });

  document.addEventListener(
    "toggle",
    (event) => {
      const el = event.target;
      if (!(el instanceof HTMLDetailsElement) || !el.classList.contains("ue-menu")) return;
      syncUeMenuDrawerBodyClass();
    },
    true
  );

  document.querySelectorAll("details.ue-menu").forEach((details) => {
    details.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (link) details.open = false;
    });
  });

  document.querySelectorAll(".brand-wordmark--home").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelectorAll("details.ue-menu").forEach((d) => {
        d.open = false;
      });
      syncUeMenuDrawerBodyClass();
    });
  });
}

initHalalEatUeMenus();

function initAuthChoiceDialog() {
  const dlg = document.getElementById("auth-choice-dialog");
  if (!(dlg instanceof HTMLDialogElement)) return;

  function closeMenus() {
    document.querySelectorAll("details.ue-menu[open]").forEach((d) => {
      d.open = false;
    });
    if (typeof syncUeMenuDrawerBodyClass === "function") syncUeMenuDrawerBodyClass();
  }

  document.querySelectorAll(".js-open-auth-dialog").forEach((el) => {
    el.addEventListener("click", (event) => {
      event.preventDefault();
      closeMenus();
      dlg.showModal();
    });
  });

  document.getElementById("auth-choice-cancel")?.addEventListener("click", () => dlg.close());
  document.getElementById("auth-choice-guest")?.addEventListener("click", () => dlg.close());

  dlg.addEventListener("click", (event) => {
    if (event.target === dlg) dlg.close();
  });

  dlg.querySelectorAll('a[href^="sign"]').forEach((a) => {
    a.addEventListener("click", () => dlg.close());
  });
}

initAuthChoiceDialog();

document.addEventListener("click", (event) => {
  const btn = event.target.closest(".ue-menu-close");
  if (!btn) return;
  const details = btn.closest("details.ue-menu");
  if (details) {
    details.open = false;
    syncUeMenuDrawerBodyClass();
  }
});
