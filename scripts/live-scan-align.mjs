/**
 * Live CDN proof: pixel alignment + coordinate click on physical SCAN.
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE =
  process.env.LIVE_BASE || "https://aa89976566.github.io/off-course";
const OUT = path.join(__dirname, "..", "artifacts", "live-scan-align");

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1324, height: 977 },
    deviceScaleFactor: 1,
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  const url = `${BASE}/?debugHit=1&liveAlign=${Date.now()}`;
  await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });

  await page.waitForFunction(
    () =>
      document.querySelector(".home-radio")?.getAttribute("data-awaiting-scan") ===
      "true",
    { timeout: 15000 }
  );

  const before = await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Scan radio signal"]');
    const plate = document.querySelector(".home-radio__plate");
    const section = document.querySelector(".home-radio");
    const br = btn.getBoundingClientRect();
    const pr = plate.getBoundingClientRect();
    const cx = br.left + br.width / 2;
    const cy = br.top + br.height / 2;
    const top = document.elementFromPoint(cx, cy);
    return {
      url: location.href,
      heroV: plate?.getAttribute("src") || "",
      naturalCx: btn.getAttribute("data-scan-natural-cx"),
      naturalCy: btn.getAttribute("data-scan-natural-cy"),
      scanCount: document.querySelectorAll(
        'button[aria-label="Scan radio signal"]'
      ).length,
      hasDebug: !!document.querySelector("[data-scan-debug]"),
      plate: { x: pr.x, y: pr.y, w: pr.width, h: pr.height },
      hitRect: {
        x: br.x,
        y: br.y,
        w: br.width,
        h: br.height,
        cx,
        cy,
      },
      elementFromPointHit:
        !!top && (top === btn || btn.contains(top)),
      phase: section.getAttribute("data-phase"),
      lcd: document.querySelector(".radio-lcd-text")?.textContent?.trim() || "",
      settleScale: getComputedStyle(
        document.querySelector(".home-radio__scene")
      ).transform,
    };
  });

  await page.screenshot({
    path: path.join(OUT, "live-1324x977-debugHit-before.png"),
    fullPage: false,
  });

  await page.mouse.click(before.hitRect.cx, before.hitRect.cy);
  await page.waitForTimeout(500);

  const after = await page.evaluate(() => ({
    phase: document.querySelector(".home-radio")?.getAttribute("data-phase"),
    lcd: document.querySelector(".radio-lcd-text")?.textContent?.trim() || "",
    awaiting:
      document.querySelector(".home-radio")?.getAttribute("data-awaiting-scan") ===
      "true",
  }));

  await page.screenshot({
    path: path.join(OUT, "live-1324x977-after-click.png"),
    fullPage: false,
  });

  const ok =
    before.scanCount === 1 &&
    before.hasDebug &&
    before.elementFromPointHit &&
    before.hitRect.cx > 790 &&
    before.hitRect.cx < 820 &&
    before.hitRect.cy > 710 &&
    before.hitRect.cy < 735 &&
    before.phase === "await-scan" &&
    before.lcd === "PRESS SCAN" &&
    after.phase !== "await-scan" &&
    after.lcd !== before.lcd;

  const report = {
    ok,
    url,
    before,
    after,
    previousMisalignedCenter: { x: 810.61, y: 740.18 },
    targetCenter: { x: 804, y: 724 },
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
