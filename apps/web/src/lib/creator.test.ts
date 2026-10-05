import { describe, expect, it } from "vitest";
import { decideCreator } from "./creator";

describe("decideCreator", () => {
  it("turns creator mode on and remembers it", () => {
    expect(decideCreator("?creator=on", null)).toEqual({
      creator: true,
      store: "1",
    });
  });

  it("turns creator mode off and forgets it", () => {
    expect(decideCreator("?creator=off", "1")).toEqual({
      creator: false,
      store: null,
    });
  });

  it("keeps the remembered choice when the URL says nothing", () => {
    expect(decideCreator("", "1")).toEqual({ creator: true });
    expect(decideCreator("?utm_source=qr", null)).toEqual({ creator: false });
  });

  it("ignores unknown values", () => {
    expect(decideCreator("?creator=yes", null)).toEqual({ creator: false });
  });
});
