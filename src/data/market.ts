// 1.x.x content source. Replace these examples with confirmed sale information.
// Images live under public/; paths are relative to that directory.
export interface MarketProduct {
  id: string;
  name: string;
  price: number | null;
  description: string;
  image_path: string | null;
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
  image_path: null as string | null,
  location_text: "계단 위 · 정확한 매대 위치는 준비 중이에요.",
  is_sample: true,
};

export const products: MarketProduct[] = [
  {
    id: "london-set-beech",
    name: "런던 소금·후추 그라인더 세트 내추럴 비치",
    price: 82000,
    description:
      "2023년에 나온 런던 시리즈의 소금·후추 그라인더 한 쌍이에요. 밝은 너도밤나무 결이 식탁을 부드럽게 만들어 줘요.\n가격은 공식몰 판매가 기준 예시예요. 현장 가격은 매대에서 확인해 주세요.",
    image_path: "/brand/products/london-set-beech.jpg",
  },
  {
    id: "london-set-chocolate",
    name: "런던 소금·후추 그라인더 세트 다크 초콜릿",
    price: 82000,
    description:
      "런던 시리즈 소금·후추 그라인더 한 쌍을 짙은 초콜릿 색 나무로 만났어요. 선물 상자에 담겨 있어요.\n가격은 공식몰 판매가 기준 예시예요. 현장 가격은 매대에서 확인해 주세요.",
    image_path: "/brand/products/london-set-chocolate.jpg",
  },
  {
    id: "london-set-gloss-black",
    name: "런던 소금·후추 그라인더 세트 글로스 블랙",
    price: 98000,
    description:
      "광택 있는 블랙 마감의 런던 시리즈 소금·후추 그라인더 한 쌍이에요. 선물 상자에 담겨 있어요.\n가격은 공식몰 판매가 기준 예시예요. 현장 가격은 매대에서 확인해 주세요.",
    image_path: "/brand/products/london-set-gloss-black.jpg",
  },
  {
    id: "london-pepper-acrylic",
    name: "런던 후추 그라인더 아크릴",
    price: 44000,
    description:
      "안에 담긴 통후추가 보이는 투명 아크릴 런던 그라인더예요. 1975년 세계 최초로 아크릴 그라인더를 만든 콜앤메이슨의 대표 소재예요.\n가격은 공식몰 판매가 기준 예시예요. 현장 가격은 매대에서 확인해 주세요.",
    image_path: "/brand/products/london-pepper-acrylic.jpg",
  },
  {
    id: "kenton",
    name: "켄톤 소금·후추 겸용 그라인더",
    price: 33000,
    description:
      "소금과 후추 어느 쪽에도 쓸 수 있는 켄톤 그라인더예요. 처음 그라인더를 들이는 분께 권해요.\n가격은 공식몰 판매가 기준 예시예요. 현장 가격은 매대에서 확인해 주세요.",
    image_path: "/brand/products/kenton.jpg",
  },
  {
    id: "refill-funnel",
    name: "스테인리스 리필 퍼널",
    price: 16000,
    description:
      "그라인더에 통후추나 소금을 흘리지 않고 채우는 스테인리스 깔때기예요.\n가격은 공식몰 판매가 기준 예시예요. 현장 가격은 매대에서 확인해 주세요.",
    image_path: "/brand/products/refill-funnel.jpg",
  },
];
