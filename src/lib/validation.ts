export const LOGIN_ID_PATTERN = /^[a-z0-9][a-z0-9_-]{2,31}$/;
export function normalizeLoginId(value: string) {
  return value.trim().toLowerCase();
}
export function vendorEmail(value: string) {
  const id = normalizeLoginId(value);
  if (!LOGIN_ID_PATTERN.test(id))
    throw new Error(
      "아이디는 영문 소문자·숫자·밑줄·하이픈으로 3~32자 입력해 주세요.",
    );
  return `${id}@vendors.yangjae-market.invalid`;
}
export function validateProduct(name: string, description: string) {
  if (!name.trim() || name.trim().length > 80)
    throw new Error("상품 이름을 1~80자로 입력해 주세요.");
  if (description.trim().length > 1000)
    throw new Error("상품 설명은 1,000자까지 입력할 수 있어요.");
  return { name: name.trim(), description: description.trim() };
}
export function isOwnedImage(path: string | null, boothId: string) {
  return Boolean(
    path && path.startsWith(`${boothId}/`) && !path.includes(".."),
  );
}
