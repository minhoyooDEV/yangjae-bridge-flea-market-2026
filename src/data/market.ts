// 1.x.x content source. Replace these examples with confirmed sale information.
// Images live under public/; paths are relative to that directory.
export interface MarketProduct {
  id: string;
  name: string;
  // 종류. 같은 종류끼리 묶어 보여준다.
  category: string;
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
    name: "드레싱 쉐이커",
    category: "주방 도구",
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
    name: "그라인더 세트 브라운",
    category: "소금·후추 그라인더",
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
    name: "그라인더 세트 다크",
    category: "소금·후추 그라인더",
    price: 78000,
    description:
      "콜앤메이슨 베스트셀러 더웬트의 소금·후추 그라인더 한 쌍이에요. 짙은 나무와 스테인리스 링이 어우러진 다크 색상으로, 선물 상자에 담겨 있어요.\nPrecision+ 분쇄 메커니즘으로 후추 향을 잘 살리고, 굵기를 굵게부터 곱게까지 조절해요. 윗부분을 쏙 빼서 쉽게 채울 수 있어요.",
    image_path: "/brand/products/salt-pepper-dark-01.jpg",
    gallery: [
      "/brand/products/salt-pepper-dark-03.jpg",
      "/brand/products/salt-pepper-dark-02.jpg",
    ],
  },
  {
    id: "acacia-board-s",
    name: "아카시아 원목 도마 소",
    category: "주방 도구",
    price: 15000,
    description:
      "결이 살아 있는 아카시아 원목 도마예요. 소·중·대 세 가지 크기 중 소 사이즈예요.\n손잡이가 있어 들고 옮기기 편하고, 겹쳐 두거나 세워 두거나 걸어서 보관할 수 있어요.",
    image_path: "/brand/products/acacia-board-s-01.jpg",
    gallery: [
      "/brand/products/acacia-board-s-02.jpg",
      "/brand/products/acacia-board-all.jpg",
    ],
  },
  {
    id: "acacia-board-m",
    name: "아카시아 원목 도마 중",
    category: "주방 도구",
    price: 25000,
    description:
      "결이 살아 있는 아카시아 원목 도마예요. 소·중·대 세 가지 크기 중 중 사이즈예요.\n손잡이가 있어 들고 옮기기 편하고, 겹쳐 두거나 세워 두거나 걸어서 보관할 수 있어요.",
    image_path: "/brand/products/acacia-board-m-01.jpg",
    gallery: ["/brand/products/acacia-board-all.jpg"],
  },
  {
    id: "acacia-board-l",
    name: "아카시아 원목 도마 대",
    category: "주방 도구",
    price: 35000,
    description:
      "결이 살아 있는 아카시아 원목 도마예요. 소·중·대 세 가지 크기 중 대 사이즈예요.\n손잡이가 있어 들고 옮기기 편하고, 겹쳐 두거나 세워 두거나 걸어서 보관할 수 있어요.",
    image_path: "/brand/products/acacia-board-l-01.jpg",
    gallery: ["/brand/products/acacia-board-all.jpg"],
  },
  {
    id: "tealby-cut-herb-keeper",
    name: "컷 허브 키퍼",
    category: "허브 키퍼",
    price: 20000,
    description:
      "자른 허브와 채소를 싱싱하게 보관하는 키퍼예요. 받침에 물을 채워 냉장고에 넣어 두면 더 오래 신선해요.\n일반 냉장고 문칸에 쏙 들어가고, 칸막이가 있어 여러 허브를 나눠 담을 수 있어요.",
    image_path: "/brand/products/cut-herb-keeper-01.jpg",
    gallery: [
      "/brand/products/cut-herb-keeper-02.jpg",
      "/brand/products/cut-herb-keeper-03.jpg",
    ],
  },
  {
    id: "burwell-herb-keeper-triple",
    name: "자동급수 허브 키퍼 3구",
    category: "허브 키퍼",
    price: 20000,
    description:
      "허브 화분 세 개를 나란히 키우는 셀프워터링 키퍼예요. 펠트 패드가 물을 끌어올려 허브가 마르지 않게 지켜 줘요.\n물을 너무 많이 주거나 적게 주는 걸 막아 주고, 동그란 화분이든 네모난 화분이든 그대로 넣으면 돼서 옮겨 심을 필요가 없어요.",
    image_path: "/brand/products/herb-keeper-3-01.jpg",
    gallery: [
      "/brand/products/herb-keeper-3-02.jpg",
      "/brand/products/herb-keeper-3-03.jpg",
    ],
  },
  {
    id: "burwell-herb-keeper-single",
    name: "자동급수 허브 키퍼 1구",
    category: "허브 키퍼",
    price: 10000,
    description:
      "허브 화분 하나를 키우는 셀프워터링 키퍼예요. 펠트 패드가 물을 끌어올려 허브가 마르지 않게 지켜 줘요.\n물을 너무 많이 주거나 적게 주는 걸 막아 주고, 동그란 화분이든 네모난 화분이든 그대로 넣으면 돼서 옮겨 심을 필요가 없어요.",
    image_path: "/brand/products/herb-keeper-1-01.jpg",
    gallery: [
      "/brand/products/herb-keeper-1-02.jpg",
      "/brand/products/herb-keeper-1-03.jpg",
    ],
  },
];
