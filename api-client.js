/**
 * GO API client — Halal eat EU
 */
(function () {
  const TOKEN_KEY = "go_auth_token";

  function apiBase() {
    const fromSite = window.GOSite?.apiBaseUrl;
    if (fromSite) return String(fromSite).replace(/\/$/, "");
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
      return `${location.protocol}//${location.hostname}:3001/api/v1`;
    }
    return "/api/v1";
  }

  function getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  function setToken(token) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  }

  async function request(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    let body = options.body;
    if (body && !(body instanceof FormData) && typeof body === "object") {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(body);
    }

    const res = await fetch(`${apiBase()}${path}`, { ...options, headers, body });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || data.message || `Request failed (${res.status})`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  const api = {
    getToken,
    setToken,
    clearSession() {
      setToken(null);
    },
    async register(payload) {
      const data = await request("/auth/register", { method: "POST", body: payload });
      if (data.token) setToken(data.token);
      return data;
    },
    async login(payload) {
      const data = await request("/auth/login", { method: "POST", body: payload });
      if (data.token) setToken(data.token);
      return data;
    },
    async me() {
      return request("/auth/me");
    },
    async getProfile() {
      return request("/profile");
    },
    async updateProfile(payload) {
      return request("/profile", { method: "PATCH", body: payload });
    },
    async submitMerchant(formEl) {
      const fd = new FormData(formEl);
      return request("/merchants/apply", { method: "POST", body: fd });
    },
    async submitRider(formEl) {
      const fd = new FormData(formEl);
      const body = Object.fromEntries(fd.entries());
      return request("/riders/apply", { method: "POST", body });
    },
    async health() {
      return request("/health");
    },
    async ready() {
      return request("/ready");
    },
    async listShops() {
      return request("/orders/shops");
    },
    async createOrder(body) {
      return request("/orders", { method: "POST", body });
    },
    async myCustomerOrders() {
      return request("/orders/customer/mine");
    },
    async myMerchantOrders() {
      return request("/orders/merchant/mine");
    },
    async acceptMerchantOrder(orderId) {
      return request(`/orders/merchant/${encodeURIComponent(orderId)}/accept`, { method: "POST", body: {} });
    },
    async riderPool() {
      return request("/orders/rider/pool");
    },
    async riderMine() {
      return request("/orders/rider/mine");
    },
    async riderClaim(orderId) {
      return request(`/orders/rider/${encodeURIComponent(orderId)}/claim`, { method: "POST", body: {} });
    },
    async riderReportLocation(orderId, lat, lng) {
      return request(`/orders/rider/${encodeURIComponent(orderId)}/location`, {
        method: "PATCH",
        body: { lat, lng },
      });
    },
    async riderOrderStatus(orderId, status) {
      return request(`/orders/rider/${encodeURIComponent(orderId)}/status`, { method: "POST", body: { status } });
    },
    /** Server-Sent Events URL (pass JWT as query token — browsers cannot set headers on EventSource). */
    ordersStreamUrl(role) {
      const token = getToken();
      if (!token) return null;
      const base = apiBase();
      const path =
        role === "merchant" ? "/orders/stream/merchant" : role === "rider" ? "/orders/stream/rider" : "/orders/stream/customer";
      return `${base}${path}?token=${encodeURIComponent(token)}`;
    },
    googleSignInUrl() {
      return `${apiBase()}/auth/google`;
    },
    async ssoStatus() {
      return request("/auth/google/status");
    },
  };

  window.GOApi = api;
  window.TayyApi = api;
})();
