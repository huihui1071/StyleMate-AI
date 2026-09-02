from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable


ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "data" / "demo"


def _load(name: str) -> Any:
    with (DATA_DIR / name).open("r", encoding="utf-8") as source:
        return json.load(source)


PRODUCTS: list[dict[str, Any]] = _load("products.json")
MEMBERS: list[dict[str, Any]] = _load("members.json")
RULES: dict[str, Any] = _load("subscription_rules.json")
PRODUCT_BY_SKU = {item["sku"]: item for item in PRODUCTS}
MEMBER_BY_ID = {member["id"]: member for member in MEMBERS}


CATEGORY_ALIASES = {
    "外套": ["外套", "风衣", "夹克", "西装"],
    "衬衣": ["衬衣", "衬衫"],
    "裤子": ["裤子", "长裤", "阔腿裤", "工装裤", "西裤"],
    "半裙": ["半裙", "裙子", "长裙"],
    "连衣裙": ["连衣裙", "裙装"],
    "针织衫": ["针织", "毛衫"],
    "T恤": ["T恤", "短袖"],
    "背心": ["背心"],
    "卫衣": ["卫衣"],
    "短裤": ["短裤"],
    "马甲": ["马甲"],
}

COLOR_ALIASES = {
    "灰": ["灰色", "灰", "炭灰", "银灰"],
    "绿": ["绿色", "绿", "墨绿", "灰绿"],
    "蓝": ["蓝色", "蓝", "藏蓝", "墨蓝"],
    "黑": ["黑色", "黑", "本黑"],
    "白": ["白色", "白", "冷白"],
    "米白": ["米白", "米色"],
    "卡其": ["卡其"],
    "红": ["红色", "红", "暗红"],
    "粉": ["粉色", "粉"],
    "棕": ["棕色", "棕", "咖色"],
}

FIT_ALIASES = {
    "宽松": ["宽松", "松一点", "不贴身"],
    "合体": ["合体", "合身"],
    "修身": ["修身", "贴身"],
    "OVERSIZE": ["oversize", "廓形", "超宽松"],
}

MATERIAL_ALIASES = {
    "亚麻": ["亚麻", "麻质", "麻"],
    "棉": ["棉质", "全棉", "棉"],
    "羊毛": ["羊毛", "毛料"],
    "醋酸": ["醋酸", "缎面"],
    "针织": ["针织"],
}

STYLE_ALIASES = {
    "通勤": ["通勤", "上班", "办公室", "职场"],
    "度假": ["度假", "旅行", "海边"],
    "优雅": ["优雅", "约会", "婚礼", "展览"],
    "街头": ["街头", "酷", "潮"],
    "日常休闲": ["休闲", "周末", "日常"],
    "极简": ["极简", "简洁"],
    "前卫": ["前卫", "有设计感"],
    "精致": ["精致", "轻正式"],
    "户外": ["户外", "步行"],
}


@dataclass
class ParsedQuery:
    category: str | None
    color: str | None
    fit: str | None
    material: str | None
    season: str | None
    styles: list[str]
    price_max: int | None
    brand: str | None

    def evidence(self) -> list[str]:
        labels = []
        pairs = [
            ("品类", self.category),
            ("颜色", self.color),
            ("版型", self.fit),
            ("材质", self.material),
            ("季节", self.season),
            ("预算", f"≤ ¥{self.price_max:,}" if self.price_max else None),
            ("品牌", self.brand),
        ]
        labels.extend(f"{name}: {value}" for name, value in pairs if value)
        labels.extend(f"场景/风格: {style}" for style in self.styles)
        return labels


def _first_alias(query: str, groups: dict[str, Iterable[str]]) -> str | None:
    lowered = query.lower()
    for canonical, aliases in groups.items():
        if any(alias.lower() in lowered for alias in aliases):
            return canonical
    return None


