import { randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { execFileSync } from "node:child_process";
import { adminClient } from "./admin-client.mjs";
import { normalizeLoginId, vendorEmail } from "../src/lib/validation.ts";

const { values } = parseArgs({ options: { "login-id": { type: "string" } } });
const loginId = normalizeLoginId(values["login-id"] || "");
const email = vendorEmail(loginId); // Validates the restricted ID alphabet before SQL interpolation.
let rows;
try {
  rows = JSON.parse(
    execFileSync(
      "npx",
      [
        "--yes",
        "supabase",
        "db",
        "query",
        "--linked",
        "--project-ref",
        process.env.SUPABASE_PROJECT_REF,
        `select v.user_id, v.booth_id, b.name as booth_name from private.vendor_accounts v join public.booths b on b.id=v.booth_id where v.login_id='${loginId}';`,
        "--output-format",
        "json",
      ],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    ),
  ).rows;
} catch {
  throw new Error(
    "Could not find the vendor account. Check the Supabase CLI connection.",
  );
}
if (!rows || rows.length !== 1)
  throw new Error("The vendor ID does not exist.");
const account = rows[0],
  admin = adminClient();
const user = await admin.auth.admin.getUserById(account.user_id);
if (user.error || user.data.user.email !== email)
  throw new Error(
    "The account identity does not match. No password was changed.",
  );
const password = randomBytes(18).toString("base64url");
const updated = await admin.auth.admin.updateUserById(account.user_id, {
  password,
});
if (updated.error) throw new Error("Could not change the password.");
mkdirSync(".local", { recursive: true, mode: 0o700 });
const path = resolve(".local", `vendor-${loginId}.json`);
writeFileSync(
  path,
  JSON.stringify(
    {
      loginId,
      password,
      boothId: account.booth_id,
      boothName: account.booth_name,
      loginPath: "/vendor/login",
    },
    null,
    2,
  ) + "\n",
  { mode: 0o600 },
);
console.log(
  JSON.stringify({
    reset: true,
    loginId,
    credentialsPath: path,
    passwordPrinted: false,
  }),
);
