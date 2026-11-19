// 每期只改这里：公司名、品牌色、图标。颜色从这家公司的官网或品牌素材里取，不要沿用上一期的。
export const BRAND = {
  name: "Company",
  // public/ 下的路径，例如 "web/logo.png"；没有就写 null
  icon: null as string | null,
  // 右上角的小水印，默认不用：它会和原声画框的节目标签、部分 HTML 卡片重叠
  watermark: "",
  colors: {
    stage: "#035D44", // 深色舞台背景、原声画框
    stageDeep: "#023B2B", // 更深的背景
    panel: "#10312A", // 舞台上的深色卡片
    line: "#2C5247", // 舞台上的线条
    paper: "#FEFDFB", // 浅色卡片
    cream: "#F4F3F0",
    sand: "#DAD4C8",
    border: "#E0DEDC",
    ink: "#1B1A18",
    mute: "#6F6B64",
    soft: "#BFD6CC", // 深色背景上的次要文字
    accent: "#EEF773", // 主强调色
    accent2: "#3BD3FD", // 第二强调色
    warm: "#FF7714", // 暖色强调
    violet: "#A17BF9",
    bad: "#FB4450",
    good: "#035D44",
  },
};
