import type { Market, MarketBrand, MarketProduct } from "../data/market";

export interface BoothRow {
  id: string;
  market_name: string;
  name: string;
  booth_number: string;
  description: string;
  location_text: string;
  image_path: string | null;
  is_sample: boolean;
  brand: unknown;
}
export interface ProductRow {
  id: string;
  slug: string | null;
  name: string;
  category: string;
  price: number | null;
  description: string;
  image_path: string | null;
  gallery: string[] | null;
}

export const BOOTH_COLUMNS =
  "id, market_name, name, booth_number, description, location_text, image_path, is_sample, brand";
export const PRODUCT_COLUMNS =
  "id, slug, name, category, price, description, image_path, gallery";

// The brand block is free-form JSON in the database; refuse to render a page
// that is missing the parts the layout always needs.
function readBrand(value: unknown): MarketBrand {
  const brand = value as Partial<MarketBrand> | null;
  if (
    !brand ||
    typeof brand !== "object" ||
    !brand.logo_path ||
    !brand.website ||
    !Array.isArray(brand.story) ||
    !Array.isArray(brand.materials) ||
    !brand.video ||
    !brand.series
  )
    throw new Error("Booth brand content is incomplete.");
  return brand as MarketBrand;
}

export function toMarket(booth: BoothRow, rows: ProductRow[]): Market {
  return {
    booth: {
      market_name: booth.market_name,
      name: booth.name,
      booth_number: booth.booth_number,
      description: booth.description,
      image_path: booth.image_path,
      location_text: booth.location_text,
      is_sample: booth.is_sample,
    },
    brand: readBrand(booth.brand),
    products: rows.map((row): MarketProduct => ({
      // Analytics has used the slug as product_id since 1.2.0.
      id: row.slug ?? row.id,
      name: row.name,
      category: row.category,
      price: row.price,
      description: row.description,
      image_path: row.image_path,
      gallery: row.gallery ?? [],
    })),
  };
}
