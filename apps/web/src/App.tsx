import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { Advice, Member, Product, ThreadItem } from "./types";
import { formatCurrency, intentLabel } from "./utils";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const FALLBACK_MEMBERS: Member[] = [
  { id: "M-DEMO-01", name: "林澄", tier: "Tier_Silver", points: 4260, subscription_status: "not_subscribed" },
  { id: "M-DEMO-02", name: "周岚", tier: "Tier_Gold", points: 5129, subscription_status: "subscribed" },
  { id: "M-DEMO-03", name: "沈屿", tier: "Tier_Gold", points: 2795, subscription_status: "not_subscribed" },
  { id: "M-DEMO-04", name: "访客模式", tier: null, points: 0, subscription_status: "unknown" },
];

const QUICK_TASKS = [
  { label: "通勤选款", text: "想找一件春季通勤的灰色宽松外套，预算1500元以内" },
  { label: "指定款搭配", text: "用SKU-DEMO-010搭一套周末出行，预算3000元以内" },
  { label: "查看会员权益", text: "看看我的积分和BOX+权益" },
];

const TONE_COLORS: Record<string, string> = {
  stone: "oklch(0.69 0.018 65)",
  chalk: "oklch(0.93 0.012 80)",
  charcoal: "oklch(0.31 0.014 55)",
  silver: "oklch(0.76 0.016 250)",
  moss: "oklch(0.43 0.065 137)",
  mint: "oklch(0.75 0.055 158)",
  sand: "oklch(0.77 0.045 78)",
  oat: "oklch(0.87 0.035 84)",
  umber: "oklch(0.38 0.035 57)",
  navy: "oklch(0.31 0.052 253)",
  cement: "oklch(0.63 0.012 250)",
  olive: "oklch(0.47 0.055 107)",
  ink: "oklch(0.2 0.015 258)",
  black: "oklch(0.17 0.012 260)",
  taupe: "oklch(0.68 0.027 70)",
  lime: "oklch(0.77 0.13 116)",
  midnight: "oklch(0.25 0.045 250)",
  rose: "oklch(0.73 0.055 22)",
  slate: "oklch(0.5 0.027 240)",
  carbon: "oklch(0.24 0.012 50)",
  paper: "oklch(0.95 0.008 82)",
  sky: "oklch(0.77 0.045 235)",
  oxblood: "oklch(0.35 0.1 25)",
};

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2c.8 5.2 3 7.4 8 8-5 .8-7.2 3-8 8-.8-5-3-7.2-8-8 5-.6 7.2-2.8 8-8Z" />
      <path d="M19 15c.3 2 1.1 2.8 3 3-1.9.3-2.7 1.1-3 3-.3-1.9-1.1-2.7-3-3 1.9-.2 2.7-1 3-3Z" />
    </svg>
  );
}

function ProductArt({ product, compact = false }: { product: Product; compact?: boolean }) {
  const fill = TONE_COLORS[product.visual.tone] ?? TONE_COLORS.stone;
  const dark = ["ink", "black", "navy", "midnight", "carbon", "oxblood", "charcoal", "umber"].includes(product.visual.tone);
  const shape = product.visual.shape;
  return (
    <div className={`product-art ${compact ? "product-art--compact" : ""}`} style={{ "--garment": fill } as React.CSSProperties}>
      <span className="product-art__index">{product.sku.slice(-3)}</span>
      <svg viewBox="0 0 240 300" role="img" aria-label={`${product.name}抽象服装图`}>
        <path className="shadow" d="M55 266c29 16 109 17 137-1 13 9 5 22-9 27-36 12-103 8-132-3-13-6-11-16 4-23Z" />
        {(shape === "jacket" || shape === "coat" || shape === "blazer") && (
          <>
            <path className="garment" d={shape === "coat" ? "M71 54 100 35h40l31 19 24 55-22 10-7-25 13 171H61L74 94l-8 30-23-11Z" : "M69 58 99 37h42l31 21 22 58-22 9-11-33 8 144H69L79 92l-10 36-23-10Z"} />
            <path className={dark ? "seam seam--light" : "seam"} d="m104 39 16 27 18-27M120 66v165M84 160h23M135 160h23" />
          </>
        )}
        {(shape === "shirt" || shape === "tee" || shape === "sweat" || shape === "knit" || shape === "top" || shape === "vest") && (
          <>
            <path className="garment" d={shape === "vest" ? "M88 52 106 36h28l19 16 21 181H68Z" : "M82 54 105 36h30l24 18 46 39-25 30-19-18 11 127H68l11-127-19 18-25-30Z"} />
            <path className={dark ? "seam seam--light" : "seam"} d={shape === "shirt" ? "m106 38 14 25 15-25M120 63v164M87 111h66" : "M107 39c3 20 23 20 27 0M82 206h79"} />
          </>
        )}
        {(shape === "trouser" || shape === "short") && (
          <>
            <path className="garment" d={shape === "short" ? "M71 53h98l15 106-51 8-13-62-13 62-51-8Z" : "M67 51h106l11 214-49 3-15-132-15 132-49-3Z"} />
            <path className={dark ? "seam seam--light" : "seam"} d="M74 79h92M120 53v83M91 57l8 36M149 57l-8 36" />
          </>
        )}
        {shape === "skirt" && (
          <>
            <path className="garment" d="M80 49h80l29 216H51Z" />
            <path className={dark ? "seam seam--light" : "seam"} d="M82 79h76M120 51l-10 211" />
          </>
        )}
        {shape === "dress" && (
          <>
            <path className="garment" d="M94 39h52l19 49-21 35 48 142H48l48-142-21-35Z" />
            <path className={dark ? "seam seam--light" : "seam"} d="M96 42c6 20 42 20 48 0M82 115h76M119 63l1 197" />
          </>
        )}
      </svg>
      <span className="product-art__material">{product.material}</span>
    </div>
  );
}

