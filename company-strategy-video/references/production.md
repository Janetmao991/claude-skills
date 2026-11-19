# 制作

所有命令在 `video/` 下运行，除非另有说明。

## 配音

**付费配音只在定稿时用**（Janet 2026-11-10：几乎每天做视频，量大）。花钱的不是渲染，是「台词改了重新生成」。
- 改稿、对时间、看画面的阶段：`tools/build_vo_mm.py --draft`，用 Mac 自带的 say 做占位配音，免费。给 Janet 看样片时说明这是占位声音。
- Janet 确认稿子不再改了，才去掉 `--draft` 用付费声音配一次，然后重新生成时间轴、抽帧复查、渲染最终版。换声音后每句的时间会变，不能只换音轨。
- 付费配音的分段缓存 `assets/vo/chunks/` 在 Janet 确认成片之前不要清，这样定稿后的小改动只重新生成改的那一段。
- 试新声音只生成一两句样片，不配整片。

```bash
~/.cache/mlx-audio-venv/bin/python tools/build_vo_mm.py          # 默认语速 1.15；--speed 1.0 可调
```

- 动手前核对 `~/.claude/skills/ai-term-explainer/SKILL.md` 里的当前配音，那里变了就跟着变。现在是 MiniMax `speech-2.8-hd`，男声 `Chinese (Mandarin)_Gentleman`。不要用 Qwen R5。
- 只重新生成改过的段落，可以放心反复跑。
- 跑完看 `assets/vo/chunks/report.txt`：标 `<<<` 的段要核对，但人名被听写成别的字通常没问题。
- 读音不对：项目根目录放 `tts_sub.json`，如 `{"Varun": "瓦伦"}`，只影响配音。年份已自动转成"二零二一年"。

## 播客原声

1. `clips.json` 里写每段：`yt`、`win`（下载窗口起点）、`in`/`out`（窗口内秒数）、`speaker`、`role`、`show`、`date`。
2. 用 YouTube 字幕定时间：`yt-dlp --write-auto-subs --sub-langs en-orig --skip-download -o sources/vtt/<id> <url>`，再 `python3 tools/vtt2.py sources/vtt/<id>.en-orig.vtt <起秒> <止秒>`。起止点要落在完整的句子上。
3. `./dl_clips.sh` 下载，`python3 tools/prep_clips.py` 裁切。
4. 脚本会打印每段的英文分段。给 `zhs` 逐段写中文翻译，**一段对一句**，主持人的插话也要译（"（主持人：是的。）"）。翻译按意思来，不要望文生义。
5. 听写错的词写进这段的 `fix`：`{"Nikolai": "Nicolae"}`。

## 素材

```bash
python3 tools/broll.py                                    # 按 broll.json 裁静音素材，并给每段访谈生成 v_<key>
cd remotion && node shot.mjs public/broll "pricing=https://example.com/pricing"   # 截网页到 public/broll/pricing.png
```

## 镜头表 `remotion/src/episode/shots.json`

一个数组，每项挂在一句台词上，从这句开始，到下一项开始为止。没有挂镜头的句子沿用上一个镜头。

```json
[
  { "at": "h1", "m": { "v": "broll/v_founder_a.mp4" }, "dim": 0.1,
    "cuts": [ { "k": "定价", "m": { "img": "broll/pricing.png", "from": [1, 50, 0], "to": [1.1, 50, 5] }, "tag": "example.com/pricing" } ] },
  { "at": "h2", "m": { "post": { "platform": "linkedin", "name": "Jane Doe", "sub": "CEO at Acme", "date": "2026-01-27", "text": "原文逐字", "hl": "要高亮的一句", "stats": "👍 321 · 💬 43", "bg": "broll/v_founder_a.mp4" } } },
  { "at": "h3", "m": { "img": "gen/stage.png" }, "tag": "示意" },
  { "at": "b1", "m": { "kit": "compare", "props": { } }, "tag": "示意" }
]
```

| 字段 | 含义 |
|---|---|
| `m` | 媒体：`v` 视频、`img` 图片（`from`/`to` 是 `[缩放, x%, y%]`）、`post` 帖子卡、`kit` HTML 模板、`scene` 本期自定义画面 |
| `tag` | 左上角的小标签：出处或"示意" |
| `dim` | 压暗，0–1 |
| `hit` | 切入时加低音，用于重要数字 |
| `cuts` | 这句话说到 `k` 时切到下一个画面 |

