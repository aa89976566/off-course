#!/usr/bin/env node
/**
 * Diverse Jieshin pitch boards: home / about / work detail / mobile — not duplicates.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("public/media/digital/pitch");
const RAW = "/tmp/jieshin-pitch-raw";
const ACCENT = "#0a0a0a";

async function hideChrome(page) {
  await page.evaluate(() => {
    document.querySelectorAll(".fixed, [class*='framer']").forEach((el) => {
      const t = (el.textContent || "").toLowerCase();
      if (t.includes("murals") || t.includes("made in framer")) {
        el.style.setProperty("display", "none", "important");
      }
    });
  });
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

async function composeCombo(deskPath, mobilePath, w, h) {
  const bg = await sharp({
    create: { width: w, height: h, channels: 3, background: ACCENT },
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

async function composeWide(deskPath, w, h) {
  const bg = await sharp({
    create: { width: w, height: h, channels: 3, background: ACCENT },
  })
    .png()
    .toBuffer();
  const framed = await framedBrowser(deskPath, Math.round(w * 0.9), Math.round(h * 0.86));
  return sharp(bg)
    .composite([{ input: framed, left: Math.round(w * 0.05), top: Math.round(h * 0.07) }])
    .jpeg({ quality: 90 })
    .toBuffer();
}

async function main() {
  await fs.mkdir(RAW, { recursive: true });
  await fs.mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  const desk = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  // 1) Archive home
  await desk.goto("https://jieshin.vercel.app/", {
    waitUntil: "networkidle",
    timeout: 90000,
  });
  await desk.waitForTimeout(1400);
  await hideChrome(desk);
  const homePath = path.join(RAW, "home.png");
  await desk.screenshot({ path: homePath, type: "png" });

  // 2) About — artist statement / influence
  await desk.goto("https://jieshin.vercel.app/about", {
    waitUntil: "networkidle",
    timeout: 90000,
  });
  await desk.waitForTimeout(1200);
  await hideChrome(desk);
  const aboutPath = path.join(RAW, "about.png");
  await desk.screenshot({ path: aboutPath, type: "png" });

  // 3) Work detail — process + narrative
  await desk.goto(
    "https://jieshin.vercel.app/works/2026-116-118-spg-dilston-church-tissue-paper-casting-tree",
    { waitUntil: "networkidle", timeout: 90000 }
  );
  await desk.waitForTimeout(1400);
  await hideChrome(desk);
  const workPath = path.join(RAW, "work.png");
  await desk.screenshot({ path: workPath, type: "png" });

  // 4) Degree / exhibition entry from home list hover area (scroll list)
  await desk.goto("https://jieshin.vercel.app/", {
    waitUntil: "networkidle",
    timeout: 90000,
  });
  await desk.waitForTimeout(800);
  await hideChrome(desk);
  await desk.evaluate(() => {
    const list = document.querySelector(".overflow-y-auto, aside .flex-1");
    if (list) list.scrollTop = 420;
  });
  await desk.waitForTimeout(600);
  const archivePath = path.join(RAW, "archive.png");
  await desk.screenshot({ path: archivePath, type: "png" });
  await desk.close();

  const phone = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await phone.goto("https://jieshin.vercel.app/", {
    waitUntil: "networkidle",
    timeout: 90000,
  });
  await phone.waitForTimeout(1200);
  await hideChrome(phone);
  const mobileHome = path.join(RAW, "mobile-home.png");
  await phone.screenshot({ path: mobileHome, type: "png" });

  await phone.goto(
    "https://jieshin.vercel.app/works/project-in-progress/reassembling-fragments-material-memory-and-perception-in-contemporary-art-2026",
    { waitUntil: "networkidle", timeout: 90000 }
  );
  await phone.waitForTimeout(1200);
  await hideChrome(phone);
  const mobileWork = path.join(RAW, "mobile-work.png");
  await phone.screenshot({ path: mobileWork, type: "png" });
  await phone.close();
  await browser.close();

  // Cover: home + mobile home
  await saveJpgWebp(await composeCombo(homePath, mobileHome, 1400, 1750), "jieshin-tseng-cover");
  // Board-2: about + mobile work (different from cover)
  await saveJpgWebp(await composeCombo(aboutPath, mobileWork, 1400, 1750), "jieshin-tseng-board-2");
  // Hero: work detail full bleed
  await saveJpgWebp(
    await sharp(workPath)
      .resize(1800, 1125, { fit: "cover", position: "top" })
      .jpeg({ quality: 90 })
      .toBuffer(),
    "jieshin-tseng-hero"
  );
  // Wide: archive framed
  await saveJpgWebp(await composeWide(archivePath, 1800, 1100), "jieshin-tseng-wide");
  // Extra labeled boards
  await saveJpgWebp(await composeWide(aboutPath, 1800, 1100), "jieshin-tseng-about");
  await saveJpgWebp(await composeWide(workPath, 1800, 1100), "jieshin-tseng-detail");
  await saveJpgWebp(
    await composeCombo(workPath, mobileWork, 1400, 1750),
    "jieshin-tseng-process"
  );

  console.log("jieshin pitch boards written");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
