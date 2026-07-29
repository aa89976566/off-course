#!/usr/bin/env node
/**
 * Re-capture Crespidia only — hide cookie UI without navigating away.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Reuse compose helpers by inlining a slim version
const OUT = path.resolve("public/media/digital/pitch");
const RAW = "/tmp/pitch-raw-clean";
const SITE = {
  slug: "crespidia-coffee",
  url: "https://aa89976566.github.io/Crespidia-coffee/",
  accent: "#1a1510",
};

async function cleanPage(page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("crespidia-cookies", "essential");
      localStorage.setItem("cookie-consent", "essential");
      localStorage.setItem("cookies-accepted", "1");
      localStorage.setItem("cookieConsent", "essential");
    } catch {}
  });
  await page.goto(SITE.url, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(1000);

  // Prefer clicking only cookie-banner buttons (not nav links)
  await page.evaluate(() => {
    const roots = Array.from(
      document.querySelectorAll(
        '[id*="cookie" i], [class*="cookie" i], [aria-label*="cookie" i], dialog, [role="dialog"]'
      )
    );
    for (const root of roots) {
      const btns = Array.from(root.querySelectorAll("button"));
      const prefer = btns.find((b) =>
        /ok|essential|accept|agree|got it/i.test(b.textContent || "")
      );
      if (prefer) {
        try {
          prefer.click();
        } catch {}
      }
    }
  });
  await page.waitForTimeout(500);

  // Hard-hide any remaining cookie UI / dialogs
  await page.evaluate(() => {
    const hide = (el) => {
      if (!el) return;
      el.style.setProperty("display", "none", "important");
      el.style.setProperty("visibility", "hidden", "important");
      el.style.setProperty("opacity", "0", "important");
      el.style.setProperty("pointer-events", "none", "important");
    };
    document
      .querySelectorAll(
        '[id*="cookie" i], [class*="cookie" i], [aria-label*="cookie" i], dialog, [role="dialog"], [aria-modal="true"]'
      )
      .forEach(hide);

    // fixed bottom banners mentioning cookies
    document.querySelectorAll("div, section, aside").forEach((el) => {
      const style = getComputedStyle(el);
      const text = (el.textContent || "").toLowerCase();
      if (
        text.includes("cookie") &&
        (style.position === "fixed" || style.position === "sticky") &&
        el.clientHeight < window.innerHeight * 0.55
      ) {
        hide(el);
      }
    });
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
  });

  // If we somehow landed on /cookies, go back home
  if (/cookie/i.test(page.url())) {
    await page.goto(SITE.url, { waitUntil: "networkidle", timeout: 90000 });
    await page.waitForTimeout(800);
    await page.evaluate(() => {
      document
        .querySelectorAll(
          '[id*="cookie" i], [class*="cookie" i], dialog, [role="dialog"]'
        )
        .forEach((el) => {
          el.style.setProperty("display", "none", "important");
        });
    });
  }

  await page.waitForTimeout(700);
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
  await sharp(buf).jpeg({ quality: 88, mozjpeg: true }).toFile(path.join(OUT, `${base}.jpg`));
  await sharp(buf).webp({ quality: 82 }).toFile(path.join(OUT, `${base}.webp`));
}

async function composeCombo(deskPath, mobilePath, accent, w, h) {
  const bg = await sharp({
    create: { width: w, height: h, channels: 3, background: accent },
  })
    .png()
    .toBuffer();
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

async function main() {
  await fs.mkdir(RAW, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  const desk = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  await cleanPage(desk);
  console.log("url after clean", desk.url());
  const deskPath = path.join(RAW, `${SITE.slug}-desk.png`);
  await desk.screenshot({ path: deskPath, type: "png" });
  await desk.evaluate(() => window.scrollTo(0, Math.min(900, document.body.scrollHeight * 0.35)));
  await desk.waitForTimeout(500);
  const desk2Path = path.join(RAW, `${SITE.slug}-desk-2.png`);
  await desk.screenshot({ path: desk2Path, type: "png" });
  await desk.close();

  const phone = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await cleanPage(phone);
  console.log("mobile url", phone.url());
  const mobilePath = path.join(RAW, `${SITE.slug}-mobile.png`);
  await phone.screenshot({ path: mobilePath, type: "png" });
  await phone.close();
  await browser.close();

  const cover = await composeCombo(deskPath, mobilePath, SITE.accent, 1400, 1750);
  await saveJpgWebp(cover, `${SITE.slug}-cover`);
  const board2 = await composeCombo(desk2Path, mobilePath, SITE.accent, 1400, 1750);
  await saveJpgWebp(board2, `${SITE.slug}-board-2`);
  const hero = await sharp(deskPath)
    .resize(1800, 1125, { fit: "cover", position: "top" })
    .jpeg({ quality: 90 })
    .toBuffer();
  await saveJpgWebp(hero, `${SITE.slug}-hero`);
  const wideBg = await sharp({
    create: { width: 1800, height: 1100, channels: 3, background: SITE.accent },
  })
    .png()
    .toBuffer();
  const framed = await framedBrowser(deskPath, 1620, 946);
  const wide = await sharp(wideBg)
    .composite([{ input: framed, left: 90, top: 77 }])
    .jpeg({ quality: 90 })
    .toBuffer();
  await saveJpgWebp(wide, `${SITE.slug}-wide`);
  console.log("crespidia done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
