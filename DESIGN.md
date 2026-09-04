---
name: StyleMate Supply
description: 供应商数字展厅与智能选款工作台
reference: COSS UI design principles, independently implemented
colors:
  canvas: "#fafafa"
  surface: "#ffffff"
  subtle-surface: "#f5f5f4"
  foreground: "#292929"
  muted: "#737373"
  hairline: "rgba(0, 0, 0, .09)"
  verified-green: "#15803d"
rounded:
  control: "8px"
  card: "10px"
  frame: "14px"
  status: "999px"
---

# Design System: StyleMate Supply

## Creative North Star

“安静、可信、可直接工作的选款工具”。官网先用真实货盘说明产品价值，工作台让商家把注意力放在画像、商品、供货条件和采购金额上。视觉借鉴 COSS UI 的中性色、轻边框、紧凑字体与标准组件节奏，但不复制其组件源码、品牌资产或页面布局。

## Visual Direction

- 白色主表面、浅灰画布、近黑正文；绿色和风险色只表达状态。
- 全产品使用系统无衬线字体。正文与控件以 12–14px 为主，官网主标题固定为 48px，工作台标题固定为 32px 以下。
- 控件 8px、内容卡 10px、主要框架 14px 圆角；阴影保持极轻，不能替代边框。
- 商品图统一 `object-fit: contain` 与内边距，避免裁切服装轮廓。
- 不使用渐变、玻璃拟态或大面积装饰色。

## Layout

官网宽度上限 1200px，按“产品价值 → 在线 Demo → 五步工作流 → 决策边界”单向叙事。完整 Demo 保持三栏业务结构：左侧商家画像，中间任务与候选货盘，右侧采购清单。三栏之间使用 14px 间距与独立轻卡片。顶部五步流程使用标准状态导航。

## Components

- Primary button：近黑实底、8px 圆角、38–42px 高度；触屏布局交互区域至少 44px。
- Secondary button：白底、轻边框、轻阴影；悬停使用浅灰背景。
- Product tile：白色轻卡，商品图完整显示，紧凑承载供货价、建议零售价、毛利、库存、MOQ 与交期。
- Constraint strip：浅灰小标签，只显示系统实际识别的条件。
- Assortment summary：同一容器内的连续数据单元。
- Selection panel：固定采购侧栏，数量按 MOQ 调整，金额实时计算。
- Handoff summary：浅灰结果容器，明确接管原因、接管人和“未执行真实交易”。

## Interaction Rules

- 只使用 160–180ms ease-out 状态过渡，不做装饰性入场动画。
- 所有按钮、输入框、选择器都有 hover、focus、disabled 状态。
- 切换商家必须清空结果与采购清单；数量不能低于 MOQ，也不能高于演示库存。
- 生成采购摘要只产生演示状态；销售接管不会发送消息、锁货或下单。

## Bans

- 禁止消费者会员、积分与订阅盒子 UI。
- 禁止渐变、玻璃拟态、彩色厚边框、悬浮胶囊导航和无意义大指标。
- 禁止裁切商品主体或用虚假占位框代替真实商品图片。
- 禁止在界面或仓库中出现真实企业名、源 SKU、源链接和真实商务数据。
- 禁止为视觉风格牺牲标准表单、键盘焦点、错误提示与响应式阅读顺序。
