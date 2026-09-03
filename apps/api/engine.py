from __future__ import annotations

import json
import math
import re
from collections import Counter
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Iterable


ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "data" / "demo"


def _load(name: str) -> Any:
    with (DATA_DIR / name).open("r", encoding="utf-8") as source:
        return json.load(source)


PRODUCTS: list[dict[str, Any]] = _load("products.json")
MERCHANTS: list[dict[str, Any]] = _load("merchants.json")
PRODUCT_BY_SKU = {item["sku"]: item for item in PRODUCTS}
MERCHANT_BY_KEY = {
    key: merchant
    for merchant in MERCHANTS
    for key in (merchant["id"], merchant["name"])
}


def _resolve_merchant(merchant_key: str | None) -> dict[str, Any] | None:
    return MERCHANT_BY_KEY.get(merchant_key or "")


DEPARTMENT_ALIASES = {
    "外套": ["外套", "风衣", "夹克", "西服", "西装", "羽绒服", "棉衣", "皮衣"],
    "上装": ["上装", "T恤", "短袖", "衬衣", "衬衫", "针织", "毛衫", "卫衣", "背心", "马甲"],
    "裤装": ["裤装", "裤子", "长裤", "短裤", "牛仔裤", "阔腿裤"],
    "裙装": ["裙装", "半裙", "腰裙", "连衣裙", "连体衣"],
    "套装": ["套装"],
}

CATEGORY_ALIASES = {
    "T恤": ["T恤", "短袖"],
    "衬衣": ["衬衣", "衬衫"],
    "针织衫": ["针织衫", "针织"],
    "毛织衫": ["毛织衫", "毛衫"],
    "卫衣": ["卫衣"],
    "背心": ["背心"],
    "马甲": ["马甲"],
    "裤子": ["长裤", "阔腿裤", "西裤"],
    "牛仔裤": ["牛仔裤"],
    "中短裤": ["中短裤", "短裤"],
    "腰裙": ["半裙", "腰裙"],
    "连衣裙": ["连衣裙"],
    "风衣": ["风衣"],
    "夹克": ["夹克"],
    "西服": ["西服", "西装"],
    "羽绒服": ["羽绒服"],
    "套装": ["套装"],
}

COLOR_ALIASES = {
    "黑": ["黑色", "本黑", "黑"],
    "白": ["白色", "漂白", "白"],
    "灰": ["灰色", "中灰", "浅灰", "深灰", "灰"],
    "蓝": ["蓝色", "藏蓝", "牛仔蓝", "蓝"],
    "绿": ["绿色", "墨绿", "军绿", "绿"],
    "红": ["红色", "酒红", "红"],
    "粉": ["粉色", "粉"],
    "紫": ["紫色", "紫"],
    "卡其": ["卡其"],
    "米": ["米色", "米白", "米"],
    "棕": ["棕色", "咖色", "棕", "咖"],
}

FIT_ALIASES = {
    "宽松": ["宽松", "松一点", "不贴身", "偏宽松"],
    "合体": ["合体", "合身", "常规"],
    "修身": ["修身", "贴身"],
    "OVERSIZE": ["oversize", "廓形", "超宽松"],
}

MATERIAL_ALIASES = {
    "棉": ["棉质", "全棉", "棉"],
    "麻": ["亚麻", "麻质", "麻"],
    "羊毛": ["羊毛", "毛料"],
    "真丝": ["真丝", "蚕丝"],
    "牛仔": ["牛仔"],
    "锦纶": ["锦纶"],
    "醋酸": ["醋酸"],
}

STYLE_ALIASES = {
    "通勤": ["通勤", "上班", "办公室", "职场"],
    "都市": ["都市", "城市"],
    "优雅": ["优雅", "轻熟"],
    "街头": ["街头", "潮流", "酷"],
    "日常休闲": ["休闲", "日常", "松弛"],
    "极简": ["极简", "简洁", "克制"],
    "前卫": ["前卫", "设计感"],
    "精致": ["精致", "轻正式"],
    "户外": ["户外", "旅行"],
    "趣味": ["趣味", "活泼"],
}

PLATFORM_ALIASES = {
    "淘宝": ["淘宝", "天猫"],
    "抖音电商": ["抖音", "抖店", "直播"],
    "小红书店铺": ["小红书", "红书"],
}

AUDIENCE_ALIASES = {
    "女装": ["女装", "女性", "女生"],
    "男装": ["男装", "男性", "男生"],
    "童装": ["童装", "儿童", "孩子", "亲子"],
}


