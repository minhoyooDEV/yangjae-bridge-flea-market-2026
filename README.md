# 2026 양재브릿지 플리마켓

## 한 매대 원페이지

현재 버전은 **2.0.0**이다. 변경할 때마다 버전을 올린다(새 기능·섹션은 minor, 문구·상품·사진·버그 수정은 patch). `package.json` 버전을 올리고 같은 커밋에 `vX.Y.Z` 태그를 단다.

- 1.0.0 (2026-10-04): 콜앤메이슨 매대 페이지 완성
- 1.1.0: `design/quiet-kitchen`의 톤·소재 섹션·Tom Hunt 영상 카드 반영
- 1.2.0: PostHog 방문 분석과 제작자 모드
- 1.3.0: 모달 열림 트랜지션(누른 사진이 커지며 열림, 내용은 뒤따라 스며듦, 닫힘은 제자리 페이드)
- 1.4.0: PostHog 오류 추적(처리되지 않은 예외)과 이벤트 구조화 로그
- 1.5.0: 매대 사진 확대 이벤트, 상품 상세 체류 시간 측정
- 2.0.0: 매대·브랜드·상품 데이터를 Supabase에서 읽음(내용과 화면은 1.5.0과 같음)

양재천 브릿지마켓 콜앤메이슨 매대를 찾은 현장 방문객이 QR로 열어 보는 원페이지다. 2.0.0부터 내용은 Supabase DB에서 읽는다. 로그인과 관리 화면은 아직 없다.

페이지 순서: 매대 전경 사진 → 플리마켓 기획상품(종류별로 묶고 싼 가격부터, 누르면 사진 넘기기·설명 상세 창) → 매대 위치 → 브랜드 히어로(Experts in Seasoning since 1919) → 1919년 연표 → 소재(WOOD·ACRYLIC·STEEL) → 브랜드 영상(YouTube, 누를 때 로드)과 Tom Hunt 요리 영상 시리즈 링크. 상단 로고는 공식 홈페이지를 새 창으로 연다.

### 데이터 (Supabase)

페이지는 Supabase 프로젝트 `sgxnccckhweykhautotb`의 `public.booths`(활성·비샘플 매대 중 `sort_order`가 가장 앞선 1개)와 그 매대의 `public.products`(`sort_order` 순)를 공개 키로 읽는다(`src/lib/market-data.ts`). 읽기는 기존 RLS의 공개 읽기 정책(활성 매대와 그 상품만)을 따른다. 불러오지 못하면 오류 안내와 다시 시도 버튼을 보여 주고 PostHog에 `market_load_failed`를 보낸다.

- `booths`: `market_name`, `name`, `description`, `location_text`, `image_path`, `is_sample`, 그리고 브랜드 콘텐츠 전체를 담은 `brand`(jsonb: 로고·히어로·연표·영상·소재·시리즈·공식몰 주소).
- `products`: `slug`(분석의 `product_id`), `name`, `category`, `price`, `description`, `image_path`, `gallery`(text[]), `sort_order`.
- 이미지 경로가 `/`로 시작하면 사이트에 함께 배포되는 `public/` 파일, 아니면 Storage `market-images` 버킷 파일이다. 현재 데이터는 모두 `/brand/...`다.

[`src/data/market.ts`](src/data/market.ts)는 화면 타입과 시드 원본이다. 내용을 고칠 때는 DB를 직접 고친다(Supabase 대시보드 Table Editor 또는 새 마이그레이션). 처음 데이터는 `node scripts/seed-sql.mjs`로 만든 `supabase/migrations/202610050002_seed_cole_and_mason.sql`이다. 마이그레이션 적용: `npx supabase db push --project-ref sgxnccckhweykhautotb`.

필드 규칙(1.x와 같음):

- `booth`: 매대 전경 사진(`image_path`), 위치 문구(`location_text`), 안내 문구. `is_sample`을 true로 두면 상품·가격이 예시라는 미리보기 안내가 표시된다(현재 false).
- `products`: 상품명·종류(`category`)·플리마켓 가격·설명·대표 사진(`image_path`)·추가 사진(`gallery`). 상품명은 모델명 없이 용도 기준으로, 카드에서 한 줄(320px 기준)에 들어가게 짓는다. 사이즈·색상 변형은 묶지 않고 각각 별도 상품으로 둔다. 정렬은 `src/lib/products.ts`가 자동으로 한다.
- `brand`: 로고·히어로·연표·영상 ID.

사진은 `public/brand/`(상품은 `public/brand/products/`)에 넣는다. 아이폰 HEIC는 회전을 픽셀에 적용하고 EXIF(위치·기기 정보)를 지운 JPEG(긴 변 1200px)로 바꿔 넣는다.

