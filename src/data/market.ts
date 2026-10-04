// 1.x.x content source. Replace these examples with confirmed sale information.
// Images live under public/; paths are relative to that directory.
export interface MarketProduct {
  id: string;
  name: string;
  price: number | null;
  description: string;
  image_path: string | null;
}

export const booth = {
  name: "매대 01",
  booth_number: "01",
  description:
    "따뜻한 조명 아래, 일상에 작은 즐거움을 더하는 물건들을 만나보세요.",
  image_path: "/sample-images/booth-01.jpg",
  location_text: "계단 위 · 정확한 매대 위치는 준비 중이에요.",
  is_sample: true,
};

export const products: MarketProduct[] = [
  {
    id: "wooden-board",
    name: "나무 도마",
    price: 12000,
    description:
      "주방에 따뜻함을 더하는 나무 도마예요.\n예시 상품입니다. 실제 소재와 크기는 판매 정보 확정 후 안내할게요.",
    image_path: null,
  },
  {
    id: "mug",
    name: "머그컵",
    price: 8000,
    description:
      "매일의 차 한 잔과 함께하는 머그컵이에요.\n예시 상품입니다. 실제 색상과 용량은 판매 정보 확정 후 안내할게요.",
    image_path: null,
  },
  {
    id: "fabric-coaster",
    name: "패브릭 컵받침",
    price: 3000,
    description:
      "테이블에 작은 포인트가 되는 컵받침이에요.\n예시 상품입니다. 실제 소재와 구성은 판매 정보 확정 후 안내할게요.",
    image_path: null,
  },
];
