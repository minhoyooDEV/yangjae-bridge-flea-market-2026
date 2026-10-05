import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { filmFiles, syncFilms } from "./sync-films.mjs";

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "film-sync-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const sourceDir = join(root, "assets");
  const targetDir = join(root, "web", "public", "films");
  await mkdir(sourceDir);
  for (const name of filmFiles) await writeFile(join(sourceDir, name), name);
  return { sourceDir, targetDir };
}

test("copies published film assets and refreshes changed content", async (t) => {
  const paths = await fixture(t);
  await syncFilms(paths);
  for (const name of filmFiles) {
    assert.equal(await readFile(join(paths.targetDir, name), "utf8"), name);
  }
  await writeFile(join(paths.sourceDir, filmFiles[0]), "new render");
  await syncFilms(paths);
  assert.equal(
    await readFile(join(paths.targetDir, filmFiles[0]), "utf8"),
    "new render",
  );
});

test("missing or empty input leaves the last web copy intact", async (t) => {
  const paths = await fixture(t);
  await syncFilms(paths);
  await writeFile(join(paths.sourceDir, filmFiles[0]), "new render");
  await writeFile(join(paths.sourceDir, filmFiles[1]), "");
  await assert.rejects(syncFilms(paths), /Missing film asset/);
  assert.equal(
    await readFile(join(paths.targetDir, filmFiles[0]), "utf8"),
    filmFiles[0],
  );
  await rm(join(paths.sourceDir, filmFiles[1]));
  await assert.rejects(syncFilms(paths), /Missing film asset/);
});