def parse_query(query: str) -> ParsedQuery:
    price_match = re.search(r"(?:预算|价格|控制在|不超过|以内)[^0-9]{0,8}(\d{3,5})", query)
    if not price_match:
        price_match = re.search(r"(\d{3,5})\s*(?:元)?(?:以内|以下|封顶)", query)
    brand_match = re.search(r"Brand_[A-D]", query, re.IGNORECASE)
    season = next((value for value in ["春", "夏", "秋", "冬"] if value in query), None)
    styles = [name for name, aliases in STYLE_ALIASES.items() if any(alias in query for alias in aliases)]
    return ParsedQuery(
        category=_first_alias(query, CATEGORY_ALIASES),
        color=_first_alias(query, COLOR_ALIASES),
        fit=_first_alias(query, FIT_ALIASES),
        material=_first_alias(query, MATERIAL_ALIASES),
        season=season,
        styles=styles,
        price_max=int(price_match.group(1)) if price_match else None,
        brand=brand_match.group(0).replace("brand", "Brand") if brand_match else None,
    )


def _material_matches(product: dict[str, Any], material: str) -> bool:
    return material in product["material"]


def _hard_match(product: dict[str, Any], parsed: ParsedQuery) -> bool:
    return all(
        [
            not parsed.category or product["category"] == parsed.category,
            not parsed.color or product["color_family"] == parsed.color,
            not parsed.fit or product["fit"] == parsed.fit,
            not parsed.material or _material_matches(product, parsed.material),
            not parsed.season or product["season"] == parsed.season,
            not parsed.price_max or product["price"] <= parsed.price_max,
            not parsed.brand or product["brand"] == parsed.brand,
        ]
    )


def _score(product: dict[str, Any], parsed: ParsedQuery, member: dict[str, Any] | None) -> tuple[float, list[str]]:
    score = 0.0
    reasons: list[str] = []
    matched_styles = set(product["styles"]) & set(parsed.styles)
    if matched_styles:
        score += 0.3 * len(matched_styles)
        reasons.append(f"匹配{''.join(sorted(matched_styles))}场景")
    if parsed.color and product["color_family"] == parsed.color:
        reasons.append(f"符合{parsed.color}色要求")
    if parsed.fit and product["fit"] == parsed.fit:
        reasons.append(f"{product['fit']}版型符合偏好")
    if parsed.price_max:
        remaining = parsed.price_max - product["price"]
        score += max(0, remaining / max(parsed.price_max, 1)) * 0.08
        reasons.append(f"预算内保留 ¥{remaining:,} 搭配空间")
    if member and member["id"] != "M-DEMO-04":
        prefs = member["preferences"]
        if product["fit"] in prefs["fit"]:
            score += 0.25
            reasons.append("命中会员版型偏好")
        if product["season"] in prefs["season"]:
            score += 0.15
            reasons.append("符合常购季节")
        if set(product["styles"]) & set(prefs["style"]):
            score += 0.22
            reasons.append("贴近历史风格偏好")
        if product["color_family"] in prefs["colors"] or product["color"] in prefs["colors"]:
            score += 0.12
            reasons.append("命中常购色系")
    score += (2000 - min(product["price"], 2000)) / 2000 * 0.03
    if not reasons:
        reasons.append("基础属性与当前条件兼容")
    return score, reasons[:3]


def search_products(query: str, member_id: str | None = None, limit: int = 6) -> dict[str, Any]:
    parsed = parse_query(query)
    member = MEMBER_BY_ID.get(member_id or "")
    matches = [item for item in PRODUCTS if _hard_match(item, parsed)]
    ranked = []
    for item in matches:
        score, reasons = _score(item, parsed, member)
        ranked.append({**item, "score": round(score, 3), "reasons": reasons})
    ranked.sort(key=lambda item: (-item["score"], item["price"], item["sku"]))
    return {"parsed": parsed, "products": ranked[: min(limit, 8)], "total": len(matches)}


def _complement_categories(anchor: dict[str, Any]) -> list[str]:
    category = anchor["category"]
    if category in {"裤子", "半裙", "短裤"}:
        return ["衬衣", "针织衫", "T恤", "外套"]
    if category in {"衬衣", "针织衫", "T恤", "背心", "卫衣", "马甲"}:
        return ["裤子", "半裙", "外套"]
    if category == "外套":
        return ["衬衣", "针织衫", "裤子", "半裙"]
    if category == "连衣裙":
        return ["外套", "针织衫"]
    return ["衬衣", "裤子", "外套"]


