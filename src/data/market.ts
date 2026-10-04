// 1.x.x content source. Replace these examples with confirmed sale information.
// Images live under public/; paths are relative to that directory.
export interface MarketProduct {
  id: string;
  name: string;
  price: number | null;
  description: string;
  image_path: string | null;
  // 상세 창에서 대표 사진 뒤에 이어 보여줄 사진들
  gallery?: string[];
}

export const brand = {
  name: "콜앤메이슨",
  name_en: "Cole & Mason",
  logo_path: "/brand/logo.jpg",
  hero_path: "/brand/hero.jpg",
  heritage_path: "/brand/since-1919.jpg",
  tagline: "Experts in Seasoning since 1919",
  intro:
    "1919년 영국 런던에서 시작한 시즈닝 브랜드예요. 100년 넘게 소금과 후추를 가는 일 하나에 집중해 왔어요.",
  story: [
    { year: 1919, text: "영국 런던에서 설립" },
    { year: 1946, text: "캡스턴 그라인더 출시" },
    { year: 1975, text: "세계 최초 아크릴 그라인더 출시" },
    { year: 1981, text: "소금·후추 듀얼 그라인딩 특허" },
    { year: 1986, text: "엘리자베스 여왕상 수상" },
    { year: 2001, text: "전동 그라인더 출시" },
    { year: 2010, text: "베스트셀러 더웬트 출시" },
    { year: 2019, text: "설립 100주년" },
    { year: 2023, text: "런던 시리즈 출시" },
  ],
  video: {
    youtube_id: "qTv2Q3abhH4",
    title: "Cole & Mason — Experts in Seasoning since 1919",
    poster_path: "/brand/video-poster.jpg",
  },
  website: "https://coleandmason.co.kr/",
};

export const booth = {
  market_name: "양재천 브릿지마켓",
  name: "콜앤메이슨",
  booth_number: "01",
  description:
    "그라인더를 직접 돌려 보고, 갓 간 후추 향을 맡아 보세요. 손에 맞는 그라인더를 함께 찾아 드려요.",
  // 실제 매대 사진: public/brand/에 넣고 "/brand/booth.jpg"처럼 지정. null이면 숨김.
  image_path: "/brand/booth.jpg" as string | null,
  location_text: "계단 위 · 정확한 매대 위치는 준비 중이에요.",
  is_sample: false,
};

export const products: MarketProduct[] = [
  {
    id: "cambourne-dressing-shaker",
    name: "캠번 샐러드 드레싱 쉐이커",
    price: 15000,
    description:
      "오일, 식초, 허브를 넣고 흔들기만 하면 드레싱이 완성돼요.\n뚜껑 전체를 열어 재료를 넣고, 위쪽 작은 입구로 따라요. 최대 300ml까지 눈금이 있어 레시피대로 맞추기 쉽고, 안쪽 블렌딩 디스크가 골고루 섞어 줘요.",
    image_path: "/brand/products/dressing-shaker-01.jpg",
    gallery: [
      "/brand/products/dressing-shaker-03.jpg",
      "/brand/products/dressing-shaker-02.jpg",
    ],
  },
  {
    id: "derwent-salt-pepper-brown",
    name: "더웬트 소금·후추 그라인더 세트 브라운",
    price: 78000,
    description:
      "콜앤메이슨 베스트셀러 더웬트의 소금·후추 그라인더 한 쌍이에요. 짙은 나무와 코퍼 링이 어우러진 브라운 색상으로, 선물 상자에 담겨 있어요.\nPrecision+ 분쇄 메커니즘으로 후추 향을 잘 살리고, 굵기를 굵게부터 곱게까지 조절해요. 윗부분을 쏙 빼서 쉽게 채울 수 있어요.",
    image_path: "/brand/products/salt-pepper-brown-01.jpg",
    gallery: [
      "/brand/products/salt-pepper-brown-03.jpg",
      "/brand/products/salt-pepper-brown-02.jpg",
    ],
  },
  {
    id: "derwent-salt-pepper-dark",
    name: "더웬트 소금·후추 그라인더 세트 다크",
    price: 78000,
    description:
      "콜앤메이슨 베스트셀러 더웬트의 소금·후추 그라인더 한 쌍이에요. 짙은 나무와 스테인리스 링이 어우러진 다크 색상으로, 선물 상자에 담겨 있어요.\nPrecision+ 분쇄 메커니즘으로 후추 향을 잘 살리고, 굵기를 굵게부터 곱게까지 조절해요. 윗부분을 쏙 빼서 쉽게 채울 수 있어요.",
    image_path: "/brand/products/salt-pepper-dark-01.jpg",
    gallery: [
      "/brand/products/salt-pepper-dark-03.jpg",
      "/brand/products/salt-pepper-dark-02.jpg",
    ],
  },
];
