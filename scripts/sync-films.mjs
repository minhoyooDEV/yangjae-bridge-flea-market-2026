import { copyFile, mkdir, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const filmFiles = [
  "herb-keeper-single.mp4",
  "herb-keeper-single-poster.png",
  "preview.html",
];
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export async function syncFilms({
  sourceDir = join(root, "packages/herb-film/assets"),
  targetDir = join(root, "apps/web/public/films"),
} = {}) {
  // Validate every input before touching the existing web assets.
  for (const name of filmFiles) {
    const input = join(sourceDir, name);
    const info = await stat(input).catch(() => null);
    if (!info?.isFile() || info.size === 0) {
      throw new Error(`Missing film asset: ${input}. Run pnpm film:render.`);
    }
  }
  await mkdir(targetDir, { recursive: true });
  for (const name of filmFiles) {
    await copyFile(join(sourceDir, name), join(targetDir, name));
  }
  return targetDir;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  console.log(`Film assets synced to ${await syncFilms()}`);
}
