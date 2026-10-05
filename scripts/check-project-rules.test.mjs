import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkProjectRules } from "./check-project-rules.mjs";

const note =
  "# v1.7.0\n\n## 변경 사항\n규칙을 통합했습니다.\n\n## 검증\n자동 검사를 실행합니다.\n\n## 배포\nPR을 통해 배포합니다.\n";
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "project-rules-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "apps/web"), { recursive: true });
  await mkdir(join(root, "docs/releases"), { recursive: true });
  for (const path of ["AGENTS.md", "CLAUDE.md"])
    await writeFile(join(root, path), "Shared rules\n");
  for (const path of ["package.json", "apps/web/package.json"])
    await writeFile(join(root, path), JSON.stringify({ version: "1.7.0" }));
  await writeFile(join(root, "docs/releases/1.7.0.md"), note);
  return root;
}

test("accepts synchronized rules and the current release notes", async (t) => {
  assert.equal(await checkProjectRules(await fixture(t)), "1.7.0");
});
test("rejects a one-sided rule edit", async (t) => {
  const root = await fixture(t);
  await writeFile(join(root, "CLAUDE.md"), "Different rules\n");
  await assert.rejects(
    checkProjectRules(root),
    /must be nonempty and identical/,
  );
});
test("rejects a version bump with no new release note", async (t) => {
  const root = await fixture(t);
  for (const path of ["package.json", "apps/web/package.json"])
    await writeFile(join(root, path), JSON.stringify({ version: "1.8.0" }));
  await assert.rejects(checkProjectRules(root), /Missing release notes/);
});
test("rejects root and web version drift", async (t) => {
  const root = await fixture(t);
  await writeFile(
    join(root, "apps/web/package.json"),
    JSON.stringify({ version: "1.8.0" }),
  );
  await assert.rejects(checkProjectRules(root), /versions must match/);
});
test("rejects a release note copied with the old title", async (t) => {
  const root = await fixture(t);
  await writeFile(
    join(root, "docs/releases/1.7.0.md"),
    note.replace("# v1.7.0", "# v1.6.0"),
  );
  await assert.rejects(checkProjectRules(root), /must start with/);
});
test("rejects empty release note sections", async (t) => {
  const root = await fixture(t);
  await writeFile(
    join(root, "docs/releases/1.7.0.md"),
    note.replace("자동 검사를 실행합니다.", ""),
  );
  await assert.rejects(checkProjectRules(root), /nonempty section: 검증/);
});
