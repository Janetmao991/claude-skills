// 每期先改这个文件：公司名、logo、品牌色。颜色和图标从这家公司的官网或 press kit 取，不要沿用上一期的。
// 下面是 Clay 那期的取值，留作参照（clay.com：米白纸底、森林绿、柠檬黄、黏土质感 3D 图标）。
export const BRAND = {
  name: "Company",
  series: "STARTUP INTRO", // 右上角的小字
  logo: null as string | null, // public/ 下的横版 logo，如 "web/logo.png"；没有就写 null，只显示公司名
  icon: null as string | null, // 方形小图标，用在原声画框的名牌上
  colors: {
    cream: "#F4F3F0", // 浅色场景的底
    paper: "#FEFDFB", // 卡片
    sand: "#DAD4C8",
    line: "#E0DEDC",
    ink: "#1B1A18", // 正文
    mute: "#6F6B64", // 次要文字
    brand: "#035D44", // 主品牌色：章节标签、深色卡片、原声画框
    brandDeep: "#023B2B", // 深色场景的底
    accent: "#EEF773", // 强调色：高亮、贴纸、深色底上的重点字
    accent2: "#3BD3FD", // 第二强调色
    red: "#FB4450", // 划掉、风险
    // 这家公司还有别的品牌色就加在下面，场景里用 C.xxx 取
    blue: "#395AFA",
    purple: "#A17BF9",
    orange: "#FF7714",
    pink: "#FF70D2",
    peach: "#FCC9AB",
  },
};
