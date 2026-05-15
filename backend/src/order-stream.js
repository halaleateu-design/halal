import { EventEmitter } from "events";

const emitter = new EventEmitter();
emitter.setMaxListeners(2000);

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {string[]} channels
 */
export function attachOrderSse(req, res, channels) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  if (typeof res.flushHeaders === "function") res.flushHeaders();

  /** @type {(chunk: string) => void} */
  const write = (chunk) => {
    if (!res.writableEnded) res.write(chunk);
  };

  const fire = (payload) => write(`data: ${JSON.stringify({ ...payload, t: Date.now() })}\n\n`);

  fire({ type: "connected", channels });

  /** @type {Array<[string, (p: unknown) => void]>} */
  const pairs = [];
  for (const ch of channels) {
    /** @type {(payload: unknown) => void} */
    const listener = (payload) => {
      fire(payload);
    };
    emitter.on(ch, listener);
    pairs.push([ch, listener]);
  }

  const ping = setInterval(() => write(`: ping\n\n`), 28000);

  req.on("close", () => {
    clearInterval(ping);
    for (const [ch, listener] of pairs) {
      emitter.off(ch, listener);
    }
    try {
      res.end();
    } catch {
      /* ignore */
    }
  });

  req.on("aborted", () => {
    clearInterval(ping);
    for (const [ch, listener] of pairs) {
      emitter.off(ch, listener);
    }
  });
}

/**
 * @param {string} channel
 * @param {Record<string, unknown>} payload
 */
export function publishOrderEvent(channel, payload) {
  emitter.emit(channel, payload);
}

export function riderStreamChannels(userId) {
  return [`riders`, `rider:${userId}`];
}
