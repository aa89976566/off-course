/**
 * Regression: homepage SCAN button must exist, align, and drive the radio state machine.
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.ACCEPT_BASE || "http://127.0.0.1:4173/off-course";
const OUT = path.join(__dirname, "..", "artifacts", "accept-scan");
const VIEWPORTS = [
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1920x1080", width: 1920, height: 1080 },
  { name: "390x844", width: 390, height: 844 },
];

async function waitForAwaitScan(page) {
  await page.waitForFunction(
    () => {
      const s = document.querySelector(".home-radio");
      return s?.getAttribute("data-awaiting-scan") === "true";
    },
    { timeout: 12000 }
  );
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = { ok: true, failures: [], checks: [] };

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on("console", (m) => {
      if (m.type() === "error") consoleErrors.push(m.text());
    });

    await page.goto(`${BASE}/?cb=${Date.now()}`, {
      waitUntil: "networkidle",
      timeout: 60000,
    });

    // Always-mounted Scan button (even before await-scan)
    const early = await page.locator('button[aria-label="Scan radio signal"]');
    if ((await early.count()) !== 1) {
      report.ok = false;
      report.failures.push(`${vp.name}: Scan button count != 1 at boot`);
    }

    await waitForAwaitScan(page);

    const scan = page.locator('button[aria-label="Scan radio signal"]');
    const count = await scan.count();
    const visible = await scan.isVisible();
    const enabled = await scan.isEnabled();
    const box = await scan.boundingBox();

    const hit = await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label="Scan radio signal"]');
      if (!btn) return { ok: false, reason: "missing" };
      const r = btn.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const top = document.elementFromPoint(cx, cy);
      const hitBtn = !!(top && (top === btn || btn.contains(top)));
      const artCx = Number(btn.getAttribute("data-scan-center-x"));
      const artCy = Number(btn.getAttribute("data-scan-center-y"));
      return {
        ok: hitBtn,
        cx,
        cy,
        w: r.width,
        h: r.height,
        artCx,
        artCy,
        err: Math.hypot(cx - artCx, cy - artCy),
        tag: top?.tagName,
        aria: top?.getAttribute?.("aria-label") || "",
        phaseBefore: document.querySelector(".home-radio")?.getAttribute("data-phase"),
        lcdBefore:
          document.querySelector(".radio-lcd-text")?.textContent?.trim() || "",
      };
    });

    // Debug overlay screenshot (local acceptance only — not shipped CSS)
    await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label="Scan radio signal"]');
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const d = document.createElement("div");
      d.id = "scan-debug-overlay";
      d.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;border:2px solid rgba(0,255,180,0.9);background:rgba(0,255,180,0.15);z-index:9999;pointer-events:none;`;
      document.body.appendChild(d);
    });
    await page.screenshot({
      path: path.join(OUT, `${vp.name}__scan-hit.png`),
      fullPage: false,
    });
    await page.evaluate(() => document.getElementById("scan-debug-overlay")?.remove());

    if (count !== 1 || !visible || !enabled) {
      report.ok = false;
      report.failures.push(
        `${vp.name}: Scan count/visible/enabled = ${count}/${visible}/${enabled}`
      );
    }
    if (!box || box.width < 44 || box.height < 44) {
      report.ok = false;
      report.failures.push(
        `${vp.name}: hit target < 44px (${box?.width}×${box?.height})`
      );
    }
    if (!hit.ok) {
      report.ok = false;
      report.failures.push(
        `${vp.name}: elementFromPoint missed Scan (got ${hit.tag} ${hit.aria})`
      );
    }
    if (hit.err > 6) {
      report.ok = false;
      report.failures.push(
        `${vp.name}: Scan centre error ${hit.err.toFixed(2)}px > 6`
      );
    }

    const lcdBefore = hit.lcdBefore;
    const phaseBefore = hit.phaseBefore;
    await scan.click({ force: false });
    await page.waitForTimeout(400);
    const afterClick = await page.evaluate(() => ({
      phase: document.querySelector(".home-radio")?.getAttribute("data-phase"),
      lcd: document.querySelector(".radio-lcd-text")?.textContent?.trim() || "",
      awaiting:
        document.querySelector(".home-radio")?.getAttribute("data-awaiting-scan") ===
        "true",
    }));

    if (afterClick.phase === phaseBefore && afterClick.lcd === lcdBefore) {
      report.ok = false;
      report.failures.push(
        `${vp.name}: click did not change phase/LCD (still ${afterClick.phase}/${afterClick.lcd})`
      );
    }
    if (afterClick.phase === "await-scan") {
      report.ok = false;
      report.failures.push(`${vp.name}: still await-scan after click`);
    }

    // Keyboard: reload and trigger Enter
    await page.goto(`${BASE}/?kb=${Date.now()}`, {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    await waitForAwaitScan(page);
    await page.locator(".home-radio").focus();
    const lcdKbBefore = await page.locator(".radio-lcd-text").innerText();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(400);
    const afterEnter = await page.evaluate(() => ({
      phase: document.querySelector(".home-radio")?.getAttribute("data-phase"),
      lcd: document.querySelector(".radio-lcd-text")?.textContent?.trim() || "",
    }));
    if (afterEnter.lcd === lcdKbBefore && afterEnter.phase === "await-scan") {
      report.ok = false;
      report.failures.push(`${vp.name}: Enter did not advance scan state`);
    }

    // Space on focused Scan button
    await page.goto(`${BASE}/?sp=${Date.now()}`, {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    await waitForAwaitScan(page);
    await page.locator('button[aria-label="Scan radio signal"]').focus();
    await page.keyboard.press("Space");
    await page.waitForTimeout(400);
    const afterSpace = await page.evaluate(() =>
      document.querySelector(".home-radio")?.getAttribute("data-phase")
    );
    if (afterSpace === "await-scan") {
      report.ok = false;
      report.failures.push(`${vp.name}: Space on Scan button did not advance`);
    }

    // Preset routing after settle (skip ahead via Escape then click preset 2)
    await page.goto(`${BASE}/?pr=${Date.now()}`, {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    await page.waitForSelector(".home-radio");
    await page.keyboard.press("Escape");
    await page.waitForFunction(
      () =>
        document.querySelector(".home-radio")?.getAttribute("data-phase") ===
        "settle",
      { timeout: 8000 }
    );
    const preset2 = page.locator('a[aria-label="Frequency 2: GET FOUND"]');
    await preset2.click();
    await page.waitForURL(/get-found/, { timeout: 8000 });
    if (!page.url().includes("get-found")) {
      report.ok = false;
      report.failures.push(`${vp.name}: preset 2 did not route to get-found`);
    }

    report.checks.push({
      vp: vp.name,
      count,
      visible,
      enabled,
      box,
      hit,
      afterClick,
      afterEnter,
      afterSpace,
      consoleErrors,
    });

    if (consoleErrors.length) {
      report.ok = false;
      report.failures.push(`${vp.name}: console ${consoleErrors.slice(0, 2).join(" | ")}`);
    }

    await context.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ ok: report.ok, failures: report.failures }, null, 2));
  if (!report.ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