스타일은 `src/styles.css`의 디자인 시스템 클래스(`.section`, `.inverse`, `.display`, `.lede`, `.hint`, `.media`, `.button`, `.timeline`, `.carousel`, `.grid-2` 등)를 먼저 쓰고, 페이지 전용 `cm-*` 클래스는 공용 클래스로 표현할 수 없는 구성에만 쓴다.

### 방문 분석 (PostHog)

PostHog(US 클라우드)로 페이지뷰·웹 분석·세션 리플레이를 수집한다. 프로젝트 키는 코드에 두지 않고 저장소 시크릿 `POSTHOG_KEY`로 관리한다. 배포 워크플로가 빌드 때 `VITE_POSTHOG_KEY`로 넘기며, 값이 없으면 분석이 꺼진다(로컬 빌드 포함). 키를 바꿀 때는 `gh secret set POSTHOG_KEY`로 갱신하고 다시 배포한다. 로컬 개발(`pnpm dev`)은 이벤트를 보내지 않는다. 직접 보내는 이벤트: `product_viewed`(상품 상세 열기), `brand_film_played`, `series_opened`, `official_site_opened`(로고), `booth_photo_zoomed`(매대 전경 사진 크게 보기), `product_view_ended`(상품 상세를 닫거나 페이지를 떠날 때, `dwell_seconds`에 화면에 보인 초. 다른 탭에 가 있던 시간은 빼고 잰다). 1.4.0부터 처리되지 않은 예외와 Promise 거부를 Error Tracking으로 보내고(콘솔 오류는 제외, 분석 코드가 로드된 뒤부터), 위 이벤트를 같은 이름의 구조화 로그로도 남긴다(서비스 `yangjae-bridge-flea-market-web`, 버전은 `package.json`, 제작자 방문은 `is_creator=true`).

제작자 방문 구분: 내 휴대폰·PC에서 주소 끝에 `?creator=on`을 붙여 한 번 열면 그 브라우저가 기억한다. 이후 그 브라우저의 모든 이벤트에 `is_creator=true`가 붙고 세션 리플레이는 녹화하지 않으며, 헤더에 "제작자 모드" 표시가 보인다. 표시를 누르거나 `?creator=off`로 열면 해제된다. 브라우저 저장소를 지우면 다시 켜야 한다. PostHog에서 Settings → Project → Product analytics → "Filter out internal and test users"에 이벤트 속성 `is_creator` = `true`를 추가하면 인사이트·웹 분석에서 제작자 방문을 뺄 수 있다.

GitHub Pages에 배포하며, 시크릿은 분석용 `POSTHOG_KEY`와 데이터용 `SUPABASE_URL`·`SUPABASE_PUBLISHABLE_KEY`다(빌드 때 `VITE_*`로 전달). `.github/workflows/pages.yml`이 main push 시 테스트·빌드·배포한다. Settings → Pages → Source를 GitHub Actions로 설정한다. 비공개 저장소는 Pages 지원 요금제가 필요하며 저장소 공개 여부는 자동 변경하지 않는다.

## 개발

Node.js 24 이상과 pnpm을 사용한다(버전은 `package.json`의 `packageManager`, `corepack enable`로 활성화). 로컬 개발에는 `.env.local`에 `VITE_SUPABASE_URL`과 `VITE_SUPABASE_PUBLISHABLE_KEY`가 필요하다(`.env.example` 참고). 없으면 페이지가 오류 안내를 보여 준다.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
```

클라우드에서 기본 pnpm store에 쓸 수 없으면 `pnpm install --frozen-lockfile --store-dir /workspace/.pnpm-store`를 사용한다. 저장소 하위 경로는 배포 워크플로우에서 자동 설정한다. 방문객은 배포 기본 주소로 접속하며 기존 로그인·관리 해시 경로는 원페이지로 이동한다.

상세 절차: [배포 워크플로우](docs/beta-workflow.md), [운영 안내](docs/operations.md).

## 2.x.x — 다음 단계

2.0.0은 읽기 전환만 했다. 로그인·업체 계정, 매대 편집, 상품 CRUD·사진 업로드(Storage)는 이후 2.x 범위다. `src/auth.tsx`, `src/pages/Vendor.tsx`, `src/pages/Market.tsx`, `src/lib/images.ts`와 운영자 스크립트(`scripts/*.mjs`, `.env.local`의 `SUPABASE_PROJECT_REF`·`SUPABASE_URL`·`SUPABASE_SECRET_KEY` 사용)는 아직 라우트에 연결하지 않았다. 1.x의 Supabase 차단(`backend-access.ts`)은 2.0.0에서 제거했다.
