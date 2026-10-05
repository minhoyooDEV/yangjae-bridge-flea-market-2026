/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: `${(process.env.PAGES_BASE_PATH || "").replace(/\/$/, "")}/`,
  plugins: [react()],
  // One .env.local at the repo root, shared with the operator scripts.
  envDir: "../..",
  // Worktrees under .claude/ hold full copies of the repo; skip their tests.
  test: { exclude: [...configDefaults.exclude, ".claude/**"] },
});
