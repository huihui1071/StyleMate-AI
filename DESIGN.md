---
name: StyleMate AI
description: 一个由产品官网与智能导购工作台组成的匿名时尚零售体验
colors:
  oxblood-annotation: "oklch(0.49 0.14 26)"
  acid-proof: "oklch(0.84 0.15 111)"
  warm-paper: "oklch(0.955 0.013 76)"
  deep-paper: "oklch(0.925 0.018 75)"
  editorial-ink: "oklch(0.22 0.018 65)"
  muted-caption: "oklch(0.53 0.018 66)"
  hairline: "oklch(0.81 0.018 72)"
  verified-green: "oklch(0.55 0.09 145)"
typography:
  display:
    fontFamily: "Avenir Next, Helvetica Neue, PingFang SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "clamp(3rem, 4vw, 4.5rem)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.045em"
  body:
    fontFamily: "Avenir Next, Helvetica Neue, PingFang SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Avenir Next, Helvetica Neue, PingFang SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "0.62rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.16em"
rounded:
  square: "0px"
  status: "999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "42px"
components:
  task-action:
    backgroundColor: "{colors.warm-paper}"
    textColor: "{colors.editorial-ink}"
    rounded: "{rounded.square}"
    padding: "15px 16px"
    height: "44px"
  task-action-hover:
    backgroundColor: "{colors.acid-proof}"
    textColor: "{colors.editorial-ink}"
    rounded: "{rounded.square}"
    padding: "15px 16px"
  input-field:
    backgroundColor: "{colors.warm-paper}"
    textColor: "{colors.editorial-ink}"
    rounded: "{rounded.square}"
    padding: "13px 15px"
    height: "64px"
  membership-notice:
    backgroundColor: "{colors.warm-paper}"
    textColor: "{colors.editorial-ink}"
    rounded: "{rounded.square}"
    padding: "26px"
---

# Design System: StyleMate AI

## Overview

**Creative North Star: "编辑部试衣桌"**

界面像一间安静、明亮的当代试衣空间：自然材质、服装轮廓、人物造型与工作中的选款界面共同构成品牌语言。官网负责建立产品印象与解释业务价值，工作台负责完成真实任务；两者共享纸色、批注红和克制的操作反馈。

官网采用长页叙事：价值主张、原创时尚主视觉、可操作精简 Demo、三项能力、工作流程、可信机制与最终行动。完整工作台继续采用单列任务流，先显示推荐结论和商品，再把商品事实、筛选依据、会员权益与人工接管放到各自需要出现的位置。

**Key Characteristics:**

- 暖纸色背景与墨色发丝线构成主要空间。
- 牛血红只用于批注、当前能力与关键判断。
- 酸性黄绿只用于键盘焦点和展开后的可信度说明。
- 商品视觉使用项目资料中的真实白底图与少量穿着图，下载为本地静态资源并移除源链接与文件元数据。
- 官网主视觉使用原创匿名时尚摄影，不出现真实品牌、标志或受保护设计。
- 状态变化快速、克制，并尊重减少动效设置。

## Colors

这是一套受印刷纸张与编辑批注启发的克制配色，颜色首先表达信息层级。

### Primary

- **牛血批注红**：用于当前能力、重要标题片段、编号和价格，任何单屏占比不得超过 10%。

### Secondary

- **校样酸黄**：只用于证据说明和关键可信度提示，不用于大面积背景或主要按钮。

### Neutral

- **暖纸白**：主工作区和商品底色。
- **深纸米**：导航与次级面板，用轻微色温差建立层级。
- **编辑墨色**：主文本、关键边框与会员提示反色背景。
- **批注灰**：说明、标签与非关键元数据。
- **发丝线灰**：表格、栏目与列表分隔。
- **验证绿**：在线、通过与零违规状态。

**The Annotation Rule.** 红色是编辑批注，不是装饰。若一个元素既不是当前状态也不是关键判断，它不得使用红色。

**The Proof Highlight Rule.** 酸黄只回答“为什么可信”，不得扩散到普通导航、商品图或大按钮。

## Typography

**Display Font:** Avenir Next（中文回退 PingFang SC、Microsoft YaHei 与系统无衬线）
**Body Font:** 与展示字体共用稳定的现代无衬线字体栈

**Character:** 以克制的字重、紧凑字距和明确尺度建立时尚编辑感，而不依赖不同设备表现不稳定的中文衬线回退。标题与正文共用字体骨架，通过层级而非字体冲突区分叙事和操作。

### Hierarchy

