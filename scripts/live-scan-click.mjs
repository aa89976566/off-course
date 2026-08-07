/**
 * Live CDN proof: Scan button exists and advances radio state when clicked.
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE =
  process.env.LIVE_BASE || "https://aa89976566.github.io/off-course";
const OUT = path.join(__dirname, "..", "artifacts", "live-scan");

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  const url = `${BASE}/?liveScan=${Date.now()}`;
  await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });

  // Prove button is present immediately (regression that shipped without it)
  const bootCount = await page
    .locator('button[aria-label="Scan radio signal"]')
    .count();

  await page.waitForFunction(
    () =>
      document.querySelector(".home-radio")?.getAttribute("data-awaiting-scan") ===
      "true",
    { timeout: 15000 }
  );

  const before = await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Scan radio signal"]');
    const r = btn?.getBoundingClientRect();
    const cx = r ? r.left + r.width / 2 : -1;
    const cy = r ? r.top + r.height / 2 : -1;
    const top = cx >= 0 ? document.elementFromPoint(cx, cy) : null;
    return {
      count: document.querySelectorAll('button[aria-label="Scan radio signal"]')
        .length,
      phase: document.querySelector(".home-radio")?.getAttribute("data-phase"),
      lcd: document.querySelector(".radio-lcd-text")?.textContent?.trim() || "",
      url: location.href,
      hit:
        !!btn &&
        !!top &&
        (top === btn || btn.contains(top)),
      box: r
        ? { w: r.width, h: r.height, x: r.x, y: r.y }
        : null,
    };
  });

  await page.screenshot({
    path: path.join(OUT, "live-before-scan.png"),
    fullPage: false,
  });

  await page.locator('button[aria-label="Scan radio signal"]').click();
  await page.waitForTimeout(500);

  const after = await page.evaluate(() => ({
    phase: document.querySelector(".home-radio")?.getAttribute("data-phase"),
    lcd: document.querySelector(".radio-lcd-text")?.textContent?.trim() || "",
    awaiting:
      document.querySelector(".home-radio")?.getAttribute("data-awaiting-scan") ===
      "true",
    url: location.href,
  }));

  await page.screenshot({
    path: path.join(OUT, "live-after-scan.png"),
    fullPage: false,
  });

  const ok =
    bootCount === 1 &&
    before.count === 1 &&
    before.hit &&
    before.phase === "await-scan" &&
    before.box &&
    before.box.w >= 44 &&
    before.box.h >= 44 &&
    after.phase !== "await-scan" &&
    (after.lcd !== before.lcd || after.phase !== before.phase);

  const report = { ok, url, bootCount, before, after };
  fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
  if (!ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
