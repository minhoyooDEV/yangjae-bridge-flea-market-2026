import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export async function checkProjectRules(root = projectRoot) {
  const read = (path) => readFile(join(root, path), "utf8");
  const [agents, claude, rootJson, webJson] = await Promise.all([
    read("AGENTS.md"),
    read("CLAUDE.md"),
    read("package.json"),
    read("apps/web/package.json"),
  ]);
  if (!agents.trim() || agents !== claude) {
    throw new Error("AGENTS.md and CLAUDE.md must be nonempty and identical.");
  }
  const { version } = JSON.parse(rootJson);
  if (!/^\d+\.\d+\.\d+$/.test(version ?? "")) {
    throw new Error("The release version must have the form X.Y.Z.");
  }
  if (version !== JSON.parse(webJson).version) {
    throw new Error("Root and web package versions must match.");
  }
  const notePath = `docs/releases/${version}.md`;
  const note = await read(notePath).catch(() => {
    throw new Error(`Missing release notes: ${notePath}`);
  });
  if (note.split(/\r?\n/)[0] !== `# v${version}`) {
    throw new Error(`Release notes must start with # v${version}`);
  }
  for (const heading of ["변경 사항", "검증", "배포"]) {
    const section = note.match(
      new RegExp(
        `^## ${heading}\\r?\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`,
        "m",
      ),
    );
    if (!section || !section[1].trim()) {
      throw new Error(`Release notes need a nonempty section: ${heading}`);
    }
  }
  return version;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    console.log(
      `Project rules and release notes verified: v${await checkProjectRules()}`,
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
