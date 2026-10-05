import { describe, expect, it } from "vitest";
import { booth, brand, products } from "../data/market";
import { toMarket, type BoothRow, type ProductRow } from "./market-rows";

const boothRow: BoothRow = {
  id: "c01e0000-0000-4000-8000-000000000001",
  ...booth,
  brand: JSON.parse(JSON.stringify(brand)),
};
const productRows: ProductRow[] = products.map((product, index) => ({
  ...product,
  id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
  slug: product.id,
  gallery: product.gallery ?? [],
}));

describe("toMarket", () => {
  it("rebuilds the seed source from database rows", () => {
    const market = toMarket(boothRow, productRows);
    expect(market.booth).toEqual(booth);
    expect(market.brand).toEqual(brand);
    expect(market.products).toEqual(
      products.map((product) => ({
        ...product,
        gallery: product.gallery ?? [],
      })),
    );
  });

  it("falls back to the row id when a product has no slug", () => {
    const [row] = productRows;
    const market = toMarket(boothRow, [{ ...row, slug: null, gallery: null }]);
    expect(market.products[0].id).toBe(row.id);
    expect(market.products[0].gallery).toEqual([]);
  });

  it("rejects a booth without brand content", () => {
    expect(() => toMarket({ ...boothRow, brand: {} }, [])).toThrow(
      "incomplete",
    );
  });
});
