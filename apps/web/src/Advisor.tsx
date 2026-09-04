import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { Advice, Merchant, Product, SelectionItem } from "./types";
import { formatCurrency, formatPercent, intentLabel } from "./utils";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const FALLBACK_MERCHANTS: Merchant[] = [
  { id: "MERCHANT-DEMO-01", name: "北岸通勤店", platform: "淘宝", business_stage: "成长店铺", target_customer: "25–35 岁城市上班族", price_band: { min: 300, max: 700 }, tier: "成长商家", default_budget: 30000, discount_rate: 0.97, sample_quota: 6 },
  { id: "MERCHANT-DEMO-02", name: "栖野内容店", platform: "抖音电商", business_stage: "内容起量期", target_customer: "20–30 岁休闲与街头女性", price_band: { min: 199, max: 499 }, tier: "新锐商家", default_budget: 18000, discount_rate: 1, sample_quota: 3 },
  { id: "MERCHANT-DEMO-03", name: "留白买手店", platform: "小红书店铺", business_stage: "稳定经营", target_customer: "关注设计与材质表达的城市客群", price_band: { min: 600, max: 1500 }, tier: "合作商家", default_budget: 50000, discount_rate: 0.94, sample_quota: 10 },
  { id: "MERCHANT-DEMO-04", name: "童趣集合店", platform: "淘宝", business_stage: "首批选款", target_customer: "注重舒适度与设计感的亲子家庭", price_band: { min: 199, max: 699 }, tier: "新商家", default_budget: 22000, discount_rate: 1, sample_quota: 2 },
];

const QUICK_TASKS = [
  { label: "想选一些适合春季上新的女装。", mode: "selection", text: "想选一些适合春季上新的女装" },
  { label: "帮我选春季外套，单款起订量不超过 4 件。", mode: "selection", text: "帮我选春季外套，单款起订量不超过4件" },
  { label: "淘宝女性通勤店，零售价 300–700 元，帮我选一批春季新品。", mode: "selection", text: "我在淘宝做女性通勤装，零售价300-700元，帮我选一批春季新品" },
  { label: "抖音女装店，客群 20–30 岁，想选低 MOQ 的春季新品，预算 2 万。", mode: "assortment", text: "我在抖音做20-30岁女性客群，想选低MOQ的春季新品，采购预算2万" },
  { label: "淘宝通勤女装店，零售价 300–700 元，选 12 款春季新品，首批预算 3 万。", mode: "assortment", text: "我在淘宝做女性通勤装，零售价300-700元，想选12款春季新品，首批采购预算3万" },
  { label: "我想确认当前商家的拿货折扣、样衣额度和默认采购预算。", mode: "account", text: "查看当前商家的拿货折扣、样衣额度和默认采购预算" },
] as const;

const FLOW_STEPS = ["商家画像", "选款", "组货", "采购清单", "销售接管"];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

function ProductCard({ product, selected, onAdd }: { product: Product; selected: boolean; onAdd: (product: Product) => void }) {
  return (
    <article className="sku-card">
      <div className="sku-card__image">
        <img src={product.image} alt={`${product.name}商品实拍图`} loading="lazy" decoding="async" />
        <span>{product.selection_role ?? product.default_role}</span>
        <b>{product.sku.slice(-3)}</b>
      </div>
      <div className="sku-card__heading">
        <div>
          <small>{product.line} · {product.category}</small>
          <h3>{product.name}</h3>
        </div>
        <span className={`risk risk--${product.risk_level}`}>风险 {product.risk_level}</span>
      </div>
      <dl className="sku-commercials">
        <div><dt>供货</dt><dd>{formatCurrency(product.net_unit_cost ?? product.wholesale_price)}</dd></div>
        <div><dt>建议零售</dt><dd>{formatCurrency(product.suggested_retail_price)}</dd></div>
        <div><dt>毛利空间</dt><dd>{formatPercent(product.margin_rate)}</dd></div>
      </dl>
      <div className="sku-supply">
        <span>库存 {product.stock}</span>
        <span>MOQ {product.moq}</span>
        <span>{product.lead_time_days} 天发货</span>
      </div>
      {product.reasons?.length ? <p className="sku-reason">{product.reasons[0]}</p> : null}
      <button className="add-selection" onClick={() => onAdd(product)} disabled={selected}>
        {selected ? "已加入选款单" : `加入选款单${product.recommended_quantity ? ` · ${product.recommended_quantity} 件` : ""}`}
      </button>
      <details className="sku-detail">
        <summary>查看商品与供货详情</summary>
        <dl>
          <div><dt>面料</dt><dd>{product.material}</dd></div>
          <div><dt>版型</dt><dd>{product.silhouette} · {product.fit}</dd></div>
          <div><dt>渠道</dt><dd>{product.channels.join(" / ")}</dd></div>
          <div><dt>工艺</dt><dd>{product.craft}</dd></div>
        </dl>
      </details>
    </article>
  );
}

