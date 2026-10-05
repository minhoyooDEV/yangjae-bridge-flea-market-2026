import { createClient } from "@supabase/supabase-js";
import { imageUrl as siteImageUrl } from "./public-image";

// Project URL and publishable key, injected at build time from the
// SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY repository secrets. Reads go through
// the public RLS policies, so the key only sees active booths and products.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const configured = Boolean(url && key);
export const supabase = createClient(
  url || "https://not-configured.supabase.co",
  key || "not-configured",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  },
);
export const BUCKET = "market-images";

// "/brand/..." files ship with the site; other paths live in Storage.
export function imageUrl(path: string | null | undefined) {
  if (!path) return undefined;
  if (path.startsWith("/")) return siteImageUrl(path);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export interface Booth {
  id: string;
  name: string;
  description: string;
  category: string;
  booth_number: string;
  location_text: string;
  image_path: string | null;
  thumbnail_path: string | null;
  sort_order: number;
  is_active: boolean;
  is_sample: boolean;
  product_names?: string[];
}
export interface Product {
  id: string;
  booth_id: string;
  name: string;
  description: string;
  price: number | null;
  image_path: string | null;
  thumbnail_path: string | null;
  sort_order: number;
}