function ProductTile({ product }: { product: Product }) {
  return (
    <article className="product-tile">
      <div className="product-tile__visual">
        <ProductArt product={product} />
      </div>
      <div className="product-tile__meta">
        <div>
          <span>{product.brand} · {product.category}</span>
          <strong>{product.name}</strong>
        </div>
        <b>{formatCurrency(product.price)}</b>
      </div>
      {product.reasons?.length ? <p>{product.reasons[0]}</p> : <p>{product.color} · {product.fit}</p>}
      <details className="product-detail">
        <summary>查看商品详情</summary>
        <dl>
          <div><dt>面料</dt><dd>{product.material}</dd></div>
          <div><dt>版型</dt><dd>{product.silhouette} · {product.fit}</dd></div>
          <div><dt>工艺</dt><dd>{product.craft}</dd></div>
          <div><dt>风格</dt><dd>{product.styles.join(" / ")}</dd></div>
        </dl>
        <p>{product.description}</p>
      </details>
    </article>
  );
}

function SubscriptionNotice({ advice }: { advice: NonNullable<Advice["subscription"]> }) {
  return (
    <section className="subscription-notice" aria-label="BOX+会员提示">
      <div className="subscription-notice__mark">B+</div>
      <div>
        <h3>{advice.title}</h3>
        <p>{advice.messages.join(" · ")}</p>
        <button className="quiet-button">{advice.cta}</button>
      </div>
    </section>
  );
}

function AssistantResponse({ advice }: { advice: Advice }) {
  const items = advice.outfit?.items ?? advice.products;
  return (
    <article className="assistant-response">
      <header className="response-heading">
        <span>{intentLabel(advice.intent)}</span>
      </header>
      <p className="response-copy">{advice.message}</p>

      {items.length > 0 && (
        <div className={advice.outfit ? "outfit-layout" : "product-rail"}>
          {items.map((product, index) => (
            <div className={advice.outfit ? `outfit-item outfit-item--${index + 1}` : ""} key={product.sku}>
              {advice.outfit && <span className="outfit-role">{index === 0 ? "01 主单品" : `0${index + 1} 搭配`}</span>}
              <ProductTile product={product} />
            </div>
          ))}
        </div>
      )}

      {advice.outfit && advice.outfit.items.length > 0 && (
        <div className="outfit-summary">
          <div>
            <span>整套说明</span>
            <p>{advice.outfit.reason}</p>
          </div>
          <div>
            <span>合计</span>
            <strong>{formatCurrency(advice.outfit.total_price)}</strong>
          </div>
        </div>
      )}

      {advice.subscription && <SubscriptionNotice advice={advice.subscription} />}

      {advice.handoff && (
        <section className="handoff">
          <span className="status-dot" />
          <div><strong>接管摘要已就绪</strong><p>{advice.handoff.summary}</p></div>
          <span>{advice.handoff.reason}</span>
        </section>
      )}

      {advice.evidence.length > 0 && (
        <details className="decision-proof">
          <summary>为什么这样推荐</summary>
          <div className="decision-proof__content">
            <ol>{advice.evidence.map((item) => <li key={item}>{item}</li>)}</ol>
            <p>先执行硬条件筛选，再按偏好排序；缺失信息不会被补造。</p>
          </div>
        </details>
      )}
    </article>
  );
}

