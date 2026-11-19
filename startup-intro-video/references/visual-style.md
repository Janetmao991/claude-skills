# 画面风格：公司品牌风 + 创始人原声

目标是让观众觉得这条片子是在这家公司的世界里拍的。Clay 那期用了 clay.com 的米白纸底、森林绿、柠檬黄和官网上的黏土质感 3D 图标，一眼就是 Clay。

## 取品牌（改 `remotion/src/brand.ts`）

1. 打开官网首页、定价页、博客，截图存 `remotion/public/web/`（`cd remotion && node shot.mjs public/web "home=https://..."`），用 Read 看。
2. 取色：底色、正文色、主品牌色、强调色各一个，填进 `brand.ts` 的 `colors`。深色场景的底（`brandDeep`）取主品牌色压暗的版本。不要沿用模板里 Clay 的颜色。
3. 下载 logo（横版 → `logo`，方形 → `icon`）和官网上有辨识度的图形：图标、插画、产品截图、首页的循环视频。优先 press kit。原样使用，只用来指认这家公司；拿不到就只显示公司名，不仿制。
4. 字体：模板自带 Figtree（无衬线）、Instrument Serif 斜体（强调）、JetBrains Mono（小标签），这三样搭大多数科技公司都合适。官网字体风格差别大时（比如全衬线、全等宽），换成接近的免费字体，放 `public/fonts/` 并改 `lib/theme.ts`。中文走系统苹方（`ZH`）。

改完先出一张截图看：`node stills.mjs Episode 2 brand`。

## 一章一个场景组件

每章在 `remotion/src/scenes/` 写一个组件，在 `scenes/index.ts` 的 `WRITTEN` 里登记。没登记的章显示占位画面，全片随时能预览。

画面跟着旁白走，靠 `cue(章id, "旁白里的词")` 取时间：

```tsx
const S = "hook";
const tSeven = cue(S, "seven");          // 英文
const tSplit = cue(S, "七十一亿");        // 中文：直接写台词里的字
const big = env(t, tSeven - 0.1, tNext); // 这个画面从哪句出现到哪句消失
```

`lib/ui.tsx` 里现成的零件：`Ground`（浅色底）、`Chrome`（左上章节标签 + 右上 logo）、`Kicker` / `Display` / `Serif` / `Body`（四级文字）、`Card`、`Pill`、`Asset`（官网图标，会轻轻浮动）、`Num`（滚动数字）、`Mark`（荧光笔划过）。动画一律用 `useT()` 取时间自己算，CSS transition 渲染时不生效。

动手前看 `examples/clay/scenes/`，尤其是 `Hook.tsx`（四屏开场）、`What.tsx`（产品比喻）、`Gtme.tsx`（六步流程）、`MoatPosition.tsx`（对比和打分表）。这是要对齐的密度。

### 每章的画面怎么想

- **一句话一个画面事件。** 旁白每说到一个新东西，画面上就有东西出现、变化或被划掉。Clay 开场 20 秒换了四屏。一个画面停超过 8 秒没变化，观众就走神。
- **把机制演出来。** "每一列是一个动作"就画一张表，让列一格一格自己填上；"三个人的活变成一个人"就画三个人合成一个。只放一行字加一个图标是 PPT。
- **数字要大，要有参照。** 关键数字单独占一屏，滚动出现，旁边放对比对象。
- **真实素材优先。** 官网截图、产品界面、定价页、客户 logo 墙，比自己画的示意图可信。自己重建的界面和示意图在角上标"示意"（英文版 "illustration"）。
- **深浅交替。** 浅色底讲解，深色底（`brandDeep`）放开场、大数字和转折，章与章之间有节奏。
- **全片只有底部一条字幕。** 画面上的字是标题、标签和数字，不要把旁白整句再打一遍。

素材从哪来、怎么生成图片，见 `~/.claude/skills/company-strategy-video/references/visual-method.md` 的「素材从哪来」和「生成图片」两节。

## 创始人原声

原声由 `lib/frame.tsx` 的 `FounderClip` 自动包装，不用每章自己写：

- 访谈画面嵌在主品牌色的圆角画框里，画框从四周收进来。
- 左上名牌：姓名、职位 · 公司。右上：节目名 · 日期。观众要知道这是谁、在哪说的、什么时候说的。
- 一张贴纸在 `stickerAt` 秒弹出，三五个词点出这段话的要点（"no billing until $1M"）。贴纸在他说到那个点的时候出现，不要一开始就剧透。可以配一个官网图标（`icon`）。
- 字幕：英文版逐词亮起；中文版只出中文翻译，一段英文对一句中文。

`clips.json` 每段：

```json
"varun_stripe": {
  "yt": "DHNcr5kd6FE", "win": "00:15:40", "in": 42.4, "out": 51.62,
  "speaker": "Varun Anand", "role": "Co-founder",
  "show": "In Depth · First Round", "date": "Jan 2025",
  "sticker": "no billing until $1M", "stickerAt": 4.5, "icon": "piechart.avif",
  "fix": { "clay": "Clay" },
  "zh": ["逐段中文翻译，中文版才需要"]
}
```

挑片段时：

- 画面里要是说话的本人，不是主持人，也不是分屏里的小窗。下载后抽一帧确认。
- 起止点落在完整的句子上，开头别带上一句的尾巴。
- 只有音频的播客没有画面，不能用作原声画框。那句话改由旁白转述并注明出处（Clay 那期 Everett Berry 的那段就是这么处理的）。

## 不要这样

- 套上一期的颜色和图标只换 logo。
- 整屏一个标题加三个要点。
- 画面中间再放一条大字幕，和底部字幕打架。
- 用生成的人像冒充创始人，或给真人配他没说过的话。
- 同一张官网截图反复出现。
