// usage: node stills.mjs <compId> <sec,sec,...> [outPrefix]   — bundles once, renders stills at given seconds, makes a contact sheet
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { execSync } from "child_process";
const [id, secs, pre = id] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: "src/index.ts" });
const comp = await selectComposition({ serveUrl, id });
const outs = [];
for (const s of secs.split(",").map(Number)) {
  const out = `../review/${pre}_${s.toFixed(1)}.jpg`;
  await renderStill({ serveUrl, composition: comp, frame: Math.min(comp.durationInFrames - 1, Math.round(s * 30)), output: out, imageFormat: "jpeg", jpegQuality: 80 });
  outs.push(out);
}
if (outs.length === 1) { console.log(outs[0]); process.exit(0); } // 单张不用拼图
const n = outs.length, cols = Math.min(3, n), rows = Math.ceil(n / cols);
execSync(`ffmpeg -v error -y ${outs.map((o) => `-i "${o}"`).join(" ")} -filter_complex "${outs.map((_, i) => `[${i}]scale=640:360[v${i}]`).join(";")};${outs.map((_, i) => `[v${i}]`).join("")}xstack=inputs=${n}:layout=${outs.map((_, i) => `${(i % cols) * 640}_${Math.floor(i / cols) * 360}`).join("|")}${n < cols * rows ? ":fill=white" : ""}" ../review/${pre}_sheet.jpg`);
console.log(`../review/${pre}_sheet.jpg`);
