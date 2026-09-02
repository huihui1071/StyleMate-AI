---
name: StyleMate AI
description: 一张把自然语言需求变成可验证选择的编辑部试衣桌
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
    fontFamily: "Noto Serif SC, Songti SC, serif"
    fontSize: "clamp(2.5rem, 5vw, 5rem)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.06em"
  body:
    fontFamily: "Avenir Next, Noto Sans SC, PingFang SC, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Avenir Next, Noto Sans SC, PingFang SC, system-ui, sans-serif"
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
    backgroundColor: "{colors.editorial-ink}"
    textColor: "{colors.warm-paper}"
    rounded: "{rounded.square}"
    padding: "26px"
---

# Design System: StyleMate AI

## Overview

**Creative North Star: "编辑部试衣桌"**

界面像一张正在工作的时尚编辑部试衣桌：纸张、批注、款式编号与选择依据并排出现。编辑感来自构图、留白、字级和服装轮廓，不来自奢侈品拟态或装饰光效。使用者在一次任务中就能看见商品、规则、会员状态与接管边界如何协作。

产品保持高信息密度，但每个区域只有一个明确职责。左栏定义身份与能力，中间完成任务，右栏持续展示决策证据。移动端隐藏两侧栏，保留任务入口、对话结果与固定输入区。

**Key Characteristics:**

- 暖纸色背景与墨色发丝线构成主要空间。
- 牛血红只用于批注、当前能力与关键判断。
- 酸性黄绿只标记“为什么可信”等证据提示。
- 所有商品视觉由代码生成的抽象服装轮廓承担。
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

**Display Font:** Noto Serif SC（回退 Songti SC 与系统衬线）  
**Body Font:** Avenir Next（回退 Noto Sans SC、PingFang SC 与系统无衬线）

**Character:** 衬线标题提供时尚出版物的判断力，无衬线正文负责工具界面的精确性。二者不混用于同一层级。

### Hierarchy

- **Display**（500，响应式 2.5–5rem，1.08）：仅用于首屏主命题，允许负字距。
- **Headline**（500，1.15–1.5rem，1.7）：AI 回答、搭配结论与商品详情标题。
- **Title**（600，0.82–1rem，1.4）：商品名、导航能力和区块标题。
- **Body**（400，0.78–1rem，1.7）：需求、解释与业务说明，正文行长上限 68ch。
- **Label**（700，0.57–0.66rem，0.10–0.16em）：英文 eyebrow、规则状态和编号，统一大写。

**The Two-Voices Rule.** 衬线负责判断，无衬线负责操作。按钮、输入、导航和状态标签永远不使用衬线。

## Elevation

系统不使用阴影。深度由 1px 发丝线、纸色层级、粘性定位与反色区块建立。商品在悬停时仅对内部 SVG 做轻微缩放，容器不漂浮。

**The Flat Desk Rule.** 所有表面默认与桌面齐平。若一个区域需要阴影才能被看见，说明边界、色阶或信息架构有问题。

## Components

### Buttons

- **Shape:** 直角编辑控件（0px）；状态圆点是唯一使用全圆角的控件。
- **Primary:** 发送按钮使用编辑墨色背景与暖纸色箭头，最小触控高度 44px。
- **Hover / Focus:** 快速任务悬停变为校样酸黄；所有焦点使用 3px 高对比外轮廓，偏移 3px。
- **Secondary:** 文字动作透明背景，箭头在悬停时水平移动 3px。

### Cards / Containers

- **Corner Style:** 全部直角。
- **Background:** 商品视觉从对应服装色与深纸米混合产生，每张图保持内部发丝线框。
- **Shadow Strategy:** 禁止阴影；使用相邻分隔线和负空间。
- **Border:** 关键区域 1px 编辑墨色，次级区域 1px 发丝线灰。
- **Internal Padding:** 商品列 16px，会员提示 26px，工作区 26–72px 响应式边距。

### Inputs / Fields

- **Style:** 暖纸背景、1px 墨色全边框、直角；textarea 最小高度 64px。
- **Focus:** 3px 校样色外轮廓，不改变布局尺寸。
- **Error / Disabled:** 禁用按钮使用发丝线灰；错误与离线状态使用危险红圆点及文字说明。

### Navigation

桌面端使用左侧能力栏与顶部状态栏。当前能力以红色文字和编号表示，不增加彩色底块。移动端隐藏侧栏，将三个关键任务折叠为首屏纵向入口。

### Decision Trace

右侧决策轨迹是签名组件。它按确认顺序列出硬条件，并常驻显示硬条件违规、事实补造与外部操作状态。点击商品后，同一位置切换为商品事实详情，不弹出模态框。

### Product Art

商品图使用内联 SVG 根据服装类别绘制抽象轮廓，颜色来自合成商品字段。它既避免版权与企业识别风险，也让“合成数据”成为可见的产品语言。

## Do's and Don'ts

### Do:

- **Do** 用 1px 分隔线、纸色色差和不对称比例组织高密度信息。
- **Do** 让右侧决策轨迹持续回答“为什么推荐”。
- **Do** 保持交互控件至少 44px，并为键盘用户提供 3px 可见焦点。
- **Do** 在 760px 以下隐藏侧栏，将商品与搭配变为水平滚动序列。
- **Do** 使用 150–250ms 的状态过渡，并遵守 `prefers-reduced-motion`。

### Don't:

- **Don't** 做常见的紫色渐变 AI 聊天页。
- **Don't** 使用玻璃拟态、霓虹色或装饰性光效暗示“智能”。
- **Don't** 堆叠同尺寸圆角卡片，不让页面像组件库样例。
- **Don't** 模仿真实企业或真实品牌视觉，不使用来源资料中的标志、口号和图像。
- **Don't** 为了编辑感牺牲按钮、筛选、状态和错误提示的可理解性。
- **Don't** 使用大于 1px 的彩色单侧边框、渐变文字或嵌套卡片。