@dataclass
class ParsedQuery:
    department: str | None = None
    category: str | None = None
    audience: str | None = None
    color: str | None = None
    fit: str | None = None
    material: str | None = None
    season: str | None = None
    styles: list[str] | None = None
    retail_min: int | None = None
    retail_max: int | None = None
    procurement_budget: int | None = None
    platform: str | None = None
    target_count: int | None = None
    line: str | None = None
    moq_max: int | None = None

    def __post_init__(self) -> None:
        if self.styles is None:
            self.styles = []

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    def hard_evidence(self) -> list[str]:
        values: list[tuple[str, str | None]] = [
            ("货盘", self.line),
            ("人群", self.audience),
            ("品类", self.category or self.department),
            ("颜色", self.color),
            ("版型", self.fit),
            ("材质", self.material),
            ("季节", self.season),
            ("渠道", self.platform),
            ("零售价带", _format_range(self.retail_min, self.retail_max)),
            ("起订量", f"≤ {self.moq_max} 件" if self.moq_max else None),
        ]
        return [f"{label}: {value}" for label, value in values if value]

    def preference_evidence(self) -> list[str]:
        evidence = [f"风格偏好: {' / '.join(self.styles)}"] if self.styles else []
        if self.procurement_budget:
            evidence.append(f"采购预算: ¥{self.procurement_budget:,}")
        if self.target_count:
            evidence.append(f"目标款数: {self.target_count} 款")
        return evidence


def _format_range(low: int | None, high: int | None) -> str | None:
    if low is not None and high is not None:
        return f"¥{low:,}–¥{high:,}"
    if high is not None:
        return f"≤ ¥{high:,}"
    if low is not None:
        return f"≥ ¥{low:,}"
    return None


def _first_alias(query: str, groups: dict[str, Iterable[str]]) -> str | None:
    lowered = query.lower()
    for canonical, aliases in groups.items():
        if any(alias.lower() in lowered for alias in aliases):
            return canonical
    return None


def _parse_amount(raw: str, unit: str | None) -> int:
    amount = float(raw)
    return int(amount * 10000) if unit and unit.lower() in {"万", "w"} else int(amount)


def parse_query(query: str) -> ParsedQuery:
    price_range = re.search(r"(?:零售价|售价|客单价|价格带)[^0-9]{0,6}(\d{2,5})\s*(?:-|—|~|～|到|至)\s*(\d{2,5})", query)
    if not price_range:
        price_range = re.search(r"(\d{2,5})\s*(?:-|—|~|～|到|至)\s*(\d{2,5})\s*元", query)
    price_cap = None if price_range else re.search(r"(?:零售价|售价|客单价)[^0-9]{0,8}(\d{2,5})\s*(?:元)?(?:以内|以下|封顶)", query)
    budget_match = re.search(r"(?:采购预算|首批预算|拿货预算|预算)[^0-9]{0,8}(\d+(?:\.\d+)?)\s*(万|w)?", query, re.IGNORECASE)
    count_match = re.search(r"(?:选|组|要|推荐)?\s*(\d{1,2})\s*款", query)
    moq_match = re.search(r"(?:起订量|MOQ)[^0-9]{0,8}(\d{1,3})", query, re.IGNORECASE)
    line_match = re.search(r"系列\s*([A-D])", query, re.IGNORECASE)
    styles = [name for name, aliases in STYLE_ALIASES.items() if any(alias in query for alias in aliases)]

    retail_min = int(price_range.group(1)) if price_range else None
    retail_max = int(price_range.group(2)) if price_range else int(price_cap.group(1)) if price_cap else None
    if retail_min and retail_max and retail_min > retail_max:
        retail_min, retail_max = retail_max, retail_min

    category = _first_alias(query, CATEGORY_ALIASES)
    department = _first_alias(query, DEPARTMENT_ALIASES)
    if category:
        department = next((group for group, values in DEPARTMENT_ALIASES.items() if category in values), department)

    return ParsedQuery(
        department=department,
        category=category,
        audience=_first_alias(query, AUDIENCE_ALIASES),
        color=_first_alias(query, COLOR_ALIASES),
        fit=_first_alias(query, FIT_ALIASES),
        material=_first_alias(query, MATERIAL_ALIASES),
        season=next((value for value in ["春", "夏", "秋", "冬"] if value in query), None),
        styles=styles,
        retail_min=retail_min,
        retail_max=retail_max,
        procurement_budget=_parse_amount(budget_match.group(1), budget_match.group(2)) if budget_match else None,
        platform=_first_alias(query, PLATFORM_ALIASES),
        target_count=min(int(count_match.group(1)), 20) if count_match else None,
        line=f"系列 {line_match.group(1).upper()}" if line_match else None,
        moq_max=int(moq_match.group(1)) if moq_match else None,
    )