卡点 `k` 和 HTML 里的 `at`：台词里的词（不带空格，对齐数据里没有空格）、`["句id","词"]`、或相对这句开始的秒数。

## HTML 模板（`kit`）

| `kit` | 用途 | `props` |
|---|---|---|
| `chat` | 重建社区/聊天 | `app, channel, note?, sidebar?, msgs:[{who,text,at?,badge?}]` |
| `rows` | 重建列表（账单、线索） | `brand?, brandColor?, title, rows:[{a,b?,c?,status?}], side?:[{label,value?,at?}]` |
| `feed` | 信息流 | `posts:[{who,text}], network?, leftTitle?, leftSub?, rightTitle?, right?:[...], rightAt?, fastAt?` |
| `compare` | 两种模式对比 | `left/right:{title,note?,at?,barFrom,barTo,barColor?,barLabel?,people?:{total,keep},cells?:{n,label}}` |
| `flow` | 流程 | `steps:[{label,sub?,at?,color?}]` |
| `hub` | 多个分散 → 汇聚为一个 | `spokes:[...], tileNote?, beforeNote?, hub, hubSub?, mergeAt?, chips?:[{text,at?}]` |
| `bars` | 数据对比 | `title?, items:[{label,value,n,at?,color?}], note?` |
| `curve` | 增长曲线 | `xs:[...], ys:[...], from?, to?, callouts?:[{i,text}], note?` |
| `rings` | 由内向外扩张 | `center, centerSub?, rings:[{label,at?}]`（由内到外） |
| `checklist` | 总结清单，讲到哪条亮哪条 | `items:[{line,label,icon?}], cols?` |

模板不够用时，在 `src/episode/scenes.tsx` 写本期专属画面，用 `{"scene":"名字"}` 调用。动画用 `useCurrentFrame` 计算，CSS transition 在渲染时不生效。

## 检查和渲染

```bash
python3 tools/check_plan.py                                  # 卡点、素材、镜头时长
cd remotion && npx tsc --noEmit -p . && node stills.mjs Episode 5,10,20 名字   # 出截图到 review/，用 Read 看
tools/render_full.sh <输出名>                                 # 分段渲染、拼接、限幅、报告音量和静止段
```

全片渲染后进入 `references/independent-review.md` 的两轮审片，用 `tools/review_pack.py` 生成审片材料。

## 踩过的坑

| 现象 | 原因和处理 |
|---|---|
| 上一幕的最后一秒卡住 | 素材比镜头短。模板已循环播放，超过约 6 秒的镜头用 `cuts` 拆开，别把素材拉长 |
| 切点没生效，镜头拖很久 | 卡点词带空格，或台词改了；跑 `check_plan.py` |
| 渲染到一半 Chrome 内存耗尽 | 不要一次渲染全片，用 `render_full.sh` |
| 音量峰值到 0 dB | 音效叠配音造成，`render_full.sh` 已限幅 |
| 年份读成"两千零二十一" | 已自动处理，写成 `2021 年`，数字和"年"之间最多一个空格 |
| 无头 Chrome 截网页卡死 | 用 `shot.mjs`（playwright），不要直接调 Chrome |
| cookie 弹窗挡内容 | `shot.mjs` 会尝试关掉；关不掉就用 `from`/`to` 只取页面上方 |
| 改台词后画面对不上 | 重跑配音后再跑 `check_plan.py` |
| 中断后用旧分段 | 改过画面要换输出名，或把 `renders/_parts_<名字>` 移到废纸篓 |

## 交付清单

- [ ] 每句台词都能追溯到 `research/` 的出处，数字核对过
- [ ] 每个点都有做法、和主题的关系、结果
- [ ] 按 `references/visual-method.md` 选了画面，同一素材没有反复出现
- [ ] 只有一条字幕，每段原声都有逐段中文翻译
- [ ] `check_plan.py` 没有问题
- [ ] `motion_check.py` 没有停住的段（用正式配音的成片检查；画面本来就静的不算理由）
- [ ] 峰值低于 −1 dB 左右，总帧数等于时长 × 30
- [ ] 生成图和重建界面都标了"示意"
- [ ] 两轮独立审片都跑完，`review/round-*/fixes.md` 记录了处理结果
- [ ] 中间文件移到废纸篓，不要 `rm`
