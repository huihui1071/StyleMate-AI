import { FormEvent, useState } from "react";
import type { Advice, Product } from "./types";
import { formatCurrency, intentLabel } from "./utils";
import { ArrowIcon, ProductArt, QUICK_TASKS } from "./Advisor";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const SHOWCASE_PRODUCTS: Product[] = [
  {
    sku: "SKU-DEMO-001", style_code: "STYLE-001", brand: "Brand_A", name: "折线短风衣", category: "外套",
    price: 1390, color: "岩灰", color_family: "灰", material: "棉锦混纺", silhouette: "H型", fit: "宽松", season: "春",
    styles: ["通勤", "极简"], craft: "隐藏门襟，可调节袖袢", description: "轻量挺括，短款比例适合高腰下装。", image: "/images/products/SKU-DEMO-001.jpg", visual: { tone: "stone", shape: "jacket" },
  },
  {
    sku: "SKU-DEMO-003", style_code: "STYLE-003", brand: "Brand_A", name: "高腰弧线长裤", category: "裤子",
    price: 890, color: "燕麦", color_family: "米", material: "精纺羊毛混纺", silhouette: "弧线型", fit: "宽松", season: "四季",
    styles: ["通勤", "松弛"], craft: "高腰双褶", description: "柔和弧线平衡短外套的结构感。", image: "/images/products/SKU-DEMO-003.jpg", visual: { tone: "oat", shape: "trouser" },
  },
  {
    sku: "SKU-DEMO-002", style_code: "STYLE-002", brand: "Brand_A", name: "空气感廓形衬衣", category: "衬衣",
    price: 790, color: "冷白", color_family: "白", material: "棉麻混纺", silhouette: "H型", fit: "宽松", season: "春",
    styles: ["极简", "通勤"], craft: "后背活褶，弧形下摆", description: "低对比层次让整套更轻，同时保留利落轮廓。", image: "/images/products/SKU-DEMO-002.jpg", visual: { tone: "chalk", shape: "shirt" },
  },
];

