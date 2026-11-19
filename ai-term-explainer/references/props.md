# 道具库（assets/props.js）

为什么有它（Janet 2026-10-30）：画面里的物要画成它本来的样子，不用「方框 + 文字标签」代替。画好的道具存在这里，每期复用，风格始终统一，也越攒越多。

和「不要角色」不冲突：道具是场景里的一个物，出现在它该出现的那一镜；不做贯穿全片、和内容抢注意力的主持人。

## 目录

| 道具 | 调用 | s=1 的大小 | 画完用时 | 首次用在 |
|---|---|---|---|---|
| 客服机器人（圆角脑袋、点点眼、笑脸、粉天线、耳麦、小身体） | `SK.robot(tl, svg, x, y, at, {s, antenna, headset})` | 脑袋 96×84；整体约 126×153（x−15…x+111，y−31…y+122） | 1.3 秒 | 第 4 期开场「客服机器人」 |
| 模型 = 大脑（凹凸外轮廓、中线、每边两道长褶皱）。和机器人一起用：机器人是产品，大脑是它背后的模型 | `SK.brain(tl, svg, x, y, at, {s})` | 约 192×136（x−6…x+186，y−4…y+132）；标签写在下方或上方 | 1.1 秒 | 第 4 期 hook / scene / run 的「模型」 |
| 旋钮 = 模型里的一个参数（圆盘、五道刻度、粉色指针，可以转） | `SK.knob(tl, svg, x, y, at, {s, angle, ref})`；`ref.turn(tl, at, 角度, 时长)` 让它转 | 64×64，刻度向外多 8 | 0.6 秒 | 第 1 期「训练」三幕 |

`x, y` 是道具主体（机器人是脑袋）的左上角；`s` 缩放；返回画完的时间，可以接着排下一笔。标签文字照旧用 HTML 的 `.lb` 写在道具下面。

同一个东西全片只用一个道具：「模型」出现几次就画几次大脑，不要这里大脑、那里方框。

## 新增一个道具

1. 先在场景里直接画（`SK.path` / `SK.ellipse` / `SK.dot`），**截帧自查**（production.md「检查和渲染」第 3 步），给 Janet 看。
2. 她认可后，搬进 `templates/video/assets/props.js`：坐标改成相对主体左上角，路径只用绝对的 M / L / Q / Z（`tf()` 按对平移缩放），签名照 `SK.robot`。
3. 在上面目录加一行；把已有项目里的 `assets/props.js` 也更新（新项目由 `new_term.py` 自动带上）。
4. 颜色只用 `C.ink` 和 `C.pink`（画板会换色），不要写死色值。

简单的东西（机器人、文档、服务器、放大镜）自己画就够；复杂的（人的动作、家具）可以从 Excalidraw 素材库找手绘 SVG 改，它和画板一样基于 rough.js。下载前先问 Janet，并看清授权。

## Excalidraw 素材（`assets/props-ex.js`，91 个）

Janet 2026-10-31 同意下载：Excalidraw 官方素材库（https://github.com/excalidraw/excalidraw-libraries ，MIT 授权，原文件和 LICENSE 在 `props-src/excalidraw/`）里的 8 套：火柴人（stick-figures、stick-people、stick-figures-collaboration）、办公和电脑（office-items、computers）、通用小图标（awesome-icons、artem-s-icons、some-handdrawn-signs）。

- 调用：`SK.ex("<套名>/<名字>", tl, svg, x, y, at, {w: 宽度 | s: 缩放, dur: 画多久})`，返回画完的时间。`SK.exSize(key)` 给原始宽高。
- **挑之前先看目录图** `props-src/excalidraw/sheet.html`（每个道具带名字）。常用：`awesome-icons/lock` 锁、`awesome-icons/search` 放大镜、`awesome-icons/briefcase` 公文包、`artem-s-icons/files` 一摞文档、`office-items/letter` 一页纸、`stick-figures/child` 小孩、`stick-people/stick-woman-thinking` 思考的人、`stick-figures-collaboration/presentation` 两人举牌、`computers/laptop` 笔记本电脑、`some-handdrawn-signs/check` / `cross` 手写勾叉。
- 转换时颜色统一成画板墨色（黑线 → `C.ink`，彩色线 → `C.pink`），填充去掉、文字去掉（标签照旧用 `.lb`），所以和自己画的道具同一个画风，换画板也会跟着变色。
- 再加一套：把 `.excalidrawlib` 放进 `props-src/excalidraw/`（下载前问 Janet），跑 `python3 -I scripts/excalidraw_props.py`，新文件自动带进新项目；已有项目手动复制 `assets/props-ex.js`。没名字的道具在脚本的 `NAMES` 里起名。
- 不收第三方「公司 logo 仿制品」库（规则：公司只用官方 logo）。
