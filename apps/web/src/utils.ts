export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("zh-CN", {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(value);
}

export function intentLabel(intent: string): string {
  const labels: Record<string, string> = {
    selection: "智能选款",
    assortment: "组货方案",
    account: "商家政策",
    handoff: "销售接管",
  };
  return labels[intent] ?? "选款任务";
}
