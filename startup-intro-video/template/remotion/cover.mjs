// usage: node cover.mjs <html 绝对路径> <输出 png 绝对路径> [宽 高]
import { chromium } from "playwright-core";
const [html, out, w = "1080", h = "1440"] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.HOME + "/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell" });
const p = await (await b.newContext({ viewport: { width: +w, height: +h } })).newPage();
await p.goto("file://" + html);
await p.waitForTimeout(1200);
await p.screenshot({ path: out });
await b.close();
console.log(out);
