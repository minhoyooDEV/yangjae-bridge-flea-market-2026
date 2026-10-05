import { describe, expect, it } from "vitest";
import { createDwellTimer, toSeconds } from "./dwell";

function clock(start = 0) {
  let time = start;
  return { now: () => time, advance: (ms: number) => (time += ms) };
}

describe("createDwellTimer", () => {
  it("counts time from creation until stop", () => {
    const c = clock();
    const timer = createDwellTimer(c.now);
    c.advance(4200);
    expect(timer.stop()).toBe(4200);
  });

  it("skips time while paused", () => {
    const c = clock();
    const timer = createDwellTimer(c.now);
    c.advance(1000);
    timer.pause();
    c.advance(60_000);
    timer.resume();
    c.advance(500);
    expect(timer.stop()).toBe(1500);
  });

  it("ignores repeated pause and resume", () => {
    const c = clock();
    const timer = createDwellTimer(c.now);
    c.advance(1000);
    timer.pause();
    timer.pause();
    c.advance(1000);
    timer.resume();
    timer.resume();
    c.advance(1000);
    expect(timer.stop()).toBe(2000);
  });

  it("does not count after stop", () => {
    const c = clock();
    const timer = createDwellTimer(c.now);
    c.advance(1000);
    expect(timer.stop()).toBe(1000);
    c.advance(5000);
    expect(timer.stop()).toBe(1000);
  });
});

describe("toSeconds", () => {
  it("rounds to one decimal place", () => {
    expect(toSeconds(4249)).toBe(4.2);
    expect(toSeconds(4250)).toBe(4.3);
    expect(toSeconds(0)).toBe(0);
  });
});
