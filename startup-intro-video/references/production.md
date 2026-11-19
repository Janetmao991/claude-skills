# 制作

所有命令在 `video/` 下运行，除非另有说明。

## 配音

**付费配音只在定稿时用**（Janet 2026-11-10：几乎每天做视频，量大）。花钱的不是渲染，是「台词改了重新生成」。
- 改稿、对时间、看画面的阶段：`tools/tts_minimax.py --draft`，用 Mac 自带的 say 做占位配音，免费。给 Janet 看样片时说明这是占位声音。
- Janet 确认稿子不再改了，才去掉 `--draft` 用付费声音配一次，然后重新生成时间轴、抽帧复查、渲染最终版。换声音后每句的时间会变，不能只换音轨。
- 付费配音的分段缓存 ``sources/vo_chunks_mm/`` 在 Janet 确认成片之前不要清，这样定稿后的小改动只重新生成改的那一段。
- 试新声音只生成一两句样片，不配整片。

四个声音是 Janet 2026-11-06 盲听选定的，都是 MiniMax `speech-2.8-hd`：

| | 男声（默认） | 女声 |
|---|---|---|
| 英文 | `English_Gentle-voiced_man` | `English_CalmWoman` |
| 中文 | `Chinese (Mandarin)_Gentleman` | `Chinese (Mandarin)_Warm_Bestie` |

- 语言和声音写在 `script.json` 顶部：`"lang": "en" | "zh"`，`"voice": "male" | "female"`。开工前问 Janet 这期用哪个。
- Janet 觉得英文女声都差一点，`CalmWoman` 是其中最好的。她选英文女声时提醒一句。
- 动手前核对 `~/.claude/skills/ai-term-explainer/SKILL.md` 里的当前配音，那里换了，就改 `tools/tts_minimax.py` 里的 `VOICES`。不要用 Qwen、Kokoro。
- 用了哪个声音，发布后连同平台和数据记到 `~/AI-Terms/配音AB记录.md`，男女声哪个好靠数据定。

```bash
~/.cache/mlx-audio-venv/bin/python tools/tts_minimax.py            # 全部；--only hook,what 只配这几章
```

- 默认语速：英文 1.05（Clay 那期），中文 1.15。要改就在 `script.json` 加 `"speed"`。
- 台词没改的段不会重配，可以放心反复跑。按字数计费，别为了试效果整片重跑，用 `--only`。
- 每块生成后本地听写打分，低于 0.95 自动补一遍。跑完会列出仍然低分的块，这些要核对（人名被听写成别的字通常没问题，漏词、读错数字要重配：改一下那句的写法再跑）。
- 读音不对：项目根目录放 `tts_sub.json`，如 `{"Claygent": "Clay-jent", "Varun": "瓦伦"}`，只影响配音，字幕不变。中文版的年份自动读成"二零二一年"，常见缩写（GTM、ARR、CEO、AI）自动逐字母读。
- 英文里 `...` 会变成 0.4 秒停顿。
- API key 在 `~/.zshrc` 的 `MINIMAX_API_KEY`，脚本自己读。不要把 key 写进项目或聊天。

## 播客原声

1. `clips.json` 里写每段（字段见 `visual-style.md`）：`yt` 是 YouTube 视频 id，`win` 是 65 秒下载窗口的起点，`in` / `out` 是窗口内的秒数。
2. 用 YouTube 字幕定时间，不要信 vault 里转写的时间戳：
   ```bash
   yt-dlp --write-auto-subs --sub-langs en-orig --skip-download -o sources/vtt/<id> "https://www.youtube.com/watch?v=<id>"
   python3 tools/vtt2.py sources/vtt/<id>.en-orig.vtt <起秒> <止秒>     # 打印这一段的字幕，找完整句子的起止
   ```
3. `./dl_clips.sh` 下载窗口到 `sources/podcast/`（已有的跳过）。
4. 精确定 `in` / `out`：`tools/words.sh sources/podcast/<key>.mp4` 出逐词时间（`<key>.words.txt`）。也可以不写 `in` / `out`，改写 `"find": "片段里的几个词"`，`build.py` 会自动找到那句话的起止。
5. whisper 听错的词写进这段的 `fix`：`{"clay": "Clay", "turned": "churned"}`。公司名和人名几乎每期都要纠。
6. **中文版**：给每段写 `zh` 逐段翻译。先跑一次 `build.py`，它会打印这段英文是怎么分段的，按段数一句对一句写。翻译按意思来，不要逐词硬译。

