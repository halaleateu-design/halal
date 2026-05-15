/**
 * GO — full scripted flow test (merchant apply, rider apply, order, accept, rider job, tracking).
 * Run with backend: node src/server.js  →  BASE_URL=http://localhost:3001/api/v1 node scripts/e2e-delivery-flow.mjs
 */

const BASE = (process.env.BASE_URL || "http://localhost:3001/api/v1").replace(/\/$/, "");
const PASSWORD = process.env.E2E_PASSWORD || "E2EFlowPass123!";
const slug = `${Date.now()}-${Math.floor(Math.random() * 9999)}`;
const merchantEmail = `merchant-e2e-${slug}@test.local`;
const riderEmail = `rider-e2e-${slug}@test.local`;
const guestEmail = `guest-e2e-${slug}@test.local`;

async function req(path, { method = "GET", headers = {}, body, token } = {}) {
  const h = new Headers(headers);
  if (token) h.set("Authorization", `Bearer ${token}`);
  if (body && !(body instanceof FormData)) {
    h.set("Content-Type", "application/json");
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: h,
    body: body instanceof FormData ? body : body != null ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { _raw: text };
  }
  if (!res.ok) {
    const err = new Error(`${method} ${path} → ${res.status}: ${json.error || text?.slice?.(0, 200)}`);
    err.status = res.status;
    err.data = json;
    throw err;
  }
  return json;
}

function ok(cond, msg) {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}

console.log(`\n[E2E] BASE=${BASE}`);
console.log(`[E2E] merchant=${merchantEmail} rider=${riderEmail}\n`);

// 1–2 Register merchant + rider
const regMerchant = await req("/auth/register", {
  method: "POST",
  body: {
    email: merchantEmail,
    password: PASSWORD,
    name: "E2E Merchant Owner",
    phone: "+351900000001",
    role: "merchant",
    tradingName: "E2E Test Kitchen",
    city: "Porto",
    category: "Restaurant",
    country: "PT",
  },
});
ok(regMerchant.ok && regMerchant.token, "merchant register");
const tokenM = regMerchant.token;
const merchantUserId = regMerchant.user.id;
console.log("[1] merchant account created", merchantUserId);

// Merchant application request (explicit /merchants/apply)
const mForm = new FormData();
mForm.append("biz-name", "E2E Test Kitchen Applied");
mForm.append("biz-email", merchantEmail);
mForm.append("biz-city", "Porto");
mForm.append("biz-category", "Restaurant");
mForm.append("tradingName", "E2E Test Kitchen Applied");
await req("/merchants/apply", { method: "POST", body: mForm, token: tokenM });
console.log("[2] merchant apply submitted");

const regRider = await req("/auth/register", {
  method: "POST",
  body: {
    email: riderEmail,
    password: PASSWORD,
    name: "E2E Rider",
    phone: "+351900000002",
    role: "rider",
    baseCity: "Porto",
    vehicle: "Scooter",
    country: "PT",
    postalCode: "4000-001",
    defaultCity: "Porto",
  },
});
ok(regRider.ok && regRider.token, "rider register");
const tokenR = regRider.token;
console.log("[3] rider account created");

await req("/riders/apply", {
  method: "POST",
  body: {
    fullName: "E2E Rider",
    phone: "+351900000002",
    baseCity: "Porto",
    vehicle: "Scooter",
    email: riderEmail,
    riderEmail,
    country: "PT",
    postal_code: "4000-001",
    notes: "e2e waitlist row",
  },
});
console.log("[4] rider apply submitted");

// Merchant shop coordinates (pickup pin)
await req("/profile", {
  method: "PATCH",
  token: tokenM,
  body: {
    merchantAddress: "Rua E2E 1, Porto",
    merchantLatitude: "41.1500",
    merchantLongitude: "-8.6150",
  },
});
console.log("[5] merchant profile address + coords saved");

// 6 Guest delivery order → restaurant notified (API); internal row created
const orderPayload = await req("/orders", {
  method: "POST",
  body: {
    merchantUserId,
    deliveryAddress: "Rua Customer 42, Porto (door bell E2E)",
    deliveryLat: "41.1450",
    deliveryLng: "-8.6200",
    guestName: "E2E Guest",
    guestPhone: "+351900000099",
    guestEmail,
    items: [
      { qty: 1, name: "Test dish A" },
      { qty: 2, name: "Test dish B" },
    ],
    notes: "e2e order",
  },
});
ok(orderPayload.ok && orderPayload.order?.id, "place order");
const orderId = orderPayload.order.id;
const code = orderPayload.order.trackingCode;
console.log("[6] order placed", code, orderId);

// 7 Merchant accept
await req(`/orders/merchant/${encodeURIComponent(orderId)}/accept`, {
  method: "POST",
  body: {},
  token: tokenM,
});
console.log("[7] merchant accepted order");

let pool = await req("/orders/rider/pool", { token: tokenR });
ok((pool.orders || []).some((o) => o.id === orderId), "order visible in rider pool");
console.log("[8] rider pool OK");

await req(`/orders/rider/${encodeURIComponent(orderId)}/claim`, { method: "POST", body: {}, token: tokenR });
console.log("[9] rider claimed");

await req(`/orders/rider/${encodeURIComponent(orderId)}/location`, {
  method: "PATCH",
  token: tokenR,
  body: { lat: 41.152, lng: -8.618 },
});
console.log("[10] rider GPS pushed");

await req(`/orders/rider/${encodeURIComponent(orderId)}/status`, {
  method: "POST",
  token: tokenR,
  body: { status: "picked_up" },
});
await req(`/orders/rider/${encodeURIComponent(orderId)}/status`, {
  method: "POST",
  token: tokenR,
  body: { status: "delivering" },
});
await req(`/orders/rider/${encodeURIComponent(orderId)}/status`, {
  method: "POST",
  token: tokenR,
  body: { status: "delivered" },
});
console.log("[11] rider completed delivery stages");

const track = await req(`/track/${encodeURIComponent(code)}`);
ok(track.ok, "track fetch");
ok(track.deliveryStatus === "delivered" || track.status === "delivered", `final track status (${track.status} / ${track.deliveryStatus})`);
console.log("[12] public track shows delivered ✓");

console.log("\n=== E2E PASSED ===\n");
