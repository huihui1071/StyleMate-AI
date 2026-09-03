export type Product = {
  sku: string;
  style_code: string;
  line: string;
  audience: string;
  name: string;
  department: string;
  category: string;
  wholesale_price: number;
  suggested_retail_price: number;
  margin_rate: number;
  color: string;
  color_family: string;
  material: string;
  material_family: string;
  silhouette: string;
  fit: string;
  season: string;
  styles: string[];
  craft: string;
  description: string;
  image: string;
  stock: number;
  moq: number;
  lead_time_days: number;
  channels: string[];
  default_role: string;
  risk_level: string;
  data_note: string;
  reasons?: string[];
  selection_role?: string;
  recommended_quantity?: number;
  net_unit_cost?: number;
  line_total?: number;
};

export type Merchant = {
  id: string;
  name: string;
  platform: string;
  business_stage: string;
  target_customer: string;
  price_band: { min: number; max: number };
  tier: string;
  default_budget: number;
  discount_rate?: number;
  sample_quota?: number;
};

export type AssortmentSummary = {
  style_count: number;
  unit_count: number;
  total_cost: number;
  retail_value: number;
  estimated_margin_rate: number;
  budget: number;
  budget_remaining: number;
  role_counts: Record<string, number>;
};

export type Advice = {
  intent: "selection" | "assortment" | "account" | "handoff";
  message: string;
  merchant: Merchant | null;
  parsed: Record<string, string | number | string[] | null>;
  products: Product[];
  assortment: null | {
    items: Product[];
    summary: AssortmentSummary;
    available_count: number;
    logic: string;
  };
  evidence: string[];
  handoff: null | {
    reason: string;
    summary: string;
    owner: string;
    status: string;
  };
};

export type SelectionItem = Product & {
  quantity: number;
  unitCost: number;
};
