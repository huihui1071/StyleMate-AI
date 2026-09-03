import { useState } from "react";
import type { Advice } from "./types";
import { formatCurrency } from "./utils";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
const DEMO_QUERY = "我在淘宝做女性通勤装，零售价300-700元，想选12款春季新品，首批采购预算3万";

const HERO_PRODUCTS = [
  { sku: "066", label: "主销候选", image: "/images/products/SKU-DEMO-066.jpg" },
  { sku: "094", label: "低风险补位", image: "/images/products/SKU-DEMO-094.jpg" },
  { sku: "122", label: "价格带覆盖", image: "/images/products/SKU-DEMO-122.jpg" },
  { sku: "130", label: "形象款", image: "/images/products/SKU-DEMO-130.jpg" },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

export function LandingPage() {
  const [preview, setPreview] = useState<Advice | null>(null);
  const [loading, setLoading] = useState(false);

  async function runPreview() {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: DEMO_QUERY, merchant_id: "MERCHANT-DEMO-01", mode: "assortment" }),
      });
      if (!response.ok) throw new Error("preview failed");
      setPreview(await response.json());
    } catch {
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }

  const previewItems = preview?.assortment?.items.slice(0, 4) ?? [];

  return (
    <div className="site-shell" id="top">
      <header className="site-header">
        <a className="site-mark" href="#top" aria-label="StyleMate Supply 首页">
          <span>SM</span>
          <strong>STYLEMATE SUPPLY</strong>
        </a>
        <nav aria-label="主要导航">
          <a href="#product">产品</a>
          <a href="#workflow">工作流程</a>
          <a href="#rules">可信机制</a>
        </nav>
        <a className="header-action" href="/demo">进入选款台 <ArrowIcon /></a>
      </header>

      <main>
        <section className="supply-hero">
          <div className="supply-hero__copy">
            <p className="eyebrow">供应商智能选款台</p>
            <h1>从整盘货，<br />选出适合这家店的货。</h1>
            <p>商家说清店铺、客群与预算，系统完成货盘筛选、款式结构、建议数量和采购清单。需要确认价格或库存时，带着完整上下文交给销售。</p>
            <div className="hero-actions">
              <a className="primary-action" href="/demo">开始一次选款 <ArrowIcon /></a>
              <a className="text-link" href="#workflow">查看决策路径</a>
            </div>
            <dl className="catalog-line" aria-label="演示货盘范围">
              <div><dt>货盘</dt><dd>240 款匿名 SKU</dd></div>
              <div><dt>覆盖</dt><dd>22 个真实品类</dd></div>
              <div><dt>素材</dt><dd>240 张本地商品图</dd></div>
            </dl>
          </div>

          <div className="hero-catalog" aria-label="匿名商品货盘预览">
            {HERO_PRODUCTS.map((product, index) => (
              <figure key={product.sku} className={`hero-product hero-product--${index + 1}`}>
                <img src={product.image} alt={`${product.label}匿名商品图`} />
                <figcaption><span>{product.label}</span><b>#{product.sku}</b></figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="buyer-statement">
          <p>不是让模型凭感觉挑几张图。</p>
          <h2>先判断哪些货能卖，再判断这一批货该怎么组。</h2>
        </section>

        <section className="product-section" id="product">
          <div className="section-intro">
            <p className="eyebrow">LIVE PRODUCT</p>
            <h2>一句经营目标，生成一张可调整的选款单。</h2>
            <p>以下不是静态效果图。它调用在线货盘与同一套组货规则。</p>
          </div>

          <div className="live-workbench">
            <aside className="preview-profile">
              <span>当前商家</span>
              <strong>北岸通勤店</strong>
              <dl>
                <div><dt>渠道</dt><dd>淘宝</dd></div>
                <div><dt>客群</dt><dd>25–35 岁城市女性</dd></div>
                <div><dt>价格带</dt><dd>¥300–¥700</dd></div>
                <div><dt>首批预算</dt><dd>¥30,000</dd></div>
              </dl>
            </aside>
            <div className="preview-task">
              <div className="preview-task__prompt">
                <span>选款目标</span>
                <p>{DEMO_QUERY}</p>
                <button onClick={runPreview} disabled={loading}>
                  {loading ? "正在组货…" : preview ? "重新生成" : "运行在线 Demo"}
                </button>
              </div>

              {preview?.assortment ? (
                <div className="preview-result" aria-live="polite">
                  <header>
                    <div><span>组货结果</span><strong>{preview.message}</strong></div>
                    <b>{formatCurrency(preview.assortment.summary.total_cost)}</b>
                  </header>
                  <div className="preview-products">
                    {previewItems.map((product) => (
                      <article key={product.sku}>
                        <img src={product.image} alt={`${product.name}商品图`} />
                        <span>{product.selection_role}</span>
                        <strong>{product.name}</strong>
                        <small>{product.recommended_quantity} 件 · 供货 {formatCurrency(product.net_unit_cost ?? product.wholesale_price)}</small>
                      </article>
                    ))}
                  </div>
                  <a href="/demo">进入完整选款台，查看 12 款方案 <ArrowIcon /></a>
                </div>
              ) : (
                <div className="preview-empty">
                  <span>等待执行</span>
                  <p>将先检查渠道、人群、季节和价格带，再分配主销、引流、形象、连带与测试款。</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="workflow-section" id="workflow">
          <div className="section-intro section-intro--split">
            <div>
              <p className="eyebrow">WORKFLOW</p>
              <h2>商家画像进入，采购摘要出去。</h2>
            </div>
            <p>每一步都有可检查的输入、规则和结果。销售只在需要实时权限或商务判断时接手。</p>
          </div>
          <ol className="workflow-line">
            <li><span>01</span><strong>商家画像</strong><p>读取渠道、客群、价格带与历史风格。</p></li>
            <li><span>02</span><strong>选款</strong><p>先执行品类、季节、MOQ 与供货条件硬筛选。</p></li>
            <li><span>03</span><strong>组货</strong><p>安排主销、引流、形象、连带与测试款比例。</p></li>
            <li><span>04</span><strong>采购清单</strong><p>给出款数、件数、采购额和预计零售额。</p></li>
            <li><span>05</span><strong>销售接管</strong><p>锁货、议价、账期与合同转交对应销售。</p></li>
          </ol>
        </section>

        <section className="rules-section" id="rules">
          <div className="rules-heading">
            <p className="eyebrow">DECISION RULES</p>
            <h2>推荐可以解释，交易边界必须明确。</h2>
          </div>
          <div className="rules-list">
            <article><span>硬筛选</span><h3>不满足条件的 SKU 不进入候选。</h3><p>渠道、客群、品类、零售价带、季节和 MOQ 按结构化字段执行。</p></article>
            <article><span>组货逻辑</span><h3>不是十二个高分单品的简单拼接。</h3><p>系统为每一款分配经营角色，再计算建议件数与预算占用。</p></article>
            <article><span>人工边界</span><h3>AI 不承诺真实价格，也不替商家锁货。</h3><p>议价、账期、合同、库存确认与下单生成接管摘要，由销售继续。</p></article>
          </div>
        </section>

        <section className="closing-section">
          <p>下一批货，从店铺目标开始。</p>
          <a href="/demo">进入供应商智能选款台 <ArrowIcon /></a>
        </section>
      </main>

      <footer className="site-footer">
        <strong>STYLEMATE SUPPLY</strong>
        <span>匿名商品属性来自项目资料；供货、库存与经营指标为演示模拟值。</span>
      </footer>
    </div>
  );
}
