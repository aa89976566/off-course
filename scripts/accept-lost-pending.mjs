/**
 * Regression: GET LOST cached/complete hero must not stay is-pending.
 * Also audits warm reload, cold (cache-busted) load, client nav, viewports.
 *
 * Usage:
 *   ACCEPT_BASE=http://127.0.0.1:4173/off-course node scripts/accept-lost-pending.mjs
 *   ACCEPT_BASE=https://aa89976566.github.io/off-course node scripts/accept-lost-pending.mjs
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = (process.env.ACCEPT_BASE || "http://127.0.0.1:4173/off-course").replace(
  /\/$/,
  ""
);
const OUT = path.join(__dirname, "..", "artifacts", "accept-lost-pending");
const VIEWPORTS = [
  { name: "1324x977", width: 1324, height: 977 },
  { name: "390x844", width: 390, height: 844 },
];

function bust(url) {
  const u = new URL(url);
  u.searchParams.set("cb", String(Date.now()));
  return u.toString();
}

async function measureLost(page, label) {
  const t0 = Date.now();
  const shellMs = await page
    .waitForFunction(
      () => {
        const labelEl = document.querySelector(".world-browser__world-name");
        const rail = document.querySelector(".world-browser__rail");
        if (!labelEl || !rail) return false;
        const t = (labelEl.textContent || "").trim();
        return t.length > 0;
      },
      { timeout: 7000 }
    )
    .then(() => Date.now() - t0)
    .catch(() => null);

  const pendingClearMs = await page
    .waitForFunction(
      () => {
        const plate = document.querySelector(".world-browser__plate");
        if (!plate) return false;
        const pending = plate.classList.contains("is-pending");
        const img = plate.querySelector("img");
        if (!img) {
          // error fallback path — pending must be cleared
          return !pending && plate.classList.contains("is-error");
        }
        if (img.complete && img.naturalWidth > 0) {
          return !pending;
        }
        return false;
      },
      { timeout: 8000 }
    )
    .then(() => Date.now() - t0)
    .catch(() => null);

  const snap = await page.evaluate(() => {
    const plate = document.querySelector(".world-browser__plate");
    const img = plate?.querySelector("img") || null;
    const stage = document.querySelector(".world-browser__stage");
    const blockers = [];
    document.querySelectorAll("body *").forEach((el) => {
      const st = getComputedStyle(el);
      if (st.pointerEvents === "none") return;
      if (st.position !== "fixed" && st.position !== "absolute") return;
      const r = el.getBoundingClientRect();
      if (r.width < window.innerWidth * 0.8 || r.height < window.innerHeight * 0.5)
        return;
      if (Number(st.opacity) === 0 || st.visibility === "hidden") return;
      // ignore the stage link itself
      if (el.classList?.contains("world-browser__stage")) return;
      if (el === stage) return;
      blockers.push({
        tag: el.tagName,
        className: String(el.className || "").slice(0, 120),
        z: st.zIndex,
      });
    });
    return {
      plateClass: plate?.className || null,
      dataMedia: plate?.getAttribute("data-media") || null,
      isPending: plate?.classList.contains("is-pending") || false,
      isArchive: plate?.classList.contains("is-archive") || false,
      img: img
        ? {
            complete: img.complete,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            src: img.currentSrc || img.src,
          }
        : null,
      shellText: (
        document.querySelector(".world-browser__world-name")?.textContent || ""
      ).trim(),
      blockers,
    };
  });

  return { label, shellMs, pendingClearMs, ...snap, elapsedMs: Date.now() - t0 };
}

async function assertWarmCached(page, vpName, report) {
  // Prime cache
  await page.goto(`${BASE}/get-lost/`, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.waitForFunction(() => {
    const img = document.querySelector(".world-browser__plate img");
    return img && img.complete && img.naturalWidth > 0;
  }, { timeout: 15000 });

  const t0 = Date.now();
  await page.reload({ waitUntil: "domcontentloaded", timeout: 30000 });
  const result = await measureLost(page, `${vpName}:warm-reload`);
  result.reloadToMeasureMs = Date.now() - t0;

  const fails = [];
  if (result.shellMs == null || result.shellMs >= 700) {
    fails.push(`shell visible ${result.shellMs}ms (want <700)`);
  }
  if (result.pendingClearMs == null || result.pendingClearMs >= 100) {
    fails.push(
      `cached hero pending clear ${result.pendingClearMs}ms (want <100 after hydration)`
    );
  }
  if (result.isPending) {
    fails.push("plate still is-pending after warm reload");
  }
  if (result.img?.complete && result.img.naturalWidth > 0 && result.isPending) {
    fails.push("complete cached image stayed is-pending");
  }
  if (result.dataMedia !== "ready" && result.dataMedia !== "error") {
    fails.push(`data-media=${result.dataMedia}`);
  }

  report.checks.push(result);
  if (fails.length) {
    report.ok = false;
    report.failures.push(...fails.map((f) => `${vpName} warm: ${f}`));
  }
}

async function assertCold(page, vpName, report) {
  await page.goto(bust(`${BASE}/get-lost/`), {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  const result = await measureLost(page, `${vpName}:cold-busted`);

  // Cold may take longer for bytes; pending must clear on load/error, never stick forever.
  const fails = [];
  if (result.shellMs == null || result.shellMs >= 700) {
    fails.push(`shell visible ${result.shellMs}ms (want <700)`);
  }
  if (result.pendingClearMs == null) {
    fails.push("pending never cleared on cold load");
  }
  if (result.isPending) {
    fails.push("still is-pending after wait");
  }
  if (result.img?.complete && result.img.naturalWidth > 0 && result.isPending) {
    fails.push("complete image stayed is-pending");
  }

  report.checks.push(result);
  if (fails.length) {
    report.ok = false;
    report.failures.push(...fails.map((f) => `${vpName} cold: ${f}`));
  }
}

async function assertClientNav(page, vpName, report) {
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 30000 });
  // Prefer in-app link if present; fallback to direct location assign via clickable path.
  const link = page.locator('a[href*="get-lost"]').first();
  const t0 = Date.now();
  if (await link.count()) {
    await Promise.all([
      page.waitForURL(/get-lost/, { timeout: 15000 }),
      link.click(),
    ]);
  } else {
    await page.goto(`${BASE}/get-lost/`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
  }
  const result = await measureLost(page, `${vpName}:client-nav`);
  result.navClickMs = Date.now() - t0;

  const fails = [];
  if (result.pendingClearMs == null) {
    fails.push("pending never cleared after client nav");
  }
  if (result.isPending) {
    fails.push("still is-pending after client nav");
  }
  if (result.img?.complete && result.img.naturalWidth > 0 && result.isPending) {
    fails.push("complete image stayed is-pending after client nav");
  }

  report.checks.push(result);
  if (fails.length) {
    report.ok = false;
    report.failures.push(...fails.map((f) => `${vpName} nav: ${f}`));
  }
}

async function assertCompleteCannotStick(page, report) {
  await page.goto(`${BASE}/get-lost/`, {
    waitUntil: "networkidle",
    timeout: 45000,
  });
  await page.waitForTimeout(50);
  const stuck = await page.evaluate(() => {
    const plate = document.querySelector(".world-browser__plate");
    const img = plate?.querySelector("img");
    if (!plate || !img) return { ok: false, reason: "missing plate/img" };
    return {
      ok: !(img.complete && img.naturalWidth > 0 && plate.classList.contains("is-pending")),
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      isPending: plate.classList.contains("is-pending"),
      dataMedia: plate.getAttribute("data-media"),
      className: plate.className,
    };
  });
  report.checks.push({ label: "complete-cannot-stick", ...stuck });
  if (!stuck.ok) {
    report.ok = false;
    report.failures.push(
      `complete cached image stuck is-pending (complete=${stuck.complete} w=${stuck.naturalWidth})`
    );
  }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = {
    base: BASE,
    ok: true,
    failures: [],
    checks: [],
    at: new Date().toISOString(),
  };

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    await assertWarmCached(page, vp.name, report);
    await page.screenshot({
      path: path.join(OUT, `${vp.name}__warm.png`),
      fullPage: false,
    });

    // Fresh context for cold (no HTTP cache from prior nav within same page is hard;
    // cache-buster + disable cache is stronger).
    await context.close();
    const coldContext = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    await coldContext.route("**/*", (route) => {
      const headers = {
        ...route.request().headers(),
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      };
      route.continue({ headers });
    });
    const coldPage = await coldContext.newPage();
    await assertCold(coldPage, vp.name, report);
    await coldPage.screenshot({
      path: path.join(OUT, `${vp.name}__cold.png`),
      fullPage: false,
    });
    await coldContext.close();

    const navContext = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const navPage = await navContext.newPage();
    await assertClientNav(navPage, vp.name, report);
    await navPage.screenshot({
      path: path.join(OUT, `${vp.name}__nav.png`),
      fullPage: false,
    });
    await navContext.close();
  }

  const stickContext = await browser.newContext({
    viewport: { width: 1324, height: 977 },
  });
  const stickPage = await stickContext.newPage();
  await assertCompleteCannotStick(stickPage, report);
  await stickContext.close();

  await browser.close();
  const outFile = path.join(OUT, "report.json");
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) {
    console.error("ACCEPT LOST PENDING FAILED");
    process.exit(1);
  }
  console.log("ACCEPT LOST PENDING OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
