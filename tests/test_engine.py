import unittest
from pathlib import Path

from apps.api.engine import PRODUCTS, build_outfit, handle_request, parse_query, search_products, subscription_advice


class RecommendationEngineTests(unittest.TestCase):
    def test_every_product_has_a_local_real_image(self):
        project_root = Path(__file__).resolve().parents[1]
        self.assertEqual(len(PRODUCTS), 24)
        for product in PRODUCTS:
            image_path = product.get("image", "")
            self.assertTrue(image_path.startswith("/images/products/"))
            self.assertTrue((project_root / "apps/web/public" / image_path.lstrip("/")).is_file())

    def test_parses_compound_hard_filters(self):
        parsed = parse_query("想找春季通勤的灰色宽松外套，预算1500元以内")
        self.assertEqual(parsed.category, "外套")
        self.assertEqual(parsed.color, "灰")
        self.assertEqual(parsed.fit, "宽松")
        self.assertEqual(parsed.season, "春")
        self.assertEqual(parsed.price_max, 1500)
        self.assertIn("通勤", parsed.styles)

    def test_all_results_respect_hard_filters(self):
        result = search_products("春季灰色宽松外套，预算1500元以内", "M-DEMO-01")
        self.assertGreater(len(result["products"]), 0)
        self.assertLessEqual(len(result["products"]), 8)
        for product in result["products"]:
            self.assertEqual(product["category"], "外套")
            self.assertEqual(product["color_family"], "灰")
            self.assertEqual(product["fit"], "宽松")
            self.assertEqual(product["season"], "春")
            self.assertLessEqual(product["price"], 1500)

    def test_no_match_does_not_relax_constraints(self):
        result = handle_request("冬季粉色亚麻外套，预算300元以内", "M-DEMO-01")
        self.assertEqual(result["products"], [])
        self.assertIn("不会擅自放宽", result["message"])

    def test_outfit_uses_requested_anchor_and_budget(self):
        outfit = build_outfit("用SKU-DEMO-010搭一套，预算3000元以内", "M-DEMO-03")
        self.assertEqual(outfit["items"][0]["sku"], "SKU-DEMO-010")
        self.assertLessEqual(outfit["total_price"], 3000)
        self.assertGreaterEqual(len(outfit["items"]), 2)

    def test_member_subscription_rules_are_deterministic(self):
        eligible = subscription_advice("M-DEMO-01")
        self.assertEqual(eligible["type"], "eligible")
        subscribed = subscription_advice("M-DEMO-02")
        self.assertEqual(subscribed["type"], "member_notice")
        self.assertTrue(any("4,050" in message for message in subscribed["messages"]))

    def test_same_request_is_personalized(self):
        first = search_products("春季外套", "M-DEMO-01")["products"]
        second = search_products("春季外套", "M-DEMO-03")["products"]
        self.assertNotEqual([item["sku"] for item in first[:3]], [item["sku"] for item in second[:3]])

    def test_transaction_request_hands_off(self):
        result = handle_request("帮我取消订阅并退款", "M-DEMO-02")
        self.assertEqual(result["intent"], "handoff")
        self.assertIsNotNone(result["handoff"])

    def test_subscription_can_be_suppressed_after_first_display(self):
        result = handle_request(
            "推荐一件春季外套",
            "M-DEMO-01",
            subscription_already_shown=True,
        )
        self.assertIsNone(result["subscription"])


if __name__ == "__main__":
    unittest.main()
