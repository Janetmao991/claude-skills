// usage: node shot.mjs <outdir> name=url [name=url ...]   — 1920x1080 @2x screenshots, top of page
import { chromium } from "playwright-core";
const [out, ...jobs] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.HOME + "/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell" });
const ctx = await b.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1.5 });
for (const j of jobs) {
  const i = j.indexOf("="); const name = j.slice(0, i), url = j.slice(i + 1);
  const p = await ctx.newPage();
  try {
    await p.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await p.waitForTimeout(5000);
    for (const t of ["Reject All", "Reject all", "Decline"]) { const el = p.getByRole("button", { name: t }); if (await el.count()) { await el.first().click().catch(() => {}); await p.waitForTimeout(1000); break; } }
    await p.evaluate(() => {
      const hits = [...document.querySelectorAll("body *")].filter((el) => /^\s*We use cookies/i.test(el.textContent || "") && (el.textContent || "").length < 800);
      for (const h of hits) { let e = h; while (e && e !== document.body && !["fixed", "sticky"].includes(getComputedStyle(e).position)) e = e.parentElement; (e && e !== document.body ? e : h).remove(); }
    });
    await p.evaluate(() => { for (const el of document.querySelectorAll("body *")) { const cs = getComputedStyle(el); if ((cs.position === "fixed" || cs.position === "sticky") && /cookie|privacy|consent/i.test(el.textContent || "") && (el.textContent || "").length < 3000) el.remove(); } });
    await p.waitForTimeout(300);
    await p.screenshot({ path: `${out}/${name}.png` });
    console.log("ok", name);
  } catch (e) { console.log("FAIL", name, e.message.slice(0, 120)); }
  await p.close();
}
await b.close();