def _fit_family(value: str) -> str:
    lowered = value.lower()
    if "oversize" in lowered:
        return "OVERSIZE"
    if "宽松" in value:
        return "宽松"
    if "修身" in value:
        return "修身"
    return "合体"


def _effective_constraints(parsed: ParsedQuery, merchant: dict[str, Any] | None) -> dict[str, Any]:
    return {
        "audiences": [parsed.audience] if parsed.audience else (merchant or {}).get("audiences", []),
        "platform": parsed.platform or (merchant or {}).get("platform"),
        "retail_min": parsed.retail_min if parsed.retail_min is not None else (merchant or {}).get("price_band", {}).get("min"),
        "retail_max": parsed.retail_max if parsed.retail_max is not None else (merchant or {}).get("price_band", {}).get("max"),
    }


def _hard_match(product: dict[str, Any], parsed: ParsedQuery, merchant: dict[str, Any] | None) -> bool:
    effective = _effective_constraints(parsed, merchant)
    return all(
        [
            not parsed.department or product["department"] == parsed.department,
            not parsed.category or product["category"] == parsed.category,
            not parsed.line or product["line"] == parsed.line,
            not effective["audiences"] or product["audience"] in effective["audiences"],
            not parsed.color or product["color_family"] == parsed.color,
            not parsed.fit or _fit_family(product["fit"]) == parsed.fit,
            not parsed.material or parsed.material in {product["material_family"], product["material"]} or parsed.material in product["material"],
            not parsed.season or product["season"] == parsed.season,
            not effective["platform"] or effective["platform"] in product["channels"],
            effective["retail_min"] is None or product["suggested_retail_price"] >= effective["retail_min"],
            effective["retail_max"] is None or product["suggested_retail_price"] <= effective["retail_max"],
            not parsed.moq_max or product["moq"] <= parsed.moq_max,
            product["stock"] >= product["moq"],
        ]
    )


def _score(product: dict[str, Any], parsed: ParsedQuery, merchant: dict[str, Any] | None) -> tuple[float, list[str]]:
    score = 0.0
    reasons: list[str] = []
    requested_styles = set(parsed.styles or [])
    merchant_styles = set((merchant or {}).get("styles", []))
    product_styles = set(product["styles"])

    if requested_styles & product_styles:
        score += 0.5
        reasons.append(f"命中{' / '.join(sorted(requested_styles & product_styles))}风格")
    if merchant_styles & product_styles:
        score += 0.32
        reasons.append("贴合店铺历史风格")
    if product["department"] in (merchant or {}).get("preferred_departments", []):
        score += 0.16
    if product["margin_rate"] >= 0.54:
        score += 0.18
        reasons.append(f"建议毛利空间约 {product['margin_rate']:.0%}")
    if product["stock"] >= 90:
        score += 0.14
        reasons.append("可售库存相对充足")
    if product["risk_level"] == "低":
        score += 0.1
    score += max(0.0, (10 - product["lead_time_days"]) / 10) * 0.08
    score += max(0.0, (8 - product["moq"]) / 8) * 0.07
    if not reasons:
        reasons.append("符合店铺客群、渠道与价格带")
    return score, reasons[:3]


def search_products(query: str, merchant_id: str | None = None, limit: int = 12) -> dict[str, Any]:
    parsed = parse_query(query)
    merchant = _resolve_merchant(merchant_id)
    matches = [product for product in PRODUCTS if _hard_match(product, parsed, merchant)]
    ranked = []
    for product in matches:
        score, reasons = _score(product, parsed, merchant)
        ranked.append({**product, "score": round(score, 3), "reasons": reasons})
    ranked.sort(key=lambda item: (-item["score"], item["risk_level"], -item["margin_rate"], item["sku"]))
    return {
        "parsed": parsed,
        "products": ranked[: min(limit, 100)],
        "total": len(matches),
        "effective_constraints": _effective_constraints(parsed, merchant),
    }


ROLE_TARGETS = {"主销款": 4, "引流款": 2, "形象款": 2, "连带款": 2, "测试款": 2}
ROLE_QUANTITIES = {"主销款": 8, "引流款": 10, "形象款": 3, "连带款": 6, "测试款": 2}


