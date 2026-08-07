/**
 * Single bounded SCAN UX case (hard wall via parent timeout <=45s).
 *
 * Usage:
 *   CASE=idle-click VP=1324x977 IDLE_MS=30000 node scripts/accept-scan-case.mjs
 *   CASE=early VP=1324x977 node scripts/accept-scan-case.mjs
 *   CASE=keyboard VP=1324x977 node scripts/accept-scan-case.mjs
 *   CASE=preset VP=1324x977 node scripts/accept-scan-case.mjs
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.ACCEPT_BASE || "http://127.0.0.1:4173/off-course";
const OUT = path.join(__dirname, "..", "artifacts", "accept-scan-cases");
const CASE = process.env.CASE || "idle-click";
const VP = process.env.VP || "1324x977";
const IDLE_MS = Number(process.env.IDLE_MS || 8000);

const VIEWPORTS = {
  "1324x977": { width: 1324, height: 977 },
  "1440x900": { width: 1440, height: 900 },
  "390x844": { width: 390, height: 844 },
  "430x932": { width: 430, height: 932 },
};

function fail(msg) {
  console.log(JSON.stringify({ ok: false, case: CASE, vp: VP, error: msg }));
  process.exit(1);
}

async function waitPhase(page, phase, timeout = 12000) {
  await page.waitForFunction(
    (p) => document.querySelector(".home-radio")?.getAttribute("data-phase") === p,
    phase,
    { timeout }
  );
}

async function scanCenter(page) {
  return page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Scan radio signal"]');
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return {
      x: r.left + r.width / 2,
      y: r.top + r.height / 2,
      w: r.width,
      h: r.height,
    };
  });
}

async function state(page) {
  return page.evaluate(() => ({
    phase: document.querySelector(".home-radio")?.getAttribute("data-phase"),
    lcd: document.querySelector(".radio-lcd-text")?.textContent?.trim() || "",
    action:
      document.querySelector(".home-radio")?.getAttribute("data-last-scan-action") ||
      "",
  }));
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const vp = VIEWPORTS[VP];
  if (!vp) fail(`unknown viewport ${VP}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: vp,
    deviceScaleFactor: 1,
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  const result = { ok: true, case: CASE, vp: VP, idleMs: IDLE_MS };

  try {
    if (CASE === "idle-click") {
      await page.goto(`${BASE}/?c=${CASE}&vp=${VP}&t=${Date.now()}`, {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      });
      await waitPhase(page, "await-scan", 12000);
      await page.waitForTimeout(IDLE_MS);
      const before = await state(page);
      result.before = before;
      if (before.phase !== "await-scan" || before.lcd !== "PRESS SCAN") {
        fail(`idle ${IDLE_MS}ms expected PRESS SCAN, got ${before.phase}/${before.lcd}`);
      }
      const c = await scanCenter(page);
      if (!c) fail("missing scan button");
      const t0 = Date.now();
      await page.mouse.click(c.x, c.y);
      await page.waitForFunction(
        () => {
          const lcd =
            document.querySelector(".radio-lcd-text")?.textContent?.trim() || "";
          const phase = document
            .querySelector(".home-radio")
            ?.getAttribute("data-phase");
          return lcd === "TUNING..." || phase === "tuning";
        },
        { timeout: 400 }
      );
      const ms = Date.now() - t0;
      const after = await state(page);
      result.click = { center: c, ms, after };
      if (after.lcd !== "TUNING..." && after.phase !== "tuning") {
        fail(`coord click did not tune (${ms}ms)`);
      }
      if (ms > 400) fail(`tune feedback ${ms}ms > 400ms`);
      await page.screenshot({
        path: path.join(OUT, `${VP}__idle${IDLE_MS}-click.png`),
        fullPage: false,
      });
    } else if (CASE === "early") {
      await page.goto(`${BASE}/?c=early&t=${Date.now()}`, {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      });
      await waitPhase(page, "searching", 8000);
      const c = await scanCenter(page);
      await page.mouse.click(c.x, c.y);
      await page.waitForFunction(
        () =>
          document.querySelector(".home-radio")?.getAttribute("data-phase") ===
            "tuning" ||
          document.querySelector(".radio-lcd-text")?.textContent?.trim() ===
            "TUNING...",
        { timeout: 500 }
      );
      result.after = await state(page);
      if (result.after.phase === "searching") fail("early click ignored");
    } else if (CASE === "keyboard") {
      await page.goto(`${BASE}/?c=key&t=${Date.now()}`, {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      });
      await waitPhase(page, "await-scan", 12000);
      await page.locator(".home-radio").focus();
      await page.keyboard.press("Enter");
      await waitPhase(page, "tuning", 1000);
      result.after = await state(page);
    } else if (CASE === "preset") {
      await page.goto(`${BASE}/?c=preset&t=${Date.now()}`, {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      });
      await waitPhase(page, "await-scan", 12000);
      await page.locator(".home-radio").focus();
      await page.keyboard.press("Escape");
      await waitPhase(page, "settle", 3000);
      await page.locator('a[aria-label="Frequency 2: GET FOUND"]').click();
      await page.waitForURL(/get-found/, { timeout: 5000 });
      result.presetOk = page.url().includes("get-found");
      if (!result.presetOk) fail("preset routing failed");
    } else {
      fail(`unknown CASE ${CASE}`);
    }
  } catch (e) {
    await browser.close().catch(() => {});
    fail(String(e.message || e));
  }

  await browser.close();
  fs.writeFileSync(
    path.join(OUT, `${CASE}__${VP}__idle${IDLE_MS}.json`),
    JSON.stringify(result, null, 2)
  );
  console.log(JSON.stringify(result));
}

main().catch((e) => fail(String(e.message || e)));
