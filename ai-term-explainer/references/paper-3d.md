# 纸模型 3D 镜头（等距微缩，纸质版）

2026-11-05 Janet 看了向量空间样片后定下：这是**可选的高光镜头**，后面每期遇到合适的地方就用。
样片：`~/AI-Terms/_samples/vector-space-3d/renders/vector-space-paper3d.mp4`
模板：`templates/paper-3d/`（`index.html` + `scene.js` + 本地 Three.js 0.186，不联网）

## 它是什么

把 tech-deepdive 的等距微缩世界（Three.js 正交等距相机）换成**纸质**：一块厚卡纸底座，上面立着纸卡、细竖杆、手绘感的纸圈。
画面还是"一切发生在纸上"，只是纸立起来了，像一本立体书。所以它不算"切到别的世界"，不违反视觉方向里那条规则。

## 每期固定用一次：开场预告全图（2026-11-05 起）

每期开场「这一期你能学到什么」都先亮一次这期的 3D 全图，念到哪件亮哪块（规则见 `framework.md`「开场的画面」）。所以 3D 全图每期都要做，开场预告 + 正片全图两处共用同一套场景代码。

## 什么时候用（除开场外，每期再挑 1–2 个镜头）

只用在**本身就有空间感的机制**上，让它当这一期"啊，原来是这样"的那个时刻：
- 有位置、有距离：向量空间、聚类、相似度
- 有东西在几处之间来回跑：信封 / 便条在模型、程序、工具之间传递
- 有层、有高度：几层楼的剖面、越堆越高的一摞、越转越厚的圈
- 一张全图：把整期讲过的角色摆在一块沙盘上，最后整体拉远

**不用**：商业篇（链条里的 logo、价格、融资）、风险篇、观点句、纸上屏幕（真实界面永远不倾斜进 3D）。这些手绘 + 真实 logo 就够了。

## 品牌规则照旧

- 底色 #FAF4E8 + 纸纹；渲染用 `NoToneMapping`，否则纸会发灰
- 只有灰阶 + 粉 #E5466E（+ 黄荧光只在 DOM 字幕里）；不加蓝色
- 纸卡上的字：手写体（Hannotate SC）；字幕：圆体 Yuanti SC 400；字体从 `~/AI-Terms/ai-embedding-ep1/assets/fonts/` 拷到项目 `assets/fonts/`
- 纸卡用 `MeshBasicMaterial` 贴字（不受光，字永远清楚），并且每帧 `quaternion.copy(camera.quaternion)` 正对镜头
- 位置如果是示意，标题下要写明"示意，不是真实坐标"；能用真实数据（比如第 1 期的真实 embedding 降到 3 维）就用真实数据

## 道具要长得像它本身（Janet 2026-11-05）

不要每个角色都用同一种方块。每个道具一眼就能认出是什么：
- 模型公司 = 一栋写着「模型公司」的办公楼 + 旁边一排服务器机柜，大脑卡立在楼顶
- 传话程序 = 纸笔记本电脑，屏幕上写名字
- 查订单 = 数据库圆柱（三层盘），办退货 = 牛皮纸包裹 + 回退箭头，查库存 = 小货架上摆纸箱
写法见 `~/AI-Terms/_samples/ep5-full-picture-3d/scene.js`（楼面贴图 `facade()`、机柜 `rackFace()`、`makeDB / makeParcel / makeShelf`）。

### 优先用图库的真模型（Janet 2026-11-05：自己搭的还是"墩墩"）
- 首选 **Kenney**（kenney.nl，CC0，不用署名，**不用登录**：点 Download → Continue without donating）。脚本下载会被网站拒（403），要请 Janet 在浏览器里点下载，zip 放「下载」文件夹。用过的包：City Kit (Commercial)（`building-skyscraper-*.glb` + `Textures/colormap.png`）、Furniture Kit（`laptop`、`cardboardBoxClosed`、`bookcaseOpen` 等）。
- Poly Pizza 要登录才能下载；CC BY 的模型发布时要署名，记在项目 `assets/models/CREDITS.md`。
- 加载用本地 `GLTFLoader`（连同 `utils/BufferGeometryUtils.js`、`utils/SkeletonUtils.js` 一起拷进 `lib/three/addons/`）。
- 颜色一律用 `paperize()` 改成纸质配色：贴图按亮度映射到 深灰→卡纸→米白，蓝色玻璃窗单独映射成中灰；纸箱用牛皮纸色阶。`fit()` 把模型缩放到指定高 / 宽、底面贴地。代码见 `~/AI-Terms/_samples/ep5-full-picture-3d/scene.js`。
- 图库里找不到的（比如数据库圆柱、机柜），继续手搭，但要做出特征（盘之间的黑线、机柜面板和指示灯）。
- 模型朝向不一定对着镜头：截帧看，不对就转 `rotation.y`（这次笔记本 0.72、书架 0.72）。

## 写法要点（踩过的坑）

- 所有画面只由时间 t 算出来：`hf-seek` 监听里调 `renderAt(t)`，重活放进 `window.__hf.buildReady[...]`；随机都用固定种子
- 根节点加 `data-no-timeline`
- 镜头转动要小：yaw 总共约 0.45 弧度（≈ 26°）就够看出立体；转太多，卡片会在画面里互相盖住，轴标签也会撞到字
- 画面整体往右下挪，给左上标题和底部字幕留位置：`setIso` 之后把 camera.left/right/top/bottom 一起减一个偏移
- 卡片别挤：按屏幕横向坐标 u ≈ x − 0.87z 估一下，同一高度的两张卡 u 至少差 1.9；开头和结尾两个角度都要截帧检查
- 连线从卡片下沿连到卡片上沿，不要从中心连，不然线会压住字
- 接影面只铺底座大小，不然卡片的影子会落到底座外面的空白里，看着像漂浮的灰条
- `PCFSoftShadowMap` 在 0.186 已经移除，用 `PCFShadowMap`
- 看 contact sheet 时画面位置会像在跳，那是拼图裁剪造成的；要看单帧原图

## 放进 Remotion 的期（如第 5 期）

`scene.js` 的 `renderAt(t)` 是纯函数，可以直接搬：在 Remotion 里用 `@remotion/three` 的 `<ThreeCanvas>`，或者自己建 renderer，在组件里用 `useCurrentFrame() / fps` 算出 t 再调 `renderAt`。DOM 字幕和标题改成 React 元素。