function MerchantPanel({ merchant, merchants, onChange }: { merchant: Merchant; merchants: Merchant[]; onChange: (id: string) => void }) {
  return (
    <aside className="merchant-panel" aria-label="商家画像">
      <label htmlFor="merchant-select">当前演示商家</label>
      <select id="merchant-select" value={merchant.id} onChange={(event) => onChange(event.target.value)}>
        {merchants.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
      </select>
      <div className="merchant-name">
        <strong>{merchant.name}</strong>
        <span>{merchant.tier}</span>
      </div>
      <dl className="merchant-facts">
        <div><dt>经营渠道</dt><dd>{merchant.platform}</dd></div>
        <div><dt>经营阶段</dt><dd>{merchant.business_stage}</dd></div>
        <div><dt>目标客群</dt><dd>{merchant.target_customer}</dd></div>
        <div><dt>零售价带</dt><dd>{formatCurrency(merchant.price_band.min)}–{formatCurrency(merchant.price_band.max)}</dd></div>
        <div><dt>默认预算</dt><dd>{formatCurrency(merchant.default_budget)}</dd></div>
      </dl>
    </aside>
  );
}

function SelectionPanel({ items, merchant, onQuantity, onRemove, onHandoff }: {
  items: SelectionItem[];
  merchant: Merchant;
  onQuantity: (sku: string, delta: number) => void;
  onRemove: (sku: string) => void;
  onHandoff: () => void;
}) {
  const [showSummary, setShowSummary] = useState(false);
  const totals = useMemo(() => {
    const units = items.reduce((sum, item) => sum + item.quantity, 0);
    const cost = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
    const retail = items.reduce((sum, item) => sum + item.quantity * item.suggested_retail_price, 0);
    return { units, cost, retail, margin: retail ? (retail - cost) / retail : 0 };
  }, [items]);

  return (
    <aside className="selection-panel" aria-label="采购清单">
      <header>
        <div className="panel-label"><span>04</span> 采购清单</div>
        <b>{items.length} 款</b>
      </header>

      {items.length ? (
        <>
          <div className="selection-items">
            {items.map((item) => (
              <article className="selection-row" key={item.sku}>
                <img src={item.image} alt="" />
                <div>
                  <span>{item.selection_role ?? item.default_role}</span>
                  <strong>{item.name}</strong>
                  <small>{formatCurrency(item.unitCost)} / 件</small>
                </div>
                <div className="quantity-control" aria-label={`${item.name}数量`}>
                  <button onClick={() => onQuantity(item.sku, -item.moq)} disabled={item.quantity <= item.moq} aria-label={`减少${item.name}数量`}>−</button>
                  <b>{item.quantity}</b>
                  <button onClick={() => onQuantity(item.sku, item.moq)} disabled={item.quantity + item.moq > item.stock} aria-label={`增加${item.name}数量`}>+</button>
                </div>
                <button className="remove-item" onClick={() => onRemove(item.sku)} aria-label={`从选款单移除${item.name}`}>移除</button>
              </article>
            ))}
          </div>

          <dl className="order-totals">
            <div><dt>款数 / 件数</dt><dd>{items.length} / {totals.units}</dd></div>
            <div><dt>预计零售额</dt><dd>{formatCurrency(totals.retail)}</dd></div>
            <div><dt>预计毛利空间</dt><dd>{formatPercent(totals.margin)}</dd></div>
            <div className="order-totals__primary"><dt>采购金额</dt><dd>{formatCurrency(totals.cost)}</dd></div>
          </dl>

          <button className="summary-action" onClick={() => setShowSummary((value) => !value)}>
            {showSummary ? "收起采购摘要" : "生成采购摘要"}
          </button>

          {showSummary ? (
            <div className="purchase-summary" aria-live="polite">
              <span>采购摘要已就绪</span>
              <p>{merchant.name} · {merchant.platform}</p>
              <strong>{items.length} 款 / {totals.units} 件 / {formatCurrency(totals.cost)}</strong>
              <button onClick={onHandoff}>交给销售确认 <ArrowIcon /></button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="selection-empty">
          <span>选款单为空</span>
          <p>运行组货任务会自动加入建议款；也可以从选款结果逐款添加。</p>
        </div>
      )}
    </aside>
  );
}

export function AdvisorApp() {
  const [merchants, setMerchants] = useState<Merchant[]>(FALLBACK_MERCHANTS);
  const [merchantId, setMerchantId] = useState(FALLBACK_MERCHANTS[0].id);
  const [query, setQuery] = useState("");
  const [lastQuery, setLastQuery] = useState("");
  const [advice, setAdvice] = useState<Advice | null>(null);
  const [selection, setSelection] = useState<SelectionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const merchant = merchants.find((item) => item.id === merchantId) ?? merchants[0];
  const resultItems = advice?.assortment?.items ?? advice?.products ?? [];
  const currentStep = advice?.intent === "handoff" ? 5 : selection.length ? 4 : advice?.intent === "assortment" ? 3 : advice ? 2 : 1;

  useEffect(() => {
    fetch(`${API_BASE}/api/merchants`).then((response) => response.ok ? response.json() : Promise.reject()).then((merchantData) => {
      setMerchants(merchantData);
    }).catch(() => undefined);
  }, []);

  function changeMerchant(id: string) {
    setMerchantId(id);
    setAdvice(null);
    setSelection([]);
    setLastQuery("");
    setError("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function addProduct(product: Product) {
    setSelection((current) => {
      if (current.some((item) => item.sku === product.sku)) return current;
      return [...current, {
        ...product,
        quantity: product.recommended_quantity ?? product.moq,
        unitCost: product.net_unit_cost ?? product.wholesale_price,
      }];
    });
  }

  function replaceWithAssortment(products: Product[]) {
    setSelection(products.map((product) => ({
      ...product,
      quantity: product.recommended_quantity ?? product.moq,
      unitCost: product.net_unit_cost ?? product.wholesale_price,
    })));
  }

  function changeQuantity(sku: string, delta: number) {
    setSelection((current) => current.map((item) => item.sku === sku
      ? { ...item, quantity: Math.max(item.moq, Math.min(item.stock, item.quantity + delta)) }
      : item));
  }

  async function runTask(text: string, mode = "auto") {
    const clean = text.trim();
    if (!clean || loading) return;
    setLoading(true);
    setError("");
    setLastQuery(clean);
    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: clean, merchant_id: merchantId, mode }),
      });
      if (!response.ok) throw new Error("request failed");
      const data: Advice = await response.json();
      setAdvice(data);
      if (data.assortment?.items.length) replaceWithAssortment(data.assortment.items);
      setQuery("");
    } catch {
      setError("服务暂时没有返回结果，请稍后重试。当前选款单已保留。");
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    runTask(query);
  }

  return (
    <div className="app-shell">
      <nav className="flow-nav" aria-label="选款流程">
        {FLOW_STEPS.map((step, index) => (
          <div className={index + 1 < currentStep ? "is-done" : index + 1 === currentStep ? "is-current" : ""} key={step}>
            <span>{String(index + 1).padStart(2, "0")}</span><b>{step}</b>
          </div>
        ))}
      </nav>

      <div className="workbench-grid">
        <MerchantPanel merchant={merchant} merchants={merchants} onChange={changeMerchant} />

        <main className="task-panel">
          {!advice ? (
            <section className="task-welcome">
              <p className="eyebrow">02 选款目标</p>
              <h1>为这家店，选下一批货。</h1>
              <p>描述渠道、客群、品类、价格带与预算。系统会先筛货，再给出款式结构和建议数量。</p>
              <form className="task-composer" onSubmit={submit}>
                <label htmlFor="task-query">输入经营目标</label>
                <textarea
                  id="task-query"
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="例如：淘宝女性通勤店，零售价 300–700 元，选 12 款春季新品，首批预算 3 万"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      runTask(query);
                    }
                  }}
                />
                <button type="submit" disabled={!query.trim() || loading}>{loading ? "正在分析货盘…" : "开始选款"}<ArrowIcon /></button>
              </form>
              <div className="quick-tasks" aria-label="任务示例">
                <span>直接体验这些需求</span>
                {QUICK_TASKS.map((task) => <button key={task.label} onClick={() => runTask(task.text, task.mode)}>{task.label}</button>)}
              </div>
              {error ? <p className="error-message" role="alert">{error}</p> : null}
            </section>
          ) : (
            <section className="task-result">
              <header className="result-heading">
                <div>
                  <p className="eyebrow">{intentLabel(advice.intent)}</p>
                  <h1>{advice.message}</h1>
                  <p className="last-query">“{lastQuery}”</p>
                </div>
                <button className="new-task" onClick={() => { setAdvice(null); setLastQuery(""); requestAnimationFrame(() => inputRef.current?.focus()); }}>新建任务</button>
              </header>

              {advice.evidence.length ? (
                <div className="constraint-strip" aria-label="识别出的条件">
                  {advice.evidence.map((item) => <span key={item}>{item}</span>)}
                </div>
              ) : null}

              {advice.assortment ? (
                <div className="assortment-summary">
                  <div><span>候选范围</span><strong>{advice.assortment.available_count} 款</strong></div>
                  <div><span>AI 建议组货</span><strong>{advice.assortment.summary.style_count} 款 / {advice.assortment.summary.unit_count} 件</strong></div>
                  <div><span>AI 建议采购额</span><strong>{formatCurrency(advice.assortment.summary.total_cost)}</strong></div>
                  <div><span>预算余量</span><strong>{formatCurrency(advice.assortment.summary.budget_remaining)}</strong></div>
                  <div><span>预计毛利空间</span><strong>{formatPercent(advice.assortment.summary.estimated_margin_rate)}</strong></div>
                </div>
              ) : null}

              {advice.handoff ? (
                <div className="handoff-result">
                  <div><span>05 销售接管</span><strong>{advice.handoff.reason}</strong></div>
                  <p>{advice.handoff.summary}</p>
                  <dl><div><dt>接管人</dt><dd>{advice.handoff.owner}</dd></div><div><dt>状态</dt><dd>摘要已就绪</dd></div></dl>
                  <small>这是演示接管状态，不会发送消息或创建真实订单。</small>
                </div>
              ) : null}

              {advice.intent === "account" && advice.merchant ? (
                <div className="account-result">
                  <div><span>商家等级</span><strong>{advice.merchant.tier}</strong></div>
                  <div><span>结算折扣系数</span><strong>{advice.merchant.discount_rate?.toFixed(2)}</strong></div>
                  <div><span>演示样衣额度</span><strong>{advice.merchant.sample_quota} 件</strong></div>
                  <div><span>经营渠道</span><strong>{advice.merchant.platform}</strong></div>
                </div>
              ) : null}

              {resultItems.length ? (
                <div className="sku-grid">
                  {resultItems.map((product) => (
                    <ProductCard
                      product={product}
                      key={product.sku}
                      selected={selection.some((item) => item.sku === product.sku)}
                      onAdd={addProduct}
                    />
                  ))}
                </div>
              ) : null}

              {advice.assortment ? (
                <details className="decision-proof">
                  <summary>查看组货方法与业务边界</summary>
                  <p>{advice.assortment.logic}</p>
                  <small>商品属性来自匿名化资料；供货价、库存、MOQ、交期、折扣与经营测算均为演示模拟值。</small>
                </details>
              ) : null}

              <form className="followup-composer" onSubmit={submit}>
                <textarea
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="继续补充：只看外套，或把起订量控制在 4 件以内"
                  aria-label="继续补充选款条件"
                />
                <button disabled={!query.trim() || loading}>{loading ? "处理中…" : "继续筛选"}</button>
              </form>
              {error ? <p className="error-message" role="alert">{error}</p> : null}
            </section>
          )}
        </main>

        <SelectionPanel
          items={selection}
          merchant={merchant}
          onQuantity={changeQuantity}
          onRemove={(sku) => setSelection((current) => current.filter((item) => item.sku !== sku))}
          onHandoff={() => runTask("请联系销售确认这份选款单并锁库存", "auto")}
        />
      </div>
    </div>
  );
}
