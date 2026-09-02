export type Product = {
  sku: string;
  style_code: string;
  brand: string;
  name: string;
  category: string;
  price: number;
  color: string;
  color_family: string;
  material: string;
  silhouette: string;
  fit: string;
  season: string;
  styles: string[];
  craft: string;
  description: string;
  visual: { tone: string; shape: string };
  reasons?: string[];
  role?: string;
};

export type Advice = {
  intent: "product_search" | "outfit" | "member" | "handoff";
  message: string;
  products: Product[];
  outfit: null | {
    items: Product[];
    total_price: number;
    reason: string;
    source_type?: string;
  };
  subscription: null | {
    type: string;
    title: string;
    messages: string[];
    cta: string;
  };
  evidence: string[];
  handoff: null | {
    reason: string;
    summary: string;
    status: string;
  };
};

export type Member = {
  id: string;
  name: string;
  tier: string | null;
  points: number;
  subscription_status: string;
};

export type ThreadItem =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; advice: Advice };

