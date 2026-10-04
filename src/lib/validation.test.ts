import { describe, expect, it } from "vitest";
import {
  formatPrice,
  isOwnedImage,
  parsePrice,
  validateProduct,
  vendorEmail,
} from "./validation";

describe("업체 로그인 식별자", () => {
  it("공백과 대문자를 정규화하여 연락용이 아닌 내부 주소를 만든다", () =>
    expect(vendorEmail(" Booth_01 ")).toBe(
      "booth_01@vendors.yangjae-market.invalid",
    ));
  it.each(["ab", "a@b.com", "../vendor", "한글", "a".repeat(33), "a b"])(
    "허용하지 않는 아이디를 거부한다: %s",
    (id) => expect(() => vendorEmail(id)).toThrow(),
  );
});
describe("상품 입력", () => {
  it("빈 이름과 길이 초과를 거부한다", () => {
    expect(() => validateProduct("   ", "")).toThrow();
    expect(() => validateProduct("a".repeat(81), "")).toThrow();
    expect(() => validateProduct("도마", "a".repeat(1001))).toThrow();
  });
  it("입력 양 끝 공백만 정리한다", () =>
    expect(validateProduct(" 나무 도마 ", " 첫 줄\n둘째 줄 ")).toEqual({
      name: "나무 도마",
      description: "첫 줄\n둘째 줄",
    }));
});
describe("사진 정리 범위", () => {
  it("자기 매대의 업로드만 정리한다", () => {
    expect(isOwnedImage("booth-a/image.jpg", "booth-a")).toBe(true);
    expect(isOwnedImage("booth-b/image.jpg", "booth-a")).toBe(false);
    expect(isOwnedImage("/sample-images/booth-01.jpg", "booth-a")).toBe(false);
    expect(isOwnedImage("booth-a/../booth-b/image.jpg", "booth-a")).toBe(false);
    expect(isOwnedImage(null, "booth-a")).toBe(false);
  });
});

describe("상품 가격", () => {
  it("원 단위 정수와 0원, 미정 가격을 구분한다", () => {
    expect(parsePrice(" 12000 ")).toBe(12000);
    expect(parsePrice("0")).toBe(0);
    expect(parsePrice(" ")).toBeNull();
    expect(parsePrice("2147483647")).toBe(2147483647);
    expect(formatPrice(12000)).toBe("12,000원");
    expect(formatPrice(0)).toBe("0원");
    expect(formatPrice(null)).toBe("가격 문의");
    expect(formatPrice(undefined)).toBe("가격 문의");
  });
  it.each(["-1", "1.5", "1e3", "12,000", "abc", "2147483648"])(
    "잘못된 가격을 거부한다: %s",
    (value) => {
      expect(() => parsePrice(value)).toThrow();
    },
  );
});
