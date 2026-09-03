import unittest
from pathlib import Path

from apps.api.engine import MERCHANTS, PRODUCTS, build_assortment, handle_request, parse_query, search_products


class AssortmentEngineTests(unittest.TestCase):
    def test_catalog_has_at_least_200_local_real_images(self):
        project_root = Path(__file__).resolve().parents[1]
        self.assertGreaterEqual(len(PRODUCTS), 200)
        self.assertEqual(len({product["sku"] for product in PRODUCTS}), len(PRODUCTS))
        for product in PRODUCTS:
            image_path = product.get("image", "")
            self.assertTrue(image_path.startswith("/images/products/SKU-DEMO-"))
            self.assertTrue((project_root / "apps/web/public" / image_path.lstrip("/")).is_file())

    def test_catalog_contains_required_b2b_fields(self):
        required = {
            "wholesale_price", "suggested_retail_price", "margin_rate", "stock", "moq",
            "lead_time_days", "channels", "risk_level", "audience", "department",
        }
        for product in PRODUCTS:
            self.assertTrue(required.issubset(product))
            self.assertGreaterEqual(product["stock"], product["moq"])
            self.assertGreater(product["suggested_retail_price"], product["wholesale_price"])

    def test_parses_business_request_without_treating_age_as_price(self):
        parsed = parse_query("淘宝女装，客群25到35岁，零售价300-700元，选12款春季通勤新品，采购预算3万")
        self.assertEqual(parsed.platform, "淘宝")
        self.assertEqual(parsed.audience, "女装")
        self.assertEqual(parsed.retail_min, 300)
        self.assertEqual(parsed.retail_max, 700)
        self.assertEqual(parsed.target_count, 12)
        self.assertEqual(parsed.procurement_budget, 30000)
        self.assertEqual(parsed.season, "春")
        self.assertIn("通勤", parsed.styles)

    def test_all_results_respect_hard_constraints_and_merchant_profile(self):
        result = search_products("女装春季上装，零售价300-700元，起订量不超过4件", "MERCHANT-DEMO-01")
        self.assertGreater(result["total"], 0)
        for product in result["products"]:
            self.assertEqual(product["audience"], "女装")
            self.assertEqual(product["season"], "春")
            self.assertEqual(product["department"], "上装")
            self.assertLessEqual(product["moq"], 4)
            self.assertGreaterEqual(product["suggested_retail_price"], 300)
            self.assertLessEqual(product["suggested_retail_price"], 700)
            self.assertIn("淘宝", product["channels"])

    def test_no_match_does_not_relax_constraints(self):
        result = handle_request("冬季紫色真丝套装，零售价200元以内", "MERCHANT-DEMO-01")
        self.assertEqual(result["products"], [])
        self.assertIn("不会自动放宽", result["message"])

    def test_assortment_has_roles_and_stays_in_budget(self):
        query = "淘宝女装，零售价300-700元，选12款春季新品，首批采购预算3万"
        assortment = build_assortment(query, "MERCHANT-DEMO-01")
        summary = assortment["summary"]
        self.assertEqual(summary["style_count"], 12)
        self.assertLessEqual(summary["total_cost"], 30000)
        self.assertEqual(
            set(summary["role_counts"]),
            {"主销款", "引流款", "形象款", "连带款", "测试款"},
        )

    def test_assortment_quantities_respect_moq_and_stock(self):
        assortment = build_assortment("女装春季上新，采购预算3万", "MERCHANT-DEMO-01")
        for item in assortment["items"]:
            self.assertGreaterEqual(item["recommended_quantity"], item["moq"])
            self.assertLessEqual(item["recommended_quantity"], item["stock"])
            self.assertEqual(item["recommended_quantity"] % item["moq"], 0)
            self.assertEqual(item["line_total"], item["recommended_quantity"] * item["net_unit_cost"])

    def test_merchant_profile_changes_candidate_set(self):
        first = search_products("春季上装", "MERCHANT-DEMO-01")
        second = search_products("春季上装", "MERCHANT-DEMO-03")
        self.assertNotEqual([item["sku"] for item in first["products"]], [item["sku"] for item in second["products"]])

    def test_account_policy_uses_selected_merchant(self):
        result = handle_request("查看拿货政策和样衣额度", "MERCHANT-DEMO-03", "account")
        self.assertEqual(result["intent"], "account")
        self.assertEqual(result["merchant"]["name"], "留白买手店")
        self.assertEqual(result["merchant"]["sample_quota"], 10)

    def test_transaction_request_creates_sales_handoff(self):
        result = handle_request("请联系销售确认实时库存并锁货", "MERCHANT-DEMO-01")
        self.assertEqual(result["intent"], "handoff")
        self.assertEqual(result["handoff"]["owner"], "销售顾问 A")
        self.assertIn("未执行", result["evidence"][1])

    def test_demo_has_four_merchant_profiles(self):
        self.assertEqual(len(MERCHANTS), 4)


if __name__ == "__main__":
    unittest.main()
