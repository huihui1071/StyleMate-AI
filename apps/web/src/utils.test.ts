import { describe, expect, it } from "vitest";
import { formatCurrency, formatPercent, intentLabel } from "./utils";

describe("display helpers", () => {
  it("formats CNY without decimals", () => {
    expect(formatCurrency(19839)).toContain("19,839");
  });

  it("formats margin rates", () => {
    expect(formatPercent(0.558)).toContain("56");
  });

  it("maps B2B workflow intents", () => {
    expect(intentLabel("assortment")).toBe("组货方案");
    expect(intentLabel("unknown")).toBe("选款任务");
  });
});
