import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), "SUPABASE_");
  const url = env.SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key =
    env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "";
  let legacyPublic = false;
  if (key.startsWith("eyJ")) {
    try {
      legacyPublic =
        JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString())
          .role === "anon";
    } catch {
      /* Not a valid legacy public key. */
    }
  }
  if (key && !key.startsWith("sb_publishable_") && !legacyPublic)
    throw new Error(
      "Use a Supabase publishable key. Server keys must never enter the browser build.",
    );
  if (command === "build" && (!url || !key))
    throw new Error(
      "Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY before building.",
    );
  return {
    plugins: [react()],
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(url),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(key),
    },
  };
});
