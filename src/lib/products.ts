import type { MarketProduct } from "../data/market";

export interface ProductGroup {
  category: string;
  products: MarketProduct[];
}

// Lowest price a visitor can pay; products without a price sort last.
export function lowestPrice(product: MarketProduct) {
  if (product.options?.length)
    return Math.min(...product.options.map((option) => option.price));
  return product.price ?? Number.POSITIVE_INFINITY;
}

// Groups products by category, cheapest first inside each group, and orders
// the groups by their cheapest product. Ties keep the data order.
export function groupByCategory(products: MarketProduct[]): ProductGroup[] {
  const groups = new Map<string, MarketProduct[]>();
  for (const product of products) {
    const group = groups.get(product.category) ?? [];
    group.push(product);
    groups.set(product.category, group);
  }
  return [...groups.entries()]
    .map(([category, items]) => ({
      category,
      products: [...items].sort((a, b) => lowestPrice(a) - lowestPrice(b)),
    }))
    .sort((a, b) => lowestPrice(a.products[0]) - lowestPrice(b.products[0]));
}