def _outfit_compatibility(anchor: dict[str, Any], candidate: dict[str, Any], parsed: ParsedQuery) -> float:
    if anchor["sku"] == candidate["sku"]:
        return -1
    score = 0.0
    neutral = {"黑", "白", "灰", "米白", "棕", "卡其"}
    if candidate["color_family"] in neutral or anchor["color_family"] in neutral:
        score += 0.35
    elif candidate["color_family"] == anchor["color_family"]:
        score += 0.2
    if set(anchor["styles"]) & set(candidate["styles"]):
        score += 0.35
    if set(candidate["styles"]) & set(parsed.styles):
        score += 0.25
    if anchor["fit"] in {"宽松", "OVERSIZE"} and candidate["fit"] in {"合体", "修身"}:
        score += 0.2
    if anchor["fit"] in {"合体", "修身"} and candidate["fit"] in {"宽松", "OVERSIZE"}:
        score += 0.2
    if candidate["season"] == anchor["season"]:
        score += 0.15
    return score


def build_outfit(query: str, member_id: str | None = None) -> dict[str, Any]:
    parsed = parse_query(query)
    sku_match = re.search(r"SKU-DEMO-\d{3}", query, re.IGNORECASE)
    anchor = PRODUCT_BY_SKU.get(sku_match.group(0).upper()) if sku_match else None
    if not anchor:
        result = search_products(query, member_id, limit=1)
        anchor = result["products"][0] if result["products"] else None
    if not anchor:
        return {"items": [], "total_price": 0, "reason": "没有找到满足硬条件的主单品。"}

    categories = _complement_categories(anchor)
    candidates = [item for item in PRODUCTS if item["category"] in categories and item["sku"] != anchor["sku"]]
    scored = sorted(candidates, key=lambda item: (-_outfit_compatibility(anchor, item, parsed), item["price"]))
    chosen: list[dict[str, Any]] = [{**anchor, "role": "主单品"}]
    used_categories = {anchor["category"]}
    for item in scored:
        if item["category"] in used_categories:
            continue
        if parsed.price_max and sum(x["price"] for x in chosen) + item["price"] > parsed.price_max:
            continue
        chosen.append({**item, "role": "搭配单品"})
        used_categories.add(item["category"])
        if len(chosen) >= 4:
            break
    total = sum(item["price"] for item in chosen)
    shared_styles = set.intersection(*(set(item["styles"]) for item in chosen)) if chosen else set()
    style_label = "、".join(sorted(shared_styles or set(parsed.styles) or set(anchor["styles"])))
    reason = f"以{anchor['name']}为视觉中心，用深浅中性色稳定整体，再通过松紧与长短比例形成层次。整套偏{style_label or '日常'}。"
    return {"items": chosen, "total_price": total, "reason": reason, "source_type": "属性规则搭配"}


def subscription_advice(member_id: str | None, user_is_shopping: bool = True) -> dict[str, Any] | None:
    member = MEMBER_BY_ID.get(member_id or "")
    if not member or member["id"] == "M-DEMO-04":
        return None
    if member["subscription_status"] == "subscribed":
        notices = []
        if member["box_node"] in RULES["gift_nodes"]:
            notices.append(f"当前是第 {member['box_node']} 个发盒节点，可同时获得节点收盒礼。")
        if member["exchange_value"] >= RULES["exchange_threshold"]:
            notices.append(f"兑换值为 {member['exchange_value']:,}，已达到 {RULES['exchange_threshold']:,} 的演示兑换门槛。")
        if not notices:
            notices.append("订阅状态正常，本次无需额外操作。")
        return {"type": "member_notice", "title": "BOX+ 会员提醒", "messages": notices, "cta": "查看订阅详情"}
    if member["subscription_status"] == "not_subscribed" and user_is_shopping and member["tier"] in RULES["tiers"]:
        threshold = RULES["tiers"][member["tier"]]
        if member["points"] >= threshold["points"]:
            return {
                "type": "eligible",
                "title": "积分已满足 BOX+ 演示开通条件",
                "messages": [
                    f"当前积分 {member['points']:,}，对应门槛为 {threshold['points']:,} 积分。",
                    f"一年 6 个发盒节点，{RULES['shipping']}；第 1、3、6 个节点含收盒礼。",
                ],
                "cta": "了解权益，不立即开通",
            }
    return None