- **Display**（600，响应式 3–4.5rem，1.12）：用于官网首屏；Demo 首问上限 4rem，允许轻微负字距。
- **Section**（600，响应式 2.3–3.5rem，1.15）：用于官网章节标题，不与 Display 争夺层级。
- **Headline**（500–600，1.05–1.55rem，1.6–1.68）：AI 回答、搭配结论与商品详情标题。
- **Title**（600，0.82–1rem，1.4）：商品名、导航能力和区块标题。
- **Body**（400，0.78–1rem，1.7）：需求、解释与业务说明，正文行长上限 68ch。
- **Label**（700，0.57–0.66rem，0.10–0.16em）：英文 eyebrow、规则状态和编号，统一大写。

**The One-Skeleton Rule.** 叙事与操作共享无衬线骨架；判断由尺寸、字重、留白和颜色表达。按钮、输入、导航和状态标签保持紧凑，不跟随展示标题放大。

## Elevation

系统不使用阴影。深度由 1px 发丝线、纸色层级、粘性定位与反色区块建立。商品在悬停时仅对内部 SVG 做轻微缩放，容器不漂浮。

**The Flat Desk Rule.** 所有表面默认与桌面齐平。若一个区域需要阴影才能被看见，说明边界、色阶或信息架构有问题。

## Components

### Buttons

- **Shape:** 直角编辑控件（0px）；状态圆点是唯一使用全圆角的控件。
- **Primary:** “开始推荐”和“发送”使用编辑墨色背景与暖纸色文字，最小触控高度 44px。
- **Hover / Focus:** 示例任务以底线反馈悬停；所有焦点使用 3px 高对比外轮廓，偏移 3px。
- **Secondary:** 文字动作透明背景，箭头在悬停时水平移动 3px。

### Cards / Containers

- **Corner Style:** 全部直角。
- **Background:** 商品视觉从对应服装色与深纸米混合产生，每张图保持内部发丝线框。
- **Shadow Strategy:** 禁止阴影；使用相邻分隔线和负空间。
- **Border:** 关键区域 1px 编辑墨色，次级区域 1px 发丝线灰。
- **Internal Padding:** 商品元数据紧贴商品图，会员提示使用上下分隔线，工作区使用 16–56px 响应式边距。

### Inputs / Fields

- **Style:** 暖纸背景、1px 墨色全边框、直角；textarea 最小高度 64px。
- **Focus:** 3px 校样色外轮廓，不改变布局尺寸。
- **Error / Disabled:** 禁用按钮使用发丝线灰；错误与离线状态使用危险红圆点及文字说明。

### Navigation

桌面与移动端都使用紧凑顶部栏。品牌在左，服务状态和当前虚构会员在右；会员切换直接影响后续推荐，不再占用独立侧栏。功能能力不作为导航展示，而由三个自然语言示例表达。

### Decision Trace

决策依据是结果后的渐进披露组件。每次回答末尾提供“为什么这样推荐”，展开后按确认顺序显示硬条件，并说明先筛选再排序的边界。商品事实直接在对应商品卡内展开，不使用常驻侧栏或模态框。

### Product Art

推荐卡和搭配卡统一使用真实商品图片，保持 4:5 视觉窗口与居中裁切。图片文件仅使用匿名 Demo SKU 命名；界面不显示原始品牌、源 SKU、原始链接或来源文件名。编号和材质标签覆盖在低透明暖纸色底上，确保白底商品图仍有稳定对比度。

## Do's and Don'ts

### Do:

- **Do** 用 1px 分隔线、纸色色差和充足留白组织商品与解释。
- **Do** 先给推荐结论和商品，再让用户一键展开“为什么推荐”。
- **Do** 保持交互控件至少 44px，并为键盘用户提供 3px 可见焦点。
- **Do** 在 760px 以下将商品与搭配变为可吸附的水平滚动序列。
- **Do** 使用 150–250ms 的状态过渡，并遵守 `prefers-reduced-motion`。

### Don't:

- **Don't** 做常见的紫色渐变 AI 聊天页。
- **Don't** 使用玻璃拟态、霓虹色或装饰性光效暗示“智能”。
- **Don't** 堆叠同尺寸圆角卡片，不让页面像组件库样例。
- **Don't** 常驻展示能力清单、版本号、数据声明与零值守护指标。
- **Don't** 模仿真实企业或真实品牌视觉，不展示来源资料中的标志、口号、源 SKU 或原始图片链接。
- **Don't** 为了编辑感牺牲按钮、筛选、状态和错误提示的可理解性。
- **Don't** 使用大于 1px 的彩色单侧边框、渐变文字或嵌套卡片。
