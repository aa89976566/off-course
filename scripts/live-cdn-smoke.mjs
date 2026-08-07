/**
 * Live CDN smoke against canonical GitHub Pages URL.
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE =
  process.env.LIVE_BASE || "https://aa89976566.github.io/off-course";
const OUT = path.join(__dirname, "..", "artifacts", "live-smoke");
const bust = `cb=${Date.now()}`;

const ROUTES = [
  { id: "home", path: `/?${bust}` },
  { id: "found", path: `/get-found/?${bust}` },
  { id: "found-h", path: `/get-found/?view=horizontal&${bust}` },
  { id: "found-g", path: `/get-found/?view=grid&${bust}` },
  { id: "found-case", path: `/get-found/jieshin-tseng/?${bust}` },
  { id: "lost", path: `/get-lost/?${bust}` },
  { id: "lost-h", path: `/get-lost/?view=horizontal&${bust}` },
  { id: "lost-g", path: `/get-lost/?view=grid&${bust}` },
  { id: "lost-case", path: `/get-lost/soho-storefront/?${bust}` },
];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = { base: BASE, ok: true, failures: [], checks: [] };

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  for (const route of ROUTES) {
    const url = `${BASE}${route.path}`;
    const res = await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });
    const status = res?.status() ?? 0;
    if (status >= 400) {
      report.ok = false;
      report.failures.push(`${route.id}: HTTP ${status}`);
    }
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(OUT, `live-1440__${route.id}.png`),
      fullPage: false,
    });

    if (route.id === "found" || route.id === "lost") {
      const check = await page.evaluate(() => {
        const stage = document.querySelector(".world-browser__stage");
        const meta = document.querySelector(".world-browser__meta-title");
        const modes = document.querySelectorAll(".world-browser__mode");
        const names = [
          ...document.querySelectorAll(".world-browser__rail-name"),
        ].map((n) => n.textContent?.trim());
        const labels = [
          ...document.querySelectorAll(".world-browser__rail-label"),
        ].map((n) => n.textContent?.trim());
        const rect = stage?.getBoundingClientRect();
        return {
          hasBrowser: !!document.querySelector(".world-browser"),
          hasLegacyHero: !!document.querySelector(".world-gallery__open"),
          hasGiantCraft: !!document.querySelector(".world-gallery__craft-list"),
          projectCount: names.length,
          labels,
          meta: meta?.textContent?.trim() || "",
          stageH: rect?.height || 0,
          stageVisible: !!(rect && rect.top < window.innerHeight && rect.height > 100),
          modes: modes.length,
          pressed: [...modes].map((m) => m.getAttribute("aria-pressed")),
          htmlSnippet: document.body?.innerText?.slice(0, 200) || "",
        };
      });
      report.checks.push({ route: route.id, ...check });
      if (!check.hasBrowser) {
        report.ok = false;
        report.failures.push(`${route.id}: world-browser missing on live CDN`);
      }
      if (check.hasLegacyHero || check.hasGiantCraft) {
        report.ok = false;
        report.failures.push(`${route.id}: legacy hero/craft still on live CDN`);
      }
      if (!check.stageVisible || check.stageH < 450) {
        report.ok = false;
        report.failures.push(
          `${route.id}: stage not first-viewport ready (h=${Math.round(check.stageH)})`
        );
      }
      if (check.projectCount !== 6 || check.modes !== 3) {
        report.ok = false;
        report.failures.push(
          `${route.id}: expected 6 projects + 3 modes (got ${check.projectCount}/${check.modes})`
        );
      }
    }

    if (consoleErrors.length) {
      report.ok = false;
      report.failures.push(
        `${route.id}: console ${consoleErrors.slice(0, 2).join(" | ")}`
      );
      consoleErrors.length = 0;
    }
  }

  // mobile spot
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/get-found/?${bust}`, {
    waitUntil: "networkidle",
    timeout: 90000,
  });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(OUT, "live-390__found.png"),
    fullPage: false,
  });
  const mobile = await page.evaluate(() => {
    const stage = document.querySelector(".world-browser__stage");
    const r = stage?.getBoundingClientRect();
    return {
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      stageVisible: !!(r && r.top < window.innerHeight && r.height > 80),
      stageH: r?.height || 0,
    };
  });
  report.checks.push({ route: "found-mobile", ...mobile });
  if (mobile.overflow || !mobile.stageVisible) {
    report.ok = false;
    report.failures.push(
      `mobile found: overflow=${mobile.overflow} stageVisible=${mobile.stageVisible}`
    );
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
