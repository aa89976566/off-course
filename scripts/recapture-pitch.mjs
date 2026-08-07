#!/usr/bin/env node
/**
 * Clean re-capture of live GET FOUND pitch boards.
 * Dismisses cookies/modals, waits for settle, composites browser + phone frames.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("public/media/digital/pitch");
const RAW = "/tmp/pitch-raw-clean";

const SITES = [
  {
    slug: "freds-cafe",
    url: "https://aa89976566.github.io/fred-s-cafe/",
    accent: "#2a1810",
  },
  {
    slug: "jieshin-tseng",
    url: "https://jieshin.vercel.app",
    accent: "#0a0a0a",
  },
  {
    slug: "ams-com",
    url: "https://aa89976566.github.io/Ams.com/",
    accent: "#121212",
  },
  {
    slug: "crespidia-coffee",
    url: "https://aa89976566.github.io/Crespidia-coffee/",
    accent: "#1a1510",
  },
];

async function dismissOverlays(page) {
  await page.evaluate(() => {
    const hide = (el) => {
      if (!el) return;
      el.style.setProperty("display", "none", "important");
      el.style.setProperty("visibility", "hidden", "important");
      el.style.setProperty("opacity", "0", "important");
      el.style.setProperty("pointer-events", "none", "important");
    };

    // Click only BUTTONS inside cookie/dialog roots (never nav <a>)
    const roots = Array.from(
      document.querySelectorAll(
        '[id*="cookie" i], [class*="cookie" i], [id*="consent" i], [class*="consent" i], dialog, [role="dialog"], [aria-modal="true"]'
      )
    );
    for (const root of roots) {
      const btns = Array.from(root.querySelectorAll("button"));
      const prefer =
        btns.find((b) =>
          /maybe later|essentials only|ok|accept|agree|got it|dismiss|close/i.test(
            (b.textContent || "").trim()
          )
        ) || btns[0];
      if (prefer) {
        try {
          prefer.click();
        } catch {}
      }
    }

    // Also try common promo dismiss buttons by exact-ish labels
    for (const b of document.querySelectorAll("button")) {
      const t = (b.textContent || "").trim().toLowerCase();
      if (
        t === "maybe later" ||
        t === "essentials only" ||
        t === "ok" ||
        t === "accept" ||
        t === "got it"
      ) {
        try {
          b.click();
        } catch {}
      }
    }

    document
      .querySelectorAll(
        '[id*="cookie" i], [class*="cookie" i], [id*="consent" i], [class*="consent" i], dialog, [role="dialog"], [aria-modal="true"], .modal, .popup'
      )
      .forEach(hide);

    document.querySelectorAll("div, section, aside").forEach((el) => {
      const style = getComputedStyle(el);
      const text = (el.textContent || "").toLowerCase();
      if (
        (text.includes("cookie") || text.includes("maybe later")) &&
        (style.position === "fixed" || style.position === "sticky") &&
        el.clientHeight < window.innerHeight * 0.6
      ) {
        hide(el);
      }
    });

    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
  });
  await page.waitForTimeout(400);
  if (/cookie/i.test(page.url())) {
    // Recover if a click navigated to a cookies policy page
    const origin = new URL(page.url()).origin + new URL(page.url()).pathname.replace(/cookies?\/?$/i, "");
    await page.goto(origin, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  }
}

async function captureSite(browser, site) {
  const desk = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  await desk.goto(site.url, { waitUntil: "networkidle", timeout: 90000 });
  await desk.waitForTimeout(1200);
  await dismissOverlays(desk);
  await desk.waitForTimeout(800);
  const deskPath = path.join(RAW, `${site.slug}-desk.png`);
  await desk.screenshot({ path: deskPath, type: "png" });

  // Secondary desk: scroll down a bit for board-2 / wide variety
  await desk.evaluate(() => window.scrollTo(0, Math.min(900, document.body.scrollHeight * 0.35)));
  await desk.waitForTimeout(600);
  await dismissOverlays(desk);
  const desk2Path = path.join(RAW, `${site.slug}-desk-2.png`);
  await desk.screenshot({ path: desk2Path, type: "png" });
  await desk.close();

  const phone = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await phone.goto(site.url, { waitUntil: "networkidle", timeout: 90000 });
  await phone.waitForTimeout(1200);
  await dismissOverlays(phone);
  await phone.waitForTimeout(800);
  const mobilePath = path.join(RAW, `${site.slug}-mobile.png`);
  await phone.screenshot({ path: mobilePath, type: "png" });
  await phone.close();

  return { deskPath, desk2Path, mobilePath };
}

function browserChromeSvg(w, h, radius = 18) {
  const bar = 36;
  return Buffer.from(`
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="#000" flood-opacity="0.55"/>
    </filter>
  </defs>
  <rect x="0" y="0" width="${w}" height="${h}" rx="${radius}" ry="${radius}" fill="#1c1c1c" filter="url(#s)"/>
  <circle cx="18" cy="${bar / 2}" r="5" fill="#ff5f57"/>
  <circle cx="36" cy="${bar / 2}" r="5" fill="#febc2e"/>
  <circle cx="54" cy="${bar / 2}" r="5" fill="#28c840"/>
  <rect x="72" y="10" width="${Math.max(80, w - 96)}" height="16" rx="8" fill="#2a2a2a"/>
</svg>`);
}

function phoneChromeSvg(w, h) {
  const r = 42;
  return Buffer.from(`
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="ps" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="22" stdDeviation="26" flood-color="#000" flood-opacity="0.6"/>
    </filter>
  </defs>
  <rect x="0" y="0" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="#0d0d0d" filter="url(#ps)"/>
  <rect x="12" y="12" width="${w - 24}" height="${h - 24}" rx="34" ry="34" fill="#111"/>
  <rect x="${w / 2 - 48}" y="22" width="96" height="22" rx="11" fill="#050505"/>
</svg>`);
}

async function framedBrowser(shotPath, outW, outH, chromeH = 36) {
  const pad = 18;
  const innerW = outW - pad * 2;
  const innerH = outH - pad * 2;
  const contentH = innerH - chromeH;
  const content = await sharp(shotPath)
    .resize(innerW, contentH, { fit: "cover", position: "top" })
    .png()
    .toBuffer();
  const chrome = await sharp(browserChromeSvg(innerW, innerH)).png().toBuffer();
  return sharp({
    create: {
      width: outW,
      height: outH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: chrome, left: pad, top: pad },
      { input: content, left: pad, top: pad + chromeH },
    ])
    .png()
    .toBuffer();
}

async function framedPhone(shotPath, outW, outH) {
  const bezel = 14;
  const notchReserve = 18;
  const innerW = outW - bezel * 2;
  const innerH = outH - bezel * 2 - notchReserve;
  const content = await sharp(shotPath)
    .resize(innerW, innerH, { fit: "cover", position: "top" })
    .png()
    .toBuffer();
  // Rounded content mask
  const mask = Buffer.from(`
<svg width="${innerW}" height="${innerH}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${innerW}" height="${innerH}" rx="28" ry="28" fill="#fff"/>
</svg>`);
  const rounded = await sharp(content)
    .composite([{ input: await sharp(mask).png().toBuffer(), blend: "dest-in" }])
    .png()
    .toBuffer();
  const chrome = await sharp(phoneChromeSvg(outW, outH)).png().toBuffer();
  return sharp({
    create: {
      width: outW,
      height: outH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: chrome, left: 0, top: 0 },
      { input: rounded, left: bezel, top: bezel + notchReserve },
    ])
    .png()
    .toBuffer();
}

async function saveJpgWebp(buf, base) {
  const jpg = path.join(OUT, `${base}.jpg`);
  const webp = path.join(OUT, `${base}.webp`);
  await sharp(buf).jpeg({ quality: 88, mozjpeg: true }).toFile(jpg);
  await sharp(buf).webp({ quality: 82 }).toFile(webp);
}

async function composeCombo(deskPath, mobilePath, accent, w, h) {
  const bg = await sharp({
    create: {
      width: w,
      height: h,
      channels: 3,
      background: accent,
    },
  })
    .png()
    .toBuffer();

  // Soft radial lift
  const glow = Buffer.from(`
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g" cx="50%" cy="42%" r="55%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
</svg>`);

  const desk = await framedBrowser(deskPath, Math.round(w * 0.78), Math.round(h * 0.52));
  const phone = await framedPhone(mobilePath, Math.round(w * 0.38), Math.round(h * 0.58));

  return sharp(bg)
    .composite([
      { input: await sharp(glow).png().toBuffer(), left: 0, top: 0 },
      { input: desk, left: Math.round(w * 0.04), top: Math.round(h * 0.06) },
      { input: phone, left: Math.round(w * 0.56), top: Math.round(h * 0.34) },
    ])
    .jpeg({ quality: 90 })
    .toBuffer();
}

async function composeHero(deskPath, accent, w, h) {
  const shot = await sharp(deskPath)
    .resize(w, h, { fit: "cover", position: "top" })
    .jpeg({ quality: 90 })
    .toBuffer();
  return shot;
}

async function composeWide(deskPath, accent, w, h) {
  const bg = await sharp({
    create: {
      width: w,
      height: h,
      channels: 3,
      background: accent,
    },
  })
    .png()
    .toBuffer();
  const framed = await framedBrowser(deskPath, Math.round(w * 0.9), Math.round(h * 0.86));
  return sharp(bg)
    .composite([
      {
        input: framed,
        left: Math.round(w * 0.05),
        top: Math.round(h * 0.07),
      },
    ])
    .jpeg({ quality: 90 })
    .toBuffer();
}

async function main() {
  await fs.mkdir(RAW, { recursive: true });
  await fs.mkdir(OUT, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  for (const site of SITES) {
    console.log("capturing", site.slug);
    const shots = await captureSite(browser, site);

    const cover = await composeCombo(shots.deskPath, shots.mobilePath, site.accent, 1400, 1750);
    await saveJpgWebp(cover, `${site.slug}-cover`);

    const board2 = await composeCombo(shots.desk2Path, shots.mobilePath, site.accent, 1400, 1750);
    await saveJpgWebp(board2, `${site.slug}-board-2`);

    const hero = await composeHero(shots.deskPath, site.accent, 1800, 1125);
    await saveJpgWebp(hero, `${site.slug}-hero`);

    const wide = await composeWide(shots.deskPath, site.accent, 1800, 1100);
    await saveJpgWebp(wide, `${site.slug}-wide`);

    console.log("wrote", site.slug);
  }

  await browser.close();
  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
