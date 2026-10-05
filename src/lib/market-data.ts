import type { Market } from "../data/market";
import {
  BOOTH_COLUMNS,
  PRODUCT_COLUMNS,
  toMarket,
  type BoothRow,
  type ProductRow,
} from "./market-rows";
import { configured, supabase } from "./supabase";

// The page shows the first active, non-sample booth and its products.
export async function loadMarket(): Promise<Market> {
  if (!configured) throw new Error("Supabase is not configured.");
  const { data: booth, error: boothError } = await supabase
    .from("booths")
    .select(BOOTH_COLUMNS)
    .eq("is_active", true)
    .eq("is_sample", false)
    .order("sort_order")
    .limit(1)
    .maybeSingle<BoothRow>();
  if (boothError) throw boothError;
  if (!booth) throw new Error("No active booth.");
  const { data: products, error: productError } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("booth_id", booth.id)
    .order("sort_order")
    .returns<ProductRow[]>();
  if (productError) throw productError;
  return toMarket(booth, products ?? []);
}
