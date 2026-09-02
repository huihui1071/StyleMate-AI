export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(value);
}

export function intentLabel(intent: string): string {
  const labels: Record<string, string> = {
    product_search: "智能导购",
    outfit: "搭配顾问",
    member: "会员顾问",
    handoff: "人工接管",
  };
  return labels[intent] ?? "导购任务";
}

