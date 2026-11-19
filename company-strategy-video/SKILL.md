---
name: company-strategy-video
description: 把一家公司的 GTM、增长或商业策略拆解成中文讲解视频（Remotion，MiniMax 男声，中英字幕），画面用访谈、官网和产品素材、真实网页与帖子、HTML 重建界面、机制动画和生成图混编，并产出小红书竖版封面和发布文案。用户说"把 XX 的 GTM 做成视频""拆解 XX 怎么做销售/增长/定价并做成视频""做一期公司策略视频""参考这个小红书视频做一期 XX"，或手上已有某公司的 startup-deepdive、podcast-dig 资料想做成视频时，都用这个 skill，即使没有明说"策略视频"。讲 AI 术语用 ai-term-explainer，讲技术架构用 tech-deepdive；只要文字报告、不做视频时用 startup-deepdive。
---

# 公司策略拆解视频

把一家公司"怎么把东西卖出去"讲清楚，做成观众看完能带走几条具体做法的视频。

有两件事决定这类视频的好坏，每一步都要回到这里：

1. **内容贴题。** 每个点都要回答"这和本期问题有什么关系、带来了什么结果"。观众记不住一串事实，只记得住讲透的几个点。
2. **画面不是 PPT。** 不把内容局限在书面的图解上，而是把公司的特点和元素、播客画面、真实网页、部分 HTML 和生成图混在一起，让画面像一条有素材的纪录片。

## 文件放哪

- 项目：`~/Technical Analysis/<公司>-<主题>/`（如 `Clay-GTM/`），视频工程在里面的 `video/`
- 定稿：**`~/Technical Analysis/成片-公司策略/`**，里面放成片、竖版封面、小红书文案，文件名都以 `<公司>-<主题>-` 开头（Janet 2026-11-09：每个视频 skill 一个固定的成片文件夹，所有公司的定稿都放这一个地方，不要散在各项目里；这个文件夹里的东西不删不移）
- 素材库在 Obsidian vault：`~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Janet's brain/Janet's AI Brain/`

## 流程

每个标了 **【给 Janet 看】** 的步骤，停下来等她确认再往下做。越早发现方向不对，返工越少；Clay 那期做到全片才发现脚本跑题，白渲染了好几轮。

### 1. 定题

用一句话写下**本期要回答的问题**，例如"发明 GTM Engineer 职位的 Clay，自己是怎么做销售的？"。之后每句台词都拿它来检验。问题不清楚就问 Janet，其他能自己判断的不要问。

### 2. 取材

先用现成的素材库，不够再补：

1. 查 `Startup Deepdive/<公司>/` 和 `Podcast Research/<公司>/`。
2. 缺资料时告诉 Janet，并运行 `startup-deepdive` 或 `podcast-dig` 补齐（资料多，用子 agent 读）。
3. 针对本期问题做定向挖掘，把每条事实连同**原话和出处**写进 `<项目>/research/`。写脚本时只用这里能追溯的内容。
4. 播客时间戳以 YouTube 字幕为准，vault 里的时间戳可能偏差十几分钟。

### 3. 框架 【给 Janet 看】

写 `<项目>/<公司> — Framework.md`：本期问题、一句话结论、几条策略（每条写做法、原因、结果）、证据来源。

### 4. 脚本 【给 Janet 看】

先读 `references/script-standards.md`。写 `video/SCRIPT.md`，时长由内容决定，不凑数也不硬压。

### 5. 建工程，定这一期的画面

```bash
python3 ~/.claude/skills/company-strategy-video/scripts/new_project.py "<项目路径>/video"
```

它会复制模板、安装依赖，并检查配音、听写、下载、截图、生图工具是否就绪。

然后读 `references/visual-method.md`：从这家公司提取视觉元素（改 `src/episode/brand.ts`），下载官方素材，**定一个贯穿全片的视觉主线**，再给每句台词选画面。

### 6. 开头样片 【给 Janet 看】