## 排时间轴

```bash
python3 tools/build.py
```

把配音和原声首尾相接排好，写 `remotion/src/data/timeline.json`，并打印每章的起止和总时长。改了台词、重配了音、改了 `clips.json` 之后都要重跑。把总时长告诉 Janet，时长由她决定，不要自己为了压时长删内容。

## 写场景、检查、渲染

```bash
cd remotion && npx remotion studio                         # 预览。全片是 Episode，单独一章是 scenes/S-<章id>
cd remotion && node stills.mjs S-hook 3,9,15 hook          # 这一章第 3、9、15 秒的截图 + 拼图 → review/hook_sheet.jpg，用 Read 看
python3 tools/check_cues.py                                # 每个 cue() 的词都还在旁白里吗
cd remotion && npx tsc --noEmit -p .
tools/render_full.sh <输出名>                               # 分段渲染、拼接、限幅，报告音量和静止段 → renders/<输出名>.mp4
```

- **每写完一章就抽帧自己看**，挑毛病、改，过了再写下一章。看：文字有没有重叠、出框、换行错位；画面和这一刻的旁白对不对得上；有没有一屏停太久。
- 截图的秒数挑画面刚变完的时刻（卡点后 0.8 秒左右），每章至少看五六个点。
- 全片用 `render_full.sh`，不要一次性 `remotion render`：二十多分钟的片子一次渲染，Chrome 会内存耗尽。
- 只改了一两章时，单独渲染那一章来检查：`cd remotion && npx remotion render src/index.ts S-<章id> ../renders/<章id>.mp4`，确认后再整片渲染。

全片渲染后进入 `references/review.md` 的两轮审片。

## 踩过的坑

| 现象 | 原因和处理 |
|---|---|
| 画面在一章的后半段突然消失 | `env(t, a, 99)` 里用 99 表示"到这章结束"，但一章可能超过 99 秒。用 999 |
| `cue not found` 报错，预览白屏 | 台词改了，卡点的词没了。跑 `check_cues.py` 一次列全 |
| 卡点落在了错误的位置 | 这个词在这章出现了不止一次。用第三个参数选第几次：`cue(S, "data", 2)` |
| zsh 里循环调 `stills.mjs` 参数没拆开 | zsh 不自动拆词，用 `${=a}` |
| 原声字幕里公司名小写或被听错 | 写进 `clips.json` 这段的 `fix` |
| 原声画面是主持人 | 换时间窗，或这句改由旁白转述 |
| 中文版原声没有字幕 | `zh` 的句数和英文分段数对不上，看 `build.py` 打印的分段 |
| 渲染到一半 Chrome 内存耗尽 | 用 `render_full.sh` |
| 中断后重跑，画面还是旧的 | `render_full.sh` 会沿用已渲染的分段。改过画面要换输出名，或把 `renders/_parts_<名字>` 移到废纸篓 |
| 无头 Chrome 截网页卡死 | 用 `shot.mjs`，不要直接调 Chrome |
| 成片没有背景音乐 | Clay 那期没加。Janet 想要再加，音量压到不抢旁白 |

## 交付清单

- [ ] 开场问题在结尾得到了回答
- [ ] `framework.md` 的必答清单每条都有答案
- [ ] 每个术语、人名、公司名第一次出现时有解释
- [ ] 每个数字和引语都能在 `research/` 找到出处
- [ ] 每段原声前有铺垫、后有承接；画面是本人；名牌、节目、日期都对
- [ ] `tech.md` 里"还在用占位画面的章"是"无"
- [ ] `check_cues.py` 报 0
- [ ] `render_full.sh` 报告的每个静止段都核对过（画面本来就静的可以接受）
- [ ] 峰值低于 −1 dB 左右
- [ ] 重建的界面和示意图标了"示意"
- [ ] 两轮独立审片都跑完，`review/round-*/fixes.md` 记录了处理结果
- [ ] 总时长告诉了 Janet
