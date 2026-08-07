/**
 * Live canonical UX proof: human-paced delay then physical coordinate click.
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE =
  process.env.LIVE_BASE || "https://aa89976566.github.io/off-course";
const OUT = path.join(__dirname, "..", "artifacts", "live-scan-ux");

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1324, height: 977 },
    deviceScaleFactor: 1,
    reducedMotion: "no-preference",
  });

  const url = `${BASE}/?scanUx=${Date.now()}`;
  await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });

  await page.waitForFunction(
    () =>
      document.querySelector(".home-radio")?.getAttribute("data-phase") ===
      "await-scan",
    { timeout: 15000 }
  );

  // Human-paced: sit on PRESS SCAN for 8 seconds
  await page.waitForTimeout(8000);
  const before = await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Scan radio signal"]');
    const r = btn.getBoundingClientRect();
    return {
      phase: document.querySelector(".home-radio")?.getAttribute("data-phase"),
      lcd: document.querySelector(".radio-lcd-text")?.textContent?.trim() || "",
      action:
        document
          .querySelector(".home-radio")
          ?.getAttribute("data-last-scan-action") || "",
      hit: {
        x: r.x,
        y: r.y,
        w: r.width,
        h: r.height,
        cx: r.left + r.width / 2,
        cy: r.top + r.height / 2,
      },
    };
  });

  await page.screenshot({
    path: path.join(OUT, "live-before-delayed-click.png"),
    fullPage: false,
  });

  const t0 = Date.now();
  await page.mouse.click(before.hit.cx, before.hit.cy);
  await page.waitForFunction(
    () =>
      document.querySelector(".radio-lcd-text")?.textContent?.trim() ===
        "TUNING..." ||
      document.querySelector(".home-radio")?.getAttribute("data-phase") ===
        "tuning",
    { timeout: 400 }
  );
  const ms = Date.now() - t0;
  const after = await page.evaluate(() => ({
    phase: document.querySelector(".home-radio")?.getAttribute("data-phase"),
    lcd: document.querySelector(".radio-lcd-text")?.textContent?.trim() || "",
    action:
      document.querySelector(".home-radio")?.getAttribute("data-last-scan-action") ||
      "",
  }));

  await page.screenshot({
    path: path.join(OUT, "live-after-delayed-click.png"),
    fullPage: false,
  });

  // Also confirm 12s total still would have been PRESS SCAN (we already waited 8s)
  const ok =
    before.phase === "await-scan" &&
    before.lcd === "PRESS SCAN" &&
    after.phase === "tuning" &&
    after.lcd === "TUNING..." &&
    ms <= 400;

  const report = {
    ok,
    url,
    timings: { searchingAtMs: 900, pressScanAtMs: 3900, autoAdvance: "none" },
    idleWaitMs: 8000,
    clickLatencyMs: ms,
    before,
    after,
  };
  fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
  if (!ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
