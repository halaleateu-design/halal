/**
 * Starts the API on a free port with a throwaway SQLite file, runs e2e-delivery-flow.mjs, stops the server.
 *
 *   node scripts/run-e2e-automated.mjs
 *
 * Env: E2E_PORT (default 3012), E2E_DB (default ./data/e2e-automated.db path relative to backend/)
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const backendDir = path.join(repoRoot, "backend");
const e2eScript = path.join(__dirname, "e2e-delivery-flow.mjs");

const port = String(process.env.E2E_PORT || "3012");
const dbRelative = process.env.E2E_DB || "data/e2e-automated.db";
const dbAbs = path.join(backendDir, dbRelative);

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForHealth(base, maxMs = 25000) {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${base.replace(/\/$/, "")}/health`);
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) return;
    } catch {
      /* not up yet */
    }
    await sleep(150);
  }
  throw new Error(`Health check failed within ${maxMs}ms (${base}/health)`);
}

function unlinkQuiet(p) {
  try {
    fs.unlinkSync(p);
  } catch {
    /* no file */
  }
}

async function main() {
  fs.mkdirSync(path.dirname(dbAbs), { recursive: true });
  unlinkQuiet(dbAbs);

  const baseUrl = `http://127.0.0.1:${port}/api/v1`;
  const env = {
    ...process.env,
    PORT: port,
    DATABASE_PATH: dbRelative.replace(/\\/g, "/"),
  };

  console.log("[e2e-runner] Starting server…");
  console.log(`[e2e-runner] PORT=${port} DATABASE_PATH=${dbRelative}`);
  console.log(`[e2e-runner] BASE_URL=${baseUrl}`);

  const server = spawn(process.execPath, ["src/server.js"], {
    cwd: backendDir,
    env,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });

  let stderrBuf = "";
  server.stderr?.on("data", (chunk) => {
    stderrBuf += chunk.toString();
  });

  const stop = () => {
    try {
      if (process.platform === "win32") {
        server.kill();
      } else {
        server.kill("SIGTERM");
      }
    } catch {
      /* ignore */
    }
  };

  server.on("error", (err) => console.error("[e2e-runner] spawn error:", err));

  try {
    await waitForHealth(baseUrl);
    console.log("[e2e-runner] Server healthy. Running scripted flow…\n");

    const exitCode = await new Promise((resolve) => {
      const child = spawn(process.execPath, [e2eScript], {
        cwd: repoRoot,
        env: { ...process.env, BASE_URL: baseUrl },
        stdio: "inherit",
      });
      child.on("close", (code) => resolve(code ?? 1));
      child.on("error", () => resolve(1));
    });

    if (exitCode !== 0) {
      if (stderrBuf.trim()) console.error("[e2e-runner] Server stderr:\n", stderrBuf.slice(-4000));
    }

    console.log("\n[e2e-runner] Done. Stopping server and removing temp DB.");
    stop();
    await sleep(500);
    unlinkQuiet(dbAbs);
    unlinkQuiet(`${dbAbs}-wal`);
    unlinkQuiet(`${dbAbs}-shm`);

    process.exit(exitCode);
  } catch (err) {
    console.error("[e2e-runner] FAILED:", err?.message || err);
    if (stderrBuf.trim()) console.error(stderrBuf.slice(-4000));
    stop();
    await sleep(400);
    process.exit(1);
  }
}

main();
