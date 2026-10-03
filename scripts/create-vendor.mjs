import { randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { adminClient } from "./admin-client.mjs";
import { normalizeLoginId, vendorEmail } from "../src/lib/validation.ts";

const { values } = parseArgs({
  options: { "login-id": { type: "string" }, "booth-id": { type: "string" } },
});
const loginId = normalizeLoginId(values["login-id"] || "");
const email = vendorEmail(loginId);
const boothId = values["booth-id"];
if (!boothId || !/^[0-9a-f-]{36}$/i.test(boothId))
  throw new Error("Provide --booth-id with the existing booth UUID.");
const credentialsPath = resolve(".local", `vendor-${loginId}.json`);
if (existsSync(credentialsPath))
  throw new Error(
    "A credential file already exists for this ID. It will not be overwritten.",
  );
const admin = adminClient();
const { data: booth, error: boothError } = await admin
  .from("booths")
  .select("id,name")
  .eq("id", boothId)
  .single();
if (boothError)
  throw new Error(
    "The booth does not exist. Register it in the database first.",
  );
const password = randomBytes(18).toString("base64url");
const { data, error } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});
if (error || !data.user)
  throw new Error(
    "Account creation failed. Check whether this ID is already registered.",
  );
const assignment = await admin.rpc("assign_vendor_account", {
  vendor_user_id: data.user.id,
  target_booth_id: boothId,
  vendor_login_id: loginId,
});
if (assignment.error) {
  const rollback = await admin.auth.admin.deleteUser(data.user.id);
  throw new Error(
    rollback.error
      ? "Assignment failed; ask the operator to remove the newly created unassigned Auth account."
      : "Assignment failed. The newly created account was removed. Check whether the booth already has an account.",
  );
}
mkdirSync(".local", { recursive: true, mode: 0o700 });
writeFileSync(
  credentialsPath,
  JSON.stringify(
    {
      loginId,
      password,
      boothId,
      boothName: booth.name,
      loginPath: "/vendor/login",
    },
    null,
    2,
  ) + "\n",
  { mode: 0o600, flag: "wx" },
);
console.log(
  JSON.stringify({
    created: true,
    loginId,
    booth: booth.name,
    credentialsPath,
    passwordPrinted: false,
  }),
);
