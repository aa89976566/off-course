/**
 * Human-paced SCAN UX regression — no locator.click; physical coordinates only.
 * Timings (from ready):
 *   0.9s → SEARCHING...
 *   3.9s → PRESS SCAN (stays indefinitely; no auto-advance)
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.ACCEPT_BASE || "http://127.0.0.1:4173/off-course";
const OUT = path.join(__dirname, "..", "artifacts", "accept-scan-ux");

const VIEWPORTS = [
  { name: "1324x977", width: 1324, height: 977 },
  { name: "1440x900", width: 1440, height: 900 },
  { name: "390x844", width: 390, height: 844 },
  { name: "430x932", width: 430, height: 932 },
];

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
    const r = btn.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
  });
}

async function lcdAndPhase(page) {
  return page.evaluate(() => ({
    phase: document.querySelector(".home-radio")?.getAttribute("data-phase"),
    lcd: document.querySelector(".radio-lcd-text")?.textContent?.trim() || "",
    action:
      document.querySelector(".home-radio")?.getAttribute("data-last-scan-action") ||
      "",
    pressed: !!document.querySelector(".radio-scan-hit.is-pressed"),
  }));
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = {
    ok: true,
    failures: [],
    timings: {
      searchingAtMs: 900,
      pressScanAtMs: 3900,
      autoAdvance: "none",
    },
    checks: [],
  };

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();
    const check = { vp: vp.name };

    // —— 1) Wait 8s idle: must still be PRESS SCAN ——
    await page.goto(`${BASE}/?uxIdle=${Date.now()}`, {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    await waitPhase(page, "await-scan");
    await page.waitForTimeout(8000);
    const idle8 = await lcdAndPhase(page);
    check.idle8s = idle8;
    if (idle8.phase !== "await-scan" || idle8.lcd !== "PRESS SCAN") {
      report.ok = false;
      report.failures.push(
        `${vp.name}: after 8s idle expected PRESS SCAN, got ${idle8.phase}/${idle8.lcd}`
      );
    }

    // —— 2) Physical coordinate click → TUNING within 250ms ——
    const c = await scanCenter(page);
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
      { timeout: 250 }
    );
    const afterClick = await lcdAndPhase(page);
    const dt = Date.now() - t0;
    check.delayedClick = { center: c, after: afterClick, ms: dt };
    if (afterClick.lcd !== "TUNING..." && afterClick.phase !== "tuning") {
      report.ok = false;
      report.failures.push(`${vp.name}: delayed click did not tune (${dt}ms)`);
    }
    if (dt > 250) {
      report.ok = false;
      report.failures.push(`${vp.name}: tune feedback took ${dt}ms > 250ms`);
    }

    await page.screenshot({
      path: path.join(OUT, `${vp.name}__after-delayed-click.png`),
      fullPage: false,
    });

    // —— 3) Early click during SEARCHING must not be ignored ——
    await page.goto(`${BASE}/?uxEarly=${Date.now()}`, {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    await waitPhase(page, "searching");
    const earlyC = await scanCenter(page);
    await page.mouse.click(earlyC.x, earlyC.y);
    await page.waitForFunction(
      () =>
        document.querySelector(".radio-lcd-text")?.textContent?.trim() ===
          "TUNING..." ||
        document.querySelector(".home-radio")?.getAttribute("data-phase") ===
          "tuning",
      { timeout: 500 }
    );
    const earlyAfter = await lcdAndPhase(page);
    check.earlyClick = earlyAfter;
    if (earlyAfter.phase === "searching" || earlyAfter.lcd === "SEARCHING...") {
      report.ok = false;
      report.failures.push(`${vp.name}: early SEARCHING click was ignored`);
    }

    // —— 4) Wait 30s with no input: remain PRESS SCAN ——
    await page.goto(`${BASE}/?ux30=${Date.now()}`, {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    await waitPhase(page, "await-scan");
    await page.waitForTimeout(30000);
    const idle30 = await lcdAndPhase(page);
    check.idle30s = idle30;
    if (idle30.phase !== "await-scan" || idle30.lcd !== "PRESS SCAN") {
      report.ok = false;
      report.failures.push(
        `${vp.name}: after 30s expected PRESS SCAN, got ${idle30.phase}/${idle30.lcd}`
      );
    }

    // —— 5) Keyboard Enter still works ——
    await page.goto(`${BASE}/?uxKey=${Date.now()}`, {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    await waitPhase(page, "await-scan");
    await page.locator(".home-radio").focus();
    await page.keyboard.press("Enter");
    await page.waitForFunction(
      () =>
        document.querySelector(".home-radio")?.getAttribute("data-phase") ===
        "tuning",
      { timeout: 500 }
    );
    check.keyboard = await lcdAndPhase(page);

    // —— 6) Preset after settle ——
    await page.goto(`${BASE}/?uxPreset=${Date.now()}`, {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    await page.waitForSelector(".home-radio");
    await page.keyboard.press("Escape");
    await waitPhase(page, "settle", 8000);
    await page.locator('a[aria-label="Frequency 2: GET FOUND"]').click();
    await page.waitForURL(/get-found/, { timeout: 8000 });
    check.presetOk = page.url().includes("get-found");
    if (!check.presetOk) {
      report.ok = false;
      report.failures.push(`${vp.name}: preset 2 routing failed`);
    }

    report.checks.push(check);
    await context.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify(
      { ok: report.ok, failures: report.failures, timings: report.timings },
      null,
      2
    )
  );
  if (!report.ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
