import { describe, expect, it } from "vitest";
import type { MarketProduct } from "../data/market";
import { groupByCategory, sortPrice } from "./products";

function product(
  id: string,
  category: string,
  price: number | null,
): MarketProduct {
  return {
    id,
    name: id,
    category,
    price,
    description: "",
    image_path: null,
  };
}

describe("sortPrice", () => {
  it("sorts products without a price last", () => {
    expect(sortPrice(product("x", "a", null))).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("groupByCategory", () => {
  it("groups by category, cheapest first, groups ordered by cheapest item", () => {
    const groups = groupByCategory([
      product("grinder", "grinders", 78000),
      product("triple", "herbs", 20000),
      product("shaker", "kitchen", 15000),
      product("single", "herbs", 10000),
      product("tealby", "herbs", 20000),
    ]);
    expect(groups.map((g) => g.category)).toEqual([
      "herbs",
      "kitchen",
      "grinders",
    ]);
    expect(groups[0].products.map((p) => p.id)).toEqual([
      "single",
      "triple",
      "tealby",
    ]);
  });
});
