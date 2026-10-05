import { expect, it, vi } from "vitest";

it("blocks the legacy client before network access", async () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  try {
    await expect(import("./supabase")).rejects.toThrow(
      "Supabase is disabled in 1.x.x",
    );
    expect(fetch).not.toHaveBeenCalled();
  } finally {
    vi.unstubAllGlobals();
  }
});
