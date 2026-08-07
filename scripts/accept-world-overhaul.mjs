/**
 * Local acceptance: world browser first-viewport checks + screenshots.
 * Serve `out/` with base path /off-course before running.
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.ACCEPT_BASE || "http://127.0.0.1:4173/off-course";
const OUT = path.join(__dirname, "..", "artifacts", "accept-overhaul");
const VIEWPORTS = [
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1920x1080", width: 1920, height: 1080 },
  { name: "1024x768", width: 1024, height: 768 },
  { name: "390x844", width: 390, height: 844 },
];

const PAGES = [
  { id: "home", path: "/" },
  { id: "found-vertical", path: "/get-found/" },
  { id: "found-horizontal", path: "/get-found/?view=horizontal" },
  { id: "found-grid", path: "/get-found/?view=grid" },
  { id: "found-case", path: "/get-found/jieshin-tseng/" },
  { id: "lost-vertical", path: "/get-lost/" },
  { id: "lost-horizontal", path: "/get-lost/?view=horizontal" },
  { id: "lost-grid", path: "/get-lost/?view=grid" },
  { id: "lost-case", path: "/get-lost/soho-storefront/" },
];

function visibleInViewport(box, vw, vh) {
  if (!box) return false;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  return cx >= 0 && cy >= 0 && cx <= vw && cy <= vh && box.width > 8 && box.height > 8;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = { base: BASE, ok: true, failures: [], shots: [], checks: [] };

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(String(err)));

    for (const route of PAGES) {
      const url = `${BASE}${route.path}`;
      const res = await page.goto(url, {
        waitUntil: "networkidle",
        timeout: 60000,
      });
      if (!res || res.status() >= 400) {
        report.ok = false;
        report.failures.push(`${vp.name} ${route.id}: HTTP ${res?.status()}`);
      }
      await page.waitForTimeout(450);

      const shotName = `${vp.name}__${route.id}.png`;
      await page.screenshot({ path: path.join(OUT, shotName), fullPage: false });
      report.shots.push(shotName);

      const metrics = await page.evaluate(() => {
        const overflow =
          document.documentElement.scrollWidth > window.innerWidth + 1;
        return {
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          overflow,
        };
      });

      if (metrics.overflow) {
        report.ok = false;
        report.failures.push(
          `${vp.name} ${route.id}: overflow scrollWidth=${metrics.scrollWidth} > innerWidth=${metrics.innerWidth}`
        );
      }

      const broken = await page.evaluate(async () => {
        const urls = new Set();
        document.querySelectorAll("a[href]").forEach((a) => {
          const href = a.getAttribute("href") || "";
          if (
            !href ||
            href.startsWith("#") ||
            href.startsWith("mailto:") ||
            href.startsWith("http")
          )
            return;
          urls.add(href);
        });
        document.querySelectorAll("img[src]").forEach((img) => {
          const src = img.getAttribute("src") || "";
          if (!src || src.startsWith("data:")) return;
          urls.add(src);
        });
        const bad = [];
        for (const u of urls) {
          try {
            const r = await fetch(u, { method: "GET" });
            if (!r.ok) bad.push(`${r.status} ${u}`);
          } catch {
            bad.push(`fail ${u}`);
          }
        }
        return bad;
      });

      if (broken.length) {
        report.ok = false;
        report.failures.push(
          `${vp.name} ${route.id}: assets ${broken.slice(0, 5).join("; ")}`
        );
      }

      if (route.id === "found-vertical" || route.id === "lost-vertical") {
        const worldChecks = await page.evaluate(() => {
          const projectBtn = document.querySelector(
            ".world-browser__rail-btn--project.is-active .world-browser__rail-name"
          );
          const stage =
            document.querySelector(".world-browser__stage") ||
            document.querySelector(".world-browser__plate");
          const metaTitle = document.querySelector(
            ".world-browser__meta-title"
          );
          const modes = [...document.querySelectorAll(".world-browser__mode")];
          const rect = (el) => (el ? el.getBoundingClientRect() : null);
          return {
            projectName: projectBtn?.textContent?.trim() || "",
            stage: rect(stage),
            metaTitle: metaTitle?.textContent?.trim() || "",
            metaBox: rect(metaTitle),
            modes: modes.map((m) => ({
              text: m.textContent?.trim(),
              pressed: m.getAttribute("aria-pressed"),
              box: rect(m),
            })),
            railLabels: [
              ...document.querySelectorAll(".world-browser__rail-label"),
            ].map((n) => n.textContent?.trim()),
            projectNames: [
              ...document.querySelectorAll(".world-browser__rail-name"),
            ].map((n) => n.textContent?.trim()),
            heroOpen: !!document.querySelector(".world-gallery__open"),
            giantCraft: !!document.querySelector(".world-gallery__craft-list"),
          };
        });

        const stageVisible = visibleInViewport(
          worldChecks.stage,
          vp.width,
          vp.height
        );
        const metaVisible = visibleInViewport(
          worldChecks.metaBox,
          vp.width,
          vp.height
        );
        const modesVisible = worldChecks.modes.every((m) =>
          visibleInViewport(m.box, vp.width, vp.height)
        );
        const stageH = worldChecks.stage?.height || 0;
        const stageHOk =
          vp.width < 900
            ? stageH >= vp.height * 0.4
            : stageH >= vp.height * 0.5 && stageH <= vp.height * 0.78;

        report.checks.push({
          vp: vp.name,
          route: route.id,
          projectName: worldChecks.projectName,
          metaTitle: worldChecks.metaTitle,
          stageH,
          stageVisible,
          metaVisible,
          modesVisible,
          stageHOk,
          railLabels: worldChecks.railLabels,
          projectCount: worldChecks.projectNames.length,
          heroOpen: worldChecks.heroOpen,
          giantCraft: worldChecks.giantCraft,
          modes: worldChecks.modes.map((m) => `${m.text}:${m.pressed}`),
        });

        if (worldChecks.heroOpen || worldChecks.giantCraft) {
          report.ok = false;
          report.failures.push(
            `${vp.name} ${route.id}: legacy giant hero/craft still present`
          );
        }
        if (!worldChecks.projectName || !worldChecks.metaTitle) {
          report.ok = false;
          report.failures.push(
            `${vp.name} ${route.id}: missing project name/meta in DOM`
          );
        }
        if (!stageVisible || !metaVisible || !modesVisible) {
          report.ok = false;
          report.failures.push(
            `${vp.name} ${route.id}: first-viewport missing stage/meta/modes (stage=${stageVisible} meta=${metaVisible} modes=${modesVisible})`
          );
        }
        if (!stageHOk) {
          report.ok = false;
          report.failures.push(
            `${vp.name} ${route.id}: stage height ${Math.round(stageH)}px not in acceptance band for ${vp.height}vh`
          );
        }
        if (worldChecks.projectNames.length !== 6) {
          report.ok = false;
          report.failures.push(
            `${vp.name} ${route.id}: expected 6 project names, got ${worldChecks.projectNames.length}`
          );
        }
        if (!worldChecks.railLabels.includes("Open")) {
          report.ok = false;
          report.failures.push(`${vp.name} ${route.id}: Open label missing`);
        }
        const hitTargets = await page.evaluate(() =>
          [...document.querySelectorAll(".world-browser__rail-btn")].map((b) =>
            b.getBoundingClientRect().height
          )
        );
        if (hitTargets.some((h) => h < 44)) {
          report.ok = false;
          report.failures.push(
            `${vp.name} ${route.id}: rail hit target < 44px`
          );
        }
      }

      if (consoleErrors.length) {
        report.ok = false;
        report.failures.push(
          `${vp.name} ${route.id}: console ${consoleErrors.slice(0, 3).join(" | ")}`
        );
        consoleErrors.length = 0;
      }
    }

    await context.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify(
      { ok: report.ok, failures: report.failures, shots: report.shots.length },
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