def _handoff_reason(query: str) -> str | None:
    triggers = {
        "实时库存": ["库存", "有货", "门店还有"],
        "交易或售后": ["退款", "退货", "支付", "扣款", "取消订阅", "投诉"],
        "明确要求人工": ["人工", "真人客服"],
    }
    for reason, words in triggers.items():
        if any(word in query for word in words):
            return reason
    return None


def handle_request(
    query: str,
    member_id: str | None = None,
    mode: str = "auto",
    subscription_already_shown: bool = False,
) -> dict[str, Any]:
    handoff = _handoff_reason(query)
    if handoff:
        return {
            "intent": "handoff",
            "message": "这个请求需要实时系统或人工权限，我已经整理好接管摘要。",
            "products": [],
            "outfit": None,
            "subscription": None,
            "evidence": [f"接管原因: {handoff}", "未执行任何真实交易操作"],
            "handoff": {"reason": handoff, "summary": f"用户请求：{query}", "status": "ready"},
        }

    membership_words = ["积分", "会员", "订阅", "BOX+", "盒子", "权益", "兑换值"]
    outfit_words = ["搭配", "搭一套", "整套", "怎么穿", "配什么"]
    is_member = mode == "member" or any(word in query for word in membership_words)
    is_outfit = mode == "outfit" or any(word in query for word in outfit_words) or "SKU-DEMO-" in query.upper()

    if is_member:
        member = MEMBER_BY_ID.get(member_id or "")
        if not member or member["id"] == "M-DEMO-04":
            return {
                "intent": "member",
                "message": "会员信息需要先授权。你仍可使用匿名导购与搭配功能。",
                "products": [],
                "outfit": None,
                "subscription": None,
                "evidence": ["会员上下文: 未授权"],
                "handoff": None,
            }
        advice = subscription_advice(member_id, user_is_shopping=True)
        return {
            "intent": "member",
            "message": f"{member['name']}，已读取你的虚构会员档案。当前积分 {member['points']:,}，订阅状态为{'订阅中' if member['subscription_status'] == 'subscribed' else '未订阅'}。",
            "products": [],
            "outfit": None,
            "subscription": advice,
            "evidence": [f"会员等级: {member['tier'] or '访客'}", f"画像偏好: {', '.join(member['preferences']['style']) or '暂无'}"],
            "handoff": None,
        }

    if is_outfit:
        outfit = build_outfit(query, member_id)
        return {
            "intent": "outfit",
            "message": "我先确定主单品，再用颜色、材质和廓形关系补完整套。",
            "products": [],
            "outfit": outfit,
            "subscription": None if subscription_already_shown else subscription_advice(member_id, user_is_shopping=True),
            "evidence": [f"搭配来源: {outfit.get('source_type', '无')}", f"整套预算: ¥{outfit.get('total_price', 0):,}"],
            "handoff": None,
        }

    result = search_products(query, member_id)
    parsed: ParsedQuery = result["parsed"]
    products = result["products"]
    if not products:
        return {
            "intent": "product_search",
            "message": "没有商品同时满足这些硬条件。我不会擅自放宽，你可以去掉一个颜色、材质或预算条件后再试。",
            "products": [],
            "outfit": None,
            "subscription": None,
            "evidence": parsed.evidence() or ["未识别到可筛选条件"],
            "handoff": None,
        }
    noun = parsed.category or "商品"
    message = f"找到 {result['total']} 款符合硬条件的{noun}，先按场景和会员偏好展示前 {len(products)} 款。"
    return {
        "intent": "product_search",
        "message": message,
        "products": products,
        "outfit": None,
        "subscription": None if subscription_already_shown else subscription_advice(member_id, user_is_shopping=True),
        "evidence": parsed.evidence() or ["已按推荐分数排序"],
        "handoff": None,
    }
