import { requireBackendAccess } from "../src/lib/backend-access.ts";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

requireBackendAccess();

export function adminClient() {
  const ref = process.env.SUPABASE_PROJECT_REF;
  const url = process.env.SUPABASE_URL;
  if (!ref || !url || !/^[a-z]{20}$/.test(ref))
    throw new Error(
      "Supabase project settings are missing. Load .env.local first.",
    );
  if (
    ![
      "https://" + ref + ".supabase.co",
      "https://" + ref + ".supabase.co/",
    ].includes(url)
  )
    throw new Error(
      "The admin endpoint must match the selected Supabase project.",
    );
  let key = process.env.SUPABASE_SECRET_KEY;
  if (!key) {
    let result;
    try {
      result = JSON.parse(
        execFileSync(
          "npx",
          [
            "--yes",
            "supabase",
            "projects",
            "api-keys",
            "--project-ref",
            ref,
            "--reveal",
            "--output",
            "json",
            "--output-format",
            "json",
          ],
          { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
        ),
      );
    } catch {
      throw new Error(
        "Could not read the admin key. Sign in to the Supabase CLI. Key output is intentionally omitted.",
      );
    }
    const candidates = [];
    function visit(value) {
      if (!value || typeof value !== "object") return;
      if (typeof value.api_key === "string")
        candidates.push({ key: value.api_key, name: value.name });
      if (typeof value.key === "string")
        candidates.push({ key: value.key, name: value.name });
      for (const child of Object.values(value))
        if (child && typeof child === "object") visit(child);
    }
    visit(result);
    key =
      candidates.find((c) => c.key.startsWith("sb_secret_"))?.key ||
      candidates.find(
        (c) => c.name === "service_role" && c.key.startsWith("eyJ"),
      )?.key;
  }
  if (!key)
    throw new Error(
      "No server key is available. Never use a server key in the browser.",
    );
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
