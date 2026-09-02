import { describe, expect, it } from "vitest";
import { formatCurrency, intentLabel } from "./utils";

describe("display helpers", () => {
  it("formats CNY without decimals", () => {
    expect(formatCurrency(1390)).toContain("1,390");
  });

  it("maps known intents", () => {
    expect(intentLabel("outfit")).toBe("搭配顾问");
    expect(intentLabel("unknown")).toBe("导购任务");
  });
});