function MiniAdvisor() {
  const [input, setInput] = useState("");
  const [advice, setAdvice] = useState<Advice | null>(null);
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);

  async function submit(text: string) {
    const clean = text.trim();
    if (!clean || loading) return;
    setInput(clean);
    setLoading(true);
    setOffline(false);
    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: clean, member_id: "M-DEMO-01", mode: "auto", subscription_already_shown: false }),
      });
      if (!response.ok) throw new Error(`API ${response.status}`);
      setAdvice(await response.json() as Advice);
    } catch {
      setOffline(true);
      setAdvice(null);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void submit(input);
  }

  const items = advice?.outfit?.items ?? advice?.products ?? [];

  return (
    <div className="mini-app">
      <div className="mini-app__bar">
        <span><i /> 在线导购</span>
        <a href="/demo">打开完整体验 <ArrowIcon /></a>
      </div>
      <div className="mini-app__body">
        <form className="mini-composer" onSubmit={onSubmit}>
          <label htmlFor="mini-message">告诉我你要去哪里，想穿成什么感觉</label>
          <div>
            <textarea
              id="mini-message"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={2}
              placeholder="例如：周五见客户，想松弛但不随意，预算 2000 元以内"
            />
            <button type="submit" disabled={!input.trim() || loading}>{loading ? "筛选中" : "开始推荐"}<ArrowIcon /></button>
          </div>
        </form>

        {!advice && !loading && !offline && (
          <div className="mini-suggestions">
            <span>直接试试</span>
            {QUICK_TASKS.slice(0, 2).map((task) => (
              <button key={task.label} onClick={() => void submit(task.text)}>{task.label}</button>
            ))}
          </div>
        )}

        {loading && <div className="mini-loading" role="status"><i /><span>正在识别场合、版型与预算</span></div>}

        {offline && (
          <div className="mini-error" role="alert">
            <strong>导购服务暂未连接</strong>
            <span>你仍可进入完整体验查看界面；启动 API 后即可获得实时推荐。</span>
          </div>
        )}

        {advice && (
          <div className="mini-result" aria-live="polite">
            <div className="mini-result__intro">
              <span>{intentLabel(advice.intent)}</span>
              <p>{advice.message}</p>
            </div>
            {items.length > 0 && (
              <div className="mini-products">
                {items.slice(0, 3).map((product) => (
                  <article key={product.sku}>
                    <ProductArt product={product} compact />
                    <div><strong>{product.name}</strong><span>{formatCurrency(product.price)}</span></div>
                    <p>{product.reasons?.[0] ?? `${product.color} · ${product.fit}`}</p>
                  </article>
                ))}
              </div>
            )}
            {advice.outfit && <p className="mini-outfit-note">整套 {formatCurrency(advice.outfit.total_price)} · {advice.outfit.reason}</p>}
            <details className="mini-proof">
              <summary>查看推荐依据</summary>
              <ul>{advice.evidence.map((item) => <li key={item}>{item}</li>)}</ul>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

function OutfitShowcase() {
  return (
    <div className="outfit-showcase" aria-label="一套通勤搭配示意">
      {SHOWCASE_PRODUCTS.map((product, index) => (
        <div className={`outfit-showcase__item outfit-showcase__item--${index + 1}`} key={product.sku}>
          <span>{index === 0 ? "主单品" : "搭配"}</span>
          <ProductArt product={product} compact />
          <strong>{product.name}</strong>
        </div>
      ))}
      <div className="outfit-showcase__note">
        <span>搭配逻辑</span>
        <p>用低对比色保持完整感，让短外套与高腰下装共同优化比例。</p>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="landing-page">
      <header className="site-header">
        <a className="site-logo" href="#top" aria-label="StyleMate 首页"><span>SM</span><strong>STYLEMATE</strong></a>
        <nav aria-label="主要导航">
          <a href="#capabilities">产品能力</a>
          <a href="#how">工作方式</a>
          <a href="#trust">可信机制</a>
        </nav>
        <a className="header-cta" href="/demo">体验智能导购 <ArrowIcon /></a>
      </header>

      <main id="top">
        <section className="brand-hero">
          <div className="brand-hero__copy">
            <p className="section-kicker">你的日常穿搭顾问</p>
            <h1>把想穿的感觉，<br /><em>说出来。</em></h1>
            <p>从一句自然语言开始，找到符合场合、版型、材质与预算的单品，再把它们搭成真正能穿的一套。</p>
            <div className="hero-actions">
              <a className="primary-link" href="#try">现在试一试 <ArrowIcon /></a>
              <a className="secondary-link" href="#how">它如何做选择</a>
            </div>
          </div>
          <figure className="brand-hero__visual">
            <img src="/images/stylemate-hero.jpg" alt="身穿暖白短外套与灰褐色阔腿裤的匿名模特" />
            <figcaption><span>LOOK 01</span><p>克制的结构，松弛的比例。</p></figcaption>
          </figure>
        </section>

        <section className="live-section" id="try">
          <div className="section-heading section-heading--split">
            <div><p className="section-kicker">实时体验</p><h2>现在，试着说一句。</h2></div>
            <p>不是预设问答，也不是静态截图。输入真实需求，系统会调用同一套筛选、搭配与会员规则。</p>
          </div>
          <MiniAdvisor />
          <p className="synthetic-note">商品名称、品牌与会员信息已匿名化；商品图片来自项目资料，仅用于功能演示。</p>
        </section>

        <section className="capabilities-section" id="capabilities">
          <div className="section-heading">
            <p className="section-kicker">三种服务，一次对话</p>
            <h2>不是更多选择，<br />是更合适的选择。</h2>
          </div>

          <article className="capability-story capability-story--search">
            <div className="capability-story__copy">
              <span className="story-number">01</span>
              <p className="section-kicker">智能导购</p>
              <h3>把口语需求，变成明确条件。</h3>
              <p>品牌、品类、颜色、版型、材质和预算会先进入硬筛选。没有命中的条件不会被悄悄放宽。</p>
              <ul><li>识别场合和风格</li><li>执行结构化筛选</li><li>按个人偏好重排</li></ul>
            </div>
            <div className="filter-showcase">
              <div className="query-slip"><span>你的需求</span><p>春季通勤，灰色宽松外套，1500 元以内</p></div>
              <div className="filter-chips"><span>外套</span><span>灰色</span><span>宽松</span><span>≤ ¥1,500</span></div>
              <div className="single-product">
                <ProductArt product={SHOWCASE_PRODUCTS[0]} compact />
                <div><small>符合全部条件</small><strong>{SHOWCASE_PRODUCTS[0].name}</strong><b>{formatCurrency(SHOWCASE_PRODUCTS[0].price)}</b></div>
              </div>
            </div>
          </article>

          <article className="capability-story capability-story--outfit">
            <OutfitShowcase />
            <div className="capability-story__copy">
              <span className="story-number">02</span>
              <p className="section-kicker">搭配顾问</p>
              <h3>围绕一件单品，完成整套关系。</h3>
              <p>系统同时考虑轮廓、色彩、材质和预算，说明每件商品在整套搭配中的作用，而不是只列相似商品。</p>
              <ul><li>指定单品继续搭</li><li>按场景组织整套</li><li>核算整套预算</li></ul>
            </div>
          </article>

          <article className="capability-story capability-story--member">
            <div className="capability-story__copy">
              <span className="story-number">03</span>
              <p className="section-kicker">会员顾问</p>
              <h3>在需要的时候，才介绍权益。</h3>
              <p>会员偏好参与推荐，积分与订阅状态由规则判断。遇到交易、售后或复杂需求时，完整上下文会交给人工继续处理。</p>
              <a className="secondary-link" href="/demo">以会员身份体验</a>
            </div>
            <div className="member-showcase">
              <div className="member-card"><span>林澄 · SILVER</span><strong>4,260</strong><small>可用积分</small></div>
              <div className="membership-moment"><span>B+</span><div><strong>积分已满足演示开通条件</strong><p>权益出现有时机，不打断当前选款。</p></div></div>
              <div className="handoff-moment"><i /><div><strong>人工接管摘要已就绪</strong><p>保留需求、筛选条件与已看商品。</p></div></div>
            </div>
          </article>
        </section>

        <section className="process-section" id="how">
          <div className="section-heading section-heading--light">
            <p className="section-kicker">工作方式</p>
            <h2>一句话进来，<br />一条可验证的路径出去。</h2>
          </div>
          <ol className="process-list">
            <li><span>01</span><strong>理解需求</strong><p>识别品类、颜色、版型、材质、场景和预算。</p></li>
            <li><span>02</span><strong>硬条件筛选</strong><p>先排除不满足条件的商品，不用语言掩盖不匹配。</p></li>
            <li><span>03</span><strong>偏好重排</strong><p>结合会员档案，把更合适的结果排在前面。</p></li>
            <li><span>04</span><strong>组织搭配</strong><p>检查单品关系、场景完整度与整套价格。</p></li>
            <li><span>05</span><strong>解释或接管</strong><p>展示依据；超出能力范围时，生成完整人工摘要。</p></li>
          </ol>
        </section>

        <section className="trust-section" id="trust">
          <div className="section-heading section-heading--split">
            <div><p className="section-kicker">可信机制</p><h2>推荐不是一句<br />漂亮话。</h2></div>
            <p>生成式模型负责理解和表达，商品事实、价格、会员状态与订阅时机来自可检查的数据和规则。</p>
          </div>
          <div className="trust-ledger">
            <article><span>FACT 01</span><h3>商品事实有出处</h3><p>名称、价格、材质、版型和工艺只读取结构化商品字段，缺失信息保持未知。</p></article>
            <article><span>RULE 02</span><h3>硬条件不自动放宽</h3><p>当没有完全匹配的结果时，系统明确说明缺口，把是否放宽条件交还给你。</p></article>
            <article><span>HANDOFF 03</span><h3>边界之外有人接手</h3><p>交易承诺、售后和复杂异常不由模型擅自处理，接管摘要保证服务连续。</p></article>
          </div>
          <div className="proof-strip"><span>每次推荐均可展开依据</span><i /><span>结构化筛选先于语言生成</span><i /><span>演示数据与真实企业隔离</span></div>
        </section>

        <section className="closing-section">
          <div><p className="section-kicker">从今天这一套开始</p><h2>少一点漫无目的，<br />多一点刚刚好。</h2></div>
          <a className="closing-action" href="/demo">开始一次真实搭配 <ArrowIcon /></a>
        </section>
      </main>

      <footer className="site-footer">
        <a className="site-logo" href="#top"><span>SM</span><strong>STYLEMATE</strong></a>
        <p>匿名时尚零售智能顾问</p>
        <p>商品名称、品牌与会员信息均为匿名演示内容</p>
      </footer>
    </div>
  );
}

export default LandingPage;