def _role_fit(product: dict[str, Any], role: str, price_band: dict[str, int]) -> float:
    low, high = price_band["min"], price_band["max"]
    midpoint = (low + high) / 2
    retail = product["suggested_retail_price"]
    if role == "引流款":
        return (2 if retail <= low + (high - low) * 0.3 else 0) + product["stock"] / 300
    if role == "形象款":
        style_bonus = 1 if set(product["styles"]) & {"前卫", "精致", "都市", "优雅"} else 0
        return style_bonus + (1 if retail >= midpoint else 0) + product["margin_rate"]
    if role == "连带款":
        return (1.5 if product["department"] == "上装" else 0) + (1 if retail <= midpoint else 0)
    if role == "测试款":
        return (1.2 if product["risk_level"] == "关注" else 0) + (1 if set(product["styles"]) & {"前卫", "趣味", "街头"} else 0)
    return product["margin_rate"] + product["stock"] / 220 + (0.5 if product["risk_level"] == "低" else 0)


def _quantity_for(product: dict[str, Any], role: str) -> int:
    target = ROLE_QUANTITIES[role]
    moq = product["moq"]
    quantity = max(moq, math.ceil(target / moq) * moq)
    return min(quantity, (product["stock"] // moq) * moq)


def build_assortment(query: str, merchant_id: str | None = None) -> dict[str, Any]:
    merchant = _resolve_merchant(merchant_id)
    parsed = parse_query(query)
    result = search_products(query, merchant_id, limit=100)
    target_count = parsed.target_count or 12
    budget = parsed.procurement_budget or (merchant or {}).get("default_budget", 30000)
    price_band = {
        "min": result["effective_constraints"].get("retail_min") or 199,
        "max": result["effective_constraints"].get("retail_max") or 1499,
    }
    candidates = result["products"]
    selected: list[dict[str, Any]] = []
    used_skus: set[str] = set()
    used_styles: set[str] = set()

    expanded_roles = [role for role, count in ROLE_TARGETS.items() for _ in range(count)]
    if target_count > len(expanded_roles):
        expanded_roles.extend(["主销款"] * (target_count - len(expanded_roles)))
    expanded_roles = expanded_roles[:target_count]

    for role in expanded_roles:
        available = [product for product in candidates if product["sku"] not in used_skus]
        if not available:
            break
        unique_style = [product for product in available if product["style_code"] not in used_styles]
        pool = unique_style or available
        product = max(pool, key=lambda item: (_role_fit(item, role, price_band), item.get("score", 0)))
        quantity = _quantity_for(product, role)
        if quantity < product["moq"]:
            continue
        net_cost = round(product["wholesale_price"] * (merchant or {}).get("discount_rate", 1.0))
        selected.append({
            **product,
            "selection_role": role,
            "recommended_quantity": quantity,
            "net_unit_cost": net_cost,
            "line_total": net_cost * quantity,
        })
        used_skus.add(product["sku"])
        used_styles.add(product["style_code"])

    def total_cost() -> int:
        return sum(item["line_total"] for item in selected)

    while total_cost() > budget:
        reducible = [item for item in selected if item["recommended_quantity"] > item["moq"]]
        if not reducible:
            break
        item = max(reducible, key=lambda product: product["line_total"])
        item["recommended_quantity"] -= item["moq"]
        item["line_total"] = item["net_unit_cost"] * item["recommended_quantity"]

    while total_cost() > budget and selected:
        removable = sorted(selected, key=lambda item: (item["selection_role"] not in {"测试款", "形象款"}, -item["line_total"]))
        selected.remove(removable[0])

    total = total_cost()
    retail_value = sum(item["suggested_retail_price"] * item["recommended_quantity"] for item in selected)
    total_units = sum(item["recommended_quantity"] for item in selected)
    role_counts = dict(Counter(item["selection_role"] for item in selected))
    return {
        "items": selected,
        "summary": {
            "style_count": len(selected),
            "unit_count": total_units,
            "total_cost": total,
            "retail_value": retail_value,
            "estimated_margin_rate": round((retail_value - total) / retail_value, 3) if retail_value else 0,
            "budget": budget,
            "budget_remaining": budget - total,
            "role_counts": role_counts,
        },
        "available_count": result["total"],
        "logic": "先执行客群、渠道、零售价带、品类与供货条件硬筛选，再按店铺风格、毛利空间、库存风险和组货角色分配款式与建议数量。",
    }


def _handoff_reason(query: str) -> str | None:
    triggers = {
        "价格与合作条款": ["议价", "最低价", "特殊折扣", "额外折扣", "账期", "合同", "发票", "返点"],
        "实时库存或锁货": ["锁库存", "锁货", "实时库存", "确认现货", "下单"],
        "物流与售后": ["物流", "到货", "退货", "退款", "售后"],
        "大额采购": ["大货", "大批量", "十万", "20万", "二十万"],
        "明确要求销售": ["联系销售", "转人工", "业务员", "招商主管"],
    }
    for reason, words in triggers.items():
        if any(word in query for word in words):
            return reason
    return None


def _merchant_context(merchant: dict[str, Any] | None) -> dict[str, Any] | None:
    if not merchant:
        return None
    return {
        "id": merchant["id"],
        "name": merchant["name"],
        "platform": merchant["platform"],
        "target_customer": merchant["target_customer"],
        "price_band": merchant["price_band"],
        "tier": merchant["tier"],
        "discount_rate": merchant["discount_rate"],
        "sample_quota": merchant["sample_quota"],
    }


def handle_request(query: str, merchant_id: str | None = None, mode: str = "auto") -> dict[str, Any]:
    merchant = _resolve_merchant(merchant_id)
    parsed = parse_query(query)
    handoff_reason = _handoff_reason(query)
    if handoff_reason:
        return {
            "intent": "handoff",
            "message": "这个请求涉及实时交易权限或合作条款，已生成销售接管摘要，AI 不会替供应商作出承诺。",
            "merchant": _merchant_context(merchant),
            "parsed": parsed.to_dict(),
            "products": [],
            "assortment": None,
            "evidence": [f"接管原因: {handoff_reason}", "未执行锁货、下单或价格承诺"],
            "handoff": {
                "reason": handoff_reason,
                "summary": f"商家：{merchant['name'] if merchant else '未识别'}；需求：{query}",
                "owner": (merchant or {}).get("account_manager", "销售顾问"),
                "status": "ready",
            },
        }

    account_words = ["商家等级", "拿货政策", "折扣", "额度", "样衣", "账户"]
    assortment_words = ["组货", "一批", "上新", "首批", "选一批", "选款单", "采购清单"]
    is_account = mode == "account" or any(word in query for word in account_words)
    is_assortment = mode == "assortment" or any(word in query for word in assortment_words) or parsed.procurement_budget is not None

    if is_account:
        if not merchant:
            return {
                "intent": "account",
                "message": "请先选择演示商家，系统才能读取对应的拿货政策与样衣额度。",
                "merchant": None,
                "parsed": parsed.to_dict(),
                "products": [],
                "assortment": None,
                "evidence": ["商家上下文: 未选择"],
                "handoff": None,
            }
        return {
            "intent": "account",
            "message": f"{merchant['name']}当前为{merchant['tier']}，结算折扣系数 {merchant['discount_rate']:.2f}，可申请 {merchant['sample_quota']} 件演示样衣。",
            "merchant": _merchant_context(merchant),
            "parsed": parsed.to_dict(),
            "products": [],
            "assortment": None,
            "evidence": [f"授信额度: ¥{merchant['credit_limit']:,}", f"专属对接: {merchant['account_manager']}"],
            "handoff": None,
        }

    if is_assortment:
        assortment = build_assortment(query, merchant_id)
        style_count = assortment["summary"]["style_count"]
        return {
            "intent": "assortment",
            "message": f"已从 {assortment['available_count']} 款候选中组成 {style_count} 款首批货盘，并把采购额控制在预算内。" if style_count else "没有找到同时满足硬条件的商品，系统不会自动放宽客群、渠道或价格带。",
            "merchant": _merchant_context(merchant),
            "parsed": parsed.to_dict(),
            "products": [],
            "assortment": assortment,
            "evidence": parsed.hard_evidence() + parsed.preference_evidence(),
            "handoff": None,
        }

    result = search_products(query, merchant_id)
    if not result["products"]:
        message = "没有找到同时满足硬条件的商品。系统不会自动放宽客群、渠道、价格带或供货要求。"
    else:
        message = f"货盘中有 {result['total']} 款满足硬条件，当前按店铺风格、毛利和库存风险展示前 {len(result['products'])} 款。"
    return {
        "intent": "selection",
        "message": message,
        "merchant": _merchant_context(merchant),
        "parsed": parsed.to_dict(),
        "products": result["products"],
        "assortment": None,
        "evidence": parsed.hard_evidence() + parsed.preference_evidence(),
        "handoff": None,
    }
