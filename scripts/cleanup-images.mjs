import { adminClient } from "./admin-client.mjs";

// Explicit --apply removes only unreferenced uploads older than 24 hours.
const apply = process.argv.includes("--apply");
const admin = adminClient();
const referenced = new Set();
for (const table of ["booths", "products"]) {
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await admin
      .from(table)
      .select("id,image_path,thumbnail_path")
      .order("id")
      .range(offset, offset + 499);
    if (error)
      throw new Error(`Could not read ${table}; no files were removed.`);
    for (const row of data)
      for (const path of [row.image_path, row.thumbnail_path])
        if (path) referenced.add(path);
    if (data.length < 500) break;
  }
}
const candidates = [];
async function list(prefix = "") {
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await admin.storage
      .from("market-images")
      .list(prefix, {
        limit: 100,
        offset,
        sortBy: { column: "name", order: "asc" },
      });
    if (error) throw new Error("Could not list images; no files were removed.");
    for (const object of data) {
      const path = prefix ? `${prefix}/${object.name}` : object.name;
      if (!object.id) {
        await list(path);
        continue;
      }
      if (
        !referenced.has(path) &&
        new Date(object.created_at).getTime() < Date.now() - 86400000
      )
        candidates.push(path);
    }
    if (data.length < 100) break;
  }
}
await list();
if (apply && candidates.length) {
  const { error } = await admin.storage
    .from("market-images")
    .remove(candidates);
  if (error)
    throw new Error("Image cleanup failed. Retry after checking Storage.");
}
console.log(
  JSON.stringify({
    mode: apply ? "apply" : "dry-run",
    unreferencedOlderThan24Hours: candidates.length,
    paths: candidates,
  }),
);