先做开头一分钟左右的成片。画风、声音、节奏都在这里确认，不要跳过直接做全片。

### 7. 全片

读 `references/production.md`，依次做：配音（**先用 `--draft` 占位，定稿再用付费声音**，见 production.md「配音」）→ 原声和逐段翻译 → 素材 → 镜头表 → `check_plan.py` → 抽帧看画面 → `render_full.sh` → 检查卡帧和音量。

修改很多轮时，只重做受影响的部分。交付前对照 `references/production.md` 末尾的清单。

### 8. 独立审片，修改，最多两轮

读 `references/independent-review.md`。全片渲染后，每一轮同时派三个全新的子 agent 审片：A 综合审片查事实、贴题、文字、画面有没有出错和故障；B "新观众"只拿到旁白和原声字幕，不了解这家公司，专查逻辑是否连贯、能否一路跟上；C 风格审片只看画面好不好看、像不像这家公司，先查硬规则，再拿参考片的帧比较差距（标准见 `references/style-review.md`）。

审片员越多意见越多，照单全收会一直改下去，所以按**收敛规则**处理（独立审片那份文件里有）：必须改的一定改；建议改每位审片员最多挑三条；口味问题和要删改内容结构的留给 Janet。**第二轮是验收**：新的审片员拿着第一轮的问题清单逐条验收，新发现只记必须改。最多两轮，两轮后不管还剩什么都先交给 Janet，不开第三轮，不追求分数；Janet 说只跑一轮时就只跑一轮。

做片的 agent 看自己的作品容易替它找理由，所以审片者不带制作上下文；B 连资料也不看，因为懂这家公司的人看不出跳跃。

### 9. 审片 【给 Janet 看】

把成片、脚本和两轮审片的简要说明一起发给她，说明里写清修了什么、哪些没改、哪些需要她拍板。她的修改意见里，凡是以后每期都适用的，更新到这个 skill 的 references。

### 10. 发布物料

读 `references/publish.md`，把成片移到 `~/Technical Analysis/成片-公司策略/`，做竖版封面和小红书文案（重点写"看完能学到什么"）。

### 11. 收尾清理（必做，不用再问）

Janet 2026-11-09：只留最后的成片，前面的版本和无关的工具及时删掉，不然文件太多她找不到定稿。

- **制作中**：新渲染出来、确认能播，上一版就放进废纸篓，不攒 v1 / v2 / v3。Janet 正在对比的两版先留着，她选完再删落选的。
- **成片移到 `~/Technical Analysis/成片-公司策略/` 之后**：清掉旧版和样片 mp4、配音和翻译的中间产物（付费配音的 `assets/vo/chunks/` 也是这时候才清，制作中不要清）、渲染和预览缓存、审片抽帧和截图、这一期临时写的一次性脚本、试过没用上的工具和素材、scratch 备份。
- **一律保留**：`~/Technical Analysis/成片-公司策略/` 里的成片、封面和文案，Framework、SCRIPT.md、镜头表、`research/`、`src/` 工程代码、最终用到的素材。
- 用 Finder 放进废纸篓（可恢复），不要 `rm`、不清空废纸篓。清完告诉她清了什么、多大。

## 参考文件

| 文件 | 什么时候读 |
|---|---|
| `references/script-standards.md` | 写和改脚本时 |
| `references/visual-method.md` | 选画面、取素材、生成图片时 |
| `references/production.md` | 动手制作时：命令、镜头表格式、HTML 模板、排错、交付清单 |
| `references/independent-review.md` | 全片渲染后，两轮独立审片：流程和审片任务书 |
| `references/style-review.md` | 审片员 C 的风格标准、打分和任务书 |
| `references/publish.md` | 做封面和文案时 |

`template/` 是可运行的工程模板，`scripts/new_project.py` 负责复制它。Clay 那期的完整工程在 `~/Technical Analysis/Clay-GTM/` 可以参考。

完成时提醒 Janet 更新项目 CLAUDE.md 的 Current status 并开新会话。
