import { Router } from "express";
import db from "../db.js";

const router = Router();

function normalizeCode(code) {
  return String(code || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function mapDeliveryToTrackStatus(deliveryStatus) {
  if (deliveryStatus === "pending_restaurant") return "preparing";
  if (deliveryStatus === "accepted") return "preparing";
  if (deliveryStatus === "rider_claimed") return "rider_assigned";
  if (["picked_up", "delivering", "delivered", "cancelled"].includes(deliveryStatus)) return deliveryStatus;
  return "preparing";
}

router.get("/:code", (req, res) => {
  try {
    const code = normalizeCode(req.params.code);
    if (!code || code.length < 4) {
      return res.status(400).json({ ok: false, error: "Invalid tracking code." });
    }

    const d = db.prepare("SELECT * FROM delivery_orders WHERE tracking_code = ? COLLATE NOCASE").get(code);
    if (d) {
      const riderLat = d.rider_live_lat != null ? Number(d.rider_live_lat) : null;
      const riderLng = d.rider_live_lng != null ? Number(d.rider_live_lng) : null;
      const destLat = d.delivery_lat != null ? Number(d.delivery_lat) : null;
      const destLng = d.delivery_lng != null ? Number(d.delivery_lng) : null;

      const trackStatus = mapDeliveryToTrackStatus(d.status);

      let mapsEmbedUrl = null;
      let destinationEmbedUrl = null;
      if (riderLat != null && riderLng != null && !Number.isNaN(riderLat) && !Number.isNaN(riderLng)) {
        mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(`${riderLat},${riderLng}`)}&z=14&output=embed`;
      }
      if (destLat != null && destLng != null && !Number.isNaN(destLat) && !Number.isNaN(destLng)) {
        destinationEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(`${destLat},${destLng}`)}&z=15&output=embed`;
      }

      return res.json({
        ok: true,
        code: d.tracking_code,
        status: trackStatus,
        deliveryStatus: d.status,
        restaurant: d.restaurant_name,
        customerLabel: d.customer_display_name,
        rider: riderLat != null && riderLng != null ? { lat: riderLat, lng: riderLng } : null,
        destination: destLat != null && destLng != null ? { lat: destLat, lng: destLng } : null,
        destinationEmbedUrl,
        updatedAt: d.updated_at,
        mapsEmbedUrl,
      });
    }

    const row = db.prepare("SELECT * FROM order_tracking WHERE tracking_code = ?").get(code);
    if (!row) {
      return res.status(404).json({ ok: false, error: "Order not found. Check your link or WhatsApp message." });
    }

    const riderLat = row.rider_lat != null ? Number(row.rider_lat) : null;
    const riderLng = row.rider_lng != null ? Number(row.rider_lng) : null;

    let mapsEmbedUrl = null;
    if (riderLat != null && riderLng != null && !Number.isNaN(riderLat) && !Number.isNaN(riderLng)) {
      mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(`${riderLat},${riderLng}`)}&z=15&output=embed`;
    }

    return res.json({
      ok: true,
      code: row.tracking_code,
      status: row.status,
      deliveryStatus: null,
      restaurant: row.restaurant_label,
      customerLabel: row.customer_label,
      rider: riderLat != null && riderLng != null ? { lat: riderLat, lng: riderLng } : null,
      destination:
        row.dest_lat != null && row.dest_lng != null
          ? { lat: Number(row.dest_lat), lng: Number(row.dest_lng) }
          : null,
      destinationEmbedUrl:
        row.dest_lat != null && row.dest_lng != null
          ? `https://www.google.com/maps?q=${encodeURIComponent(`${Number(row.dest_lat)},${Number(row.dest_lng)}`)}&z=15&output=embed`
          : null,
      updatedAt: row.updated_at,
      mapsEmbedUrl,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Could not load tracking." });
  }
});

export default router;