function App() {
  const [members, setMembers] = useState<Member[]>(FALLBACK_MEMBERS);
  const [memberId, setMemberId] = useState("M-DEMO-01");
  const [messages, setMessages] = useState<ThreadItem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const threadEnd = useRef<HTMLDivElement>(null);

  const currentMember = useMemo(() => members.find((member) => member.id === memberId) ?? members[0], [members, memberId]);
  const hasStarted = messages.length > 0;

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/health`).then((response) => {
        if (!response.ok) throw new Error("API unavailable");
        return response.json();
      }),
      fetch(`${API_BASE}/api/members`).then((response) => response.json()),
    ])
      .then(([, memberData]) => {
        setApiOnline(true);
        setMembers(memberData);
      })
      .catch(() => setApiOnline(false));
  }, []);

  useEffect(() => {
    threadEnd.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading]);

  async function submit(text: string) {
    const clean = text.trim();
    if (!clean || loading) return;
    const userMessage: ThreadItem = { id: `u-${Date.now()}`, role: "user", text: clean };
    setMessages((existing) => [...existing, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const subscriptionAlreadyShown = messages.some((item) => item.role === "assistant" && Boolean(item.advice.subscription));
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: clean,
          member_id: memberId,
          mode: "auto",
          subscription_already_shown: subscriptionAlreadyShown,
        }),
      });
      if (!response.ok) throw new Error(`API ${response.status}`);
      const advice = (await response.json()) as Advice;
      setMessages((existing) => [...existing, { id: `a-${Date.now()}`, role: "assistant", advice }]);
      setApiOnline(true);
    } catch {
      setApiOnline(false);
      setMessages((existing) => [
        ...existing,
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          advice: {
            intent: "handoff",
            message: "演示 API 尚未连接。请先按 README 启动 FastAPI 服务，再继续体验完整推荐链路。",
            products: [], outfit: null, subscription: null,
            evidence: ["前端运行正常", "API 连接失败", "未发送任何外部请求"],
            handoff: null,
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void submit(input);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="#main" aria-label="StyleMate AI 首页">
          <span>SM</span>
          <strong>STYLEMATE</strong>
          <em>智能时尚顾问</em>
        </a>
        <div className="topbar__actions">
          <span className="service-status" title={apiOnline === null ? "正在检测服务" : apiOnline ? "服务在线" : "API 未连接"}>
            <span className={`status-dot ${apiOnline === false ? "status-dot--off" : ""}`} />
            {apiOnline === false ? "服务未连接" : "服务在线"}
          </span>
          <label className="member-control" htmlFor="member">
            <span>为</span>
            <select id="member" value={memberId} onChange={(event) => setMemberId(event.target.value)}>
              {members.map((member) => <option value={member.id} key={member.id}>{member.name}</option>)}
            </select>
            <span>推荐</span>
          </label>
        </div>
      </header>

      <main className="workspace" id="main">
        {!hasStarted && (
          <section className="welcome-stage">
            <p className="welcome-stage__member">已结合 {currentMember?.name} 的尺码、风格偏好与会员状态</p>
            <h1>今天想怎么穿？</h1>
            <p className="welcome-stage__copy">描述场合、风格、版型或预算，我会筛出合适单品，也能围绕指定款完成整套搭配。</p>
            <form className="composer composer--welcome" onSubmit={onSubmit}>
              <div>
                <textarea
                  id="message-welcome"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void submit(input);
                    }
                  }}
                  rows={2}
                  placeholder="例如：想找一件春季通勤的灰色宽松外套，预算 1500 元以内"
                  aria-label="描述你的穿搭需求"
                />
                <button type="submit" disabled={!input.trim() || loading}>开始推荐 <ArrowIcon /></button>
              </div>
            </form>
            <div className="quick-tasks" aria-label="需求示例">
              <span>也可以直接试试</span>
              {QUICK_TASKS.map((task) => (
                <button key={task.label} onClick={() => void submit(task.text)} disabled={loading}>
                  {task.label}<ArrowIcon />
                </button>
              ))}
            </div>
          </section>
        )}

        {hasStarted && <section className="thread" aria-live="polite" aria-label="导购对话">
          {messages.map((item) => item.role === "user" ? (
            <div className="user-message" key={item.id}><span>你的需求</span><p>{item.text}</p></div>
          ) : (
            <AssistantResponse key={item.id} advice={item.advice} />
          ))}
          {loading && (
            <div className="thinking" role="status"><SparkIcon /><span>正在解析硬条件与业务规则</span><i /><i /><i /></div>
          )}
          <div ref={threadEnd} />
        </section>}

        {hasStarted && <form className="composer composer--followup" onSubmit={onSubmit}>
          <div>
            <textarea
              id="message"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void submit(input);
                }
              }}
              rows={2}
              placeholder="继续补充：换成深色，或把整套控制在 3000 元以内"
            />
            <button type="submit" disabled={!input.trim() || loading} aria-label="发送需求">发送 <ArrowIcon /></button>
          </div>
          <p>Enter 发送 · Shift + Enter 换行</p>
        </form>}
      </main>
      <footer className="app-footer">商品与人物均为虚构 · 推荐依据可随时展开查看</footer>
    </div>
  );
}

export default App;
