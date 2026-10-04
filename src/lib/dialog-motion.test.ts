import { describe, expect, it } from "vitest";
import { expandFrame } from "./dialog-motion";

describe("expandFrame", () => {
  it("maps a same-shaped source with a plain move and scale", () => {
    const frame = expandFrame(
      { left: 0, top: 0, width: 100, height: 100 },
      { left: 50, top: 50, width: 200, height: 200 },
    );
    expect(frame.transform).toBe("translate(-100px, -100px) scale(0.5)");
    expect(frame.clipPath).toBe("inset(0px 0px)");
  });

  it("crops a taller target to a square source instead of stretching", () => {
    // Square card (160x160) growing into a 3:4 dialog photo (300x400).
    const frame = expandFrame(
      { left: 20, top: 500, width: 160, height: 160 },
      { left: 40, top: 100, width: 300, height: 400 },
    );
    // Scale by width; the extra height is clipped equally top and bottom.
    expect(frame.transform).toBe(`translate(-90px, 280px) scale(${160 / 300})`);
    expect(frame.clipPath).toBe("inset(50px 0px)");
  });
});
