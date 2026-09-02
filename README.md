# StyleMate AI

一个可公开运行、可解释、可评测的时尚零售 AI 员工 Demo，面向求职作品集与技术面试演示。

它不是让模型凭感觉推荐商品，而是把自然语言理解、结构化硬筛选、搭配规则、会员画像、订阅权益和人工接管串成一条可验证的业务链路。

## 能力

- 智能导购：按虚构品牌、品类、颜色、版型、材质、场景和预算组合筛选。
- 搭配顾问：围绕指定单品或场景生成整套搭配，并解释颜色、材质与廓形关系。
- 会员顾问：读取已授权的虚构会员上下文，处理积分、订阅节点、兑换值和 BOX+ 介绍时机。
- 安全接管：面对实时库存、支付、退款或资料缺失时生成结构化人工摘要。
- 工程评测：自动测试硬条件、推荐数量、个性化差异和敏感信息门禁。

## 本地运行

### 1. 后端

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn apps.api.main:app --reload --port 8000
```

### 2. 前端

```bash
npm install
npm run dev:web
```

访问 `http://localhost:5173`。

也可以使用 Docker 一次启动：

```bash
docker compose up --build
```

## 验证

```bash
npm run privacy
npm run test:api
npm run test:web
npm run build:web
```

## 数据与隐私

仓库只包含从零生成的演示商品、会员与业务规则。所有品牌、SKU、人物和视觉均为虚构内容。原始业务资料、真实企业名、真实品牌名、内部域名及逐行映射不会进入仓库。

## 当前边界

本项目不连接真实库存、支付、CRM、客服或消息系统，也不执行真实开通、续订、退货或积分兑换。价格为演示标准价，人工接管为模拟状态。
