/**
 * Pixel-alignment regression for homepage SCAN.
 * Clicks PHYSICAL coordinates (mouse), not locator.click.
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.ACCEPT_BASE || "http://127.0.0.1:4173/off-course";
const OUT = path.join(__dirname, "..", "artifacts", "accept-scan-align");

const VIEWPORTS = [
  { name: "1324x977", width: 1324, height: 977 },
  { name: "1440x900", width: 1440, height: 900 },
  { name: "390x844", width: 390, height: 844 },
  { name: "430x932", width: 430, height: 932 },
];

async function waitAwait(page) {
  await page.waitForFunction(
    () =>
      document.querySelector(".home-radio")?.getAttribute("data-awaiting-scan") ===
      "true",
    { timeout: 15000 }
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

    await page.goto(`${BASE}/?debugHit=1&cb=${Date.now()}`, {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    await waitAwait(page);

    const metrics = await page.evaluate(() => {
      const section = document.querySelector(".home-radio");
      const plate = document.querySelector(".home-radio__plate");
      const btn = document.querySelector('button[aria-label="Scan radio signal"]');
      const debug = document.querySelector("[data-scan-debug]");
      const scans = document.querySelectorAll('button[aria-label="Scan radio signal"]');
      if (!section || !plate || !btn) {
        return { ok: false, reason: "missing nodes" };
      }
      const sr = section.getBoundingClientRect();
      const pr = plate.getBoundingClientRect();
      const br = btn.getBoundingClientRect();
      const cx = br.left + br.width / 2;
      const cy = br.top + br.height / 2;
      const top = document.elementFromPoint(cx, cy);
      const hit =
        !!top && (top === btn || btn.contains(top));
      const artCx = Number(btn.getAttribute("data-scan-center-x"));
      const artCy = Number(btn.getAttribute("data-scan-center-y"));
      const natCx = Number(btn.getAttribute("data-scan-natural-cx"));
      const natCy = Number(btn.getAttribute("data-scan-natural-cy"));

      // Recompute cover map independently and compare
      const useWide = window.innerWidth / window.innerHeight >= 1;
      const iw = useWide ? 1672 : 1024;
      const ih = useWide ? 941 : 1536;
      const vw = sr.width;
      const vh = sr.height;
      const scale = Math.max(vw / iw, vh / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (vw - dw) / 2;
      const dy = (vh - dh) / 2;
      const expectedCx = sr.left + dx + natCx * dw;
      const expectedCy = sr.top + dy + natCy * dh;

      return {
        ok: true,
        scanCount: scans.length,
        hasDebug: !!debug,
        section: { x: sr.x, y: sr.y, w: sr.width, h: sr.height },
        plate: { x: pr.x, y: pr.y, w: pr.width, h: pr.height },
        hitRect: { x: br.x, y: br.y, w: br.width, h: br.height, cx, cy },
        artCenter: { x: artCx, y: artCy },
        natural: { cx: natCx, cy: natCy },
        expectedCenter: { x: expectedCx, y: expectedCy },
        centerErr: Math.hypot(cx - expectedCx, cy - expectedCy),
        elementFromPointHit: hit,
        topTag: top?.tagName,
        topAria: top?.getAttribute?.("aria-label") || "",
        lcd:
          document.querySelector(".radio-lcd-text")?.textContent?.trim() || "",
        phase: section.getAttribute("data-phase"),
        useWide,
      };
    });

    await page.screenshot({
      path: path.join(OUT, `${vp.name}__debugHit.png`),
      fullPage: false,
    });

    if (!metrics.ok) {
      report.ok = false;
      report.failures.push(`${vp.name}: ${metrics.reason}`);
      await context.close();
      continue;
    }

    if (metrics.scanCount !== 1) {
      report.ok = false;
      report.failures.push(`${vp.name}: scan count ${metrics.scanCount}`);
    }
    if (!metrics.hasDebug) {
      report.ok = false;
      report.failures.push(`${vp.name}: debugHit outline missing`);
    }
    if (metrics.hitRect.w < 44 || metrics.hitRect.h < 44) {
      report.ok = false;
      report.failures.push(`${vp.name}: hit < 44px`);
    }
    if (metrics.centerErr > 1.5) {
      report.ok = false;
      report.failures.push(
        `${vp.name}: cover-map centre drift ${metrics.centerErr.toFixed(2)}px`
      );
    }
    if (!metrics.elementFromPointHit) {
      report.ok = false;
      report.failures.push(
        `${vp.name}: elementFromPoint missed (${metrics.topTag} ${metrics.topAria})`
      );
    }

    // Wide desktop: assert against live-measured physical band at 1324×977
    if (vp.name === "1324x977" && metrics.useWide) {
      const { cx, cy } = metrics.hitRect;
      // Target band from product measurement: centre ≈ (804,724), key ≈ 776–832 × 700–749
      if (cx < 790 || cx > 820 || cy < 710 || cy > 740) {
        report.ok = false;
        report.failures.push(
          `${vp.name}: centre (${cx.toFixed(1)},${cy.toFixed(1)}) outside physical SCAN band`
        );
      }
      // Must not sit as low as the previous finger-biased target (~740)
      if (cy > 735) {
        report.ok = false;
        report.failures.push(
          `${vp.name}: centre too low (y=${cy.toFixed(1)}) — spills toward finger`
        );
      }
    }

    // Physical pixel click — not locator.click
    const beforeLcd = metrics.lcd;
    const beforePhase = metrics.phase;
    await page.mouse.click(metrics.hitRect.cx, metrics.hitRect.cy);
    await page.waitForTimeout(450);
    const after = await page.evaluate(() => ({
      phase: document.querySelector(".home-radio")?.getAttribute("data-phase"),
      lcd: document.querySelector(".radio-lcd-text")?.textContent?.trim() || "",
    }));

    if (after.phase === "await-scan" || after.lcd === beforeLcd) {
      report.ok = false;
      report.failures.push(
        `${vp.name}: coordinate click did not advance (${beforePhase}/${beforeLcd} → ${after.phase}/${after.lcd})`
      );
    }

    report.checks.push({
      vp: vp.name,
      hitRect: metrics.hitRect,
      expectedCenter: metrics.expectedCenter,
      natural: metrics.natural,
      centerErr: metrics.centerErr,
      before: { phase: beforePhase, lcd: beforeLcd },
      after,
      plate: metrics.plate,
    });

    await context.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ ok: report.ok, failures: report.failures, checks: report.checks }, null, 2));
  if (!report.ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
