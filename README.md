# 2026 양재브릿지 플리마켓

## 1.x.x — 한 매대 정적 원페이지

현재 버전은 **1.3.0**이다. 변경할 때마다 버전을 올린다(새 기능·섹션은 minor, 문구·상품·사진·버그 수정은 patch). `package.json` 버전을 올리고 같은 커밋에 `vX.Y.Z` 태그를 단다.

- 1.0.0 (2026-10-04): 콜앤메이슨 매대 페이지 완성
- 1.1.0: `design/quiet-kitchen`의 톤·소재 섹션·Tom Hunt 영상 카드 반영
- 1.2.0: PostHog 방문 분석과 제작자 모드
- 1.3.0: 모달 열림 트랜지션(누른 사진이 커지며 열림, 내용은 뒤따라 스며듦, 닫힘은 제자리 페이드) 양재천 브릿지마켓 콜앤메이슨 매대를 찾은 현장 방문객이 QR로 열어 보는 정적 원페이지다. 로그인, DB 연결, 서버 API, 관리 화면은 사용하지 않는다.

페이지 순서: 매대 전경 사진 → 플리마켓 기획상품(종류별로 묶고 싼 가격부터, 누르면 사진 넘기기·설명 상세 창) → 매대 위치 → 브랜드 히어로(Experts in Seasoning since 1919) → 1919년 연표 → 소재(WOOD·ACRYLIC·STEEL) → 브랜드 영상(YouTube, 누를 때 로드)과 Tom Hunt 요리 영상 시리즈 링크. 상단 로고는 공식 홈페이지를 새 창으로 연다.

모든 내용은 [`src/data/market.ts`](src/data/market.ts)에 직접 작성한다.

- `booth`: 매대 전경 사진(`image_path`), 위치 문구(`location_text`), 안내 문구. `is_sample`을 true로 두면 상품·가격이 예시라는 미리보기 안내가 표시된다(현재 false).
- `products`: 상품명·종류(`category`)·플리마켓 가격·설명·대표 사진(`image_path`)·추가 사진(`gallery`). 상품명은 모델명 없이 용도 기준으로, 카드에서 한 줄(320px 기준)에 들어가게 짓는다. 사이즈·색상 변형은 묶지 않고 각각 별도 상품으로 둔다. 정렬은 `src/lib/products.ts`가 자동으로 한다.
- `brand`: 로고·히어로·연표·영상 ID.

사진은 `public/brand/`(상품은 `public/brand/products/`)에 넣는다. 아이폰 HEIC는 회전을 픽셀에 적용하고 EXIF(위치·기기 정보)를 지운 JPEG(긴 변 1200px)로 바꿔 넣는다.

스타일은 `src/styles.css`의 디자인 시스템 클래스(`.section`, `.inverse`, `.display`, `.lede`, `.hint`, `.media`, `.button`, `.timeline`, `.carousel`, `.grid-2` 등)를 먼저 쓰고, 페이지 전용 `cm-*` 클래스는 공용 클래스로 표현할 수 없는 구성에만 쓴다.

### 방문 분석 (PostHog)

PostHog(US 클라우드)로 페이지뷰·웹 분석·세션 리플레이를 수집한다. 프로젝트 키는 코드에 두지 않고 저장소 시크릿 `POSTHOG_KEY`로 관리한다. 배포 워크플로가 빌드 때 `VITE_POSTHOG_KEY`로 넘기며, 값이 없으면 분석이 꺼진다(로컬 빌드 포함). 키를 바꿀 때는 `gh secret set POSTHOG_KEY`로 갱신하고 다시 배포한다. 로컬 개발(`pnpm dev`)은 이벤트를 보내지 않는다. 직접 보내는 이벤트: `product_viewed`(상품 상세 열기), `brand_film_played`, `series_opened`, `official_site_opened`(로고).

제작자 방문 구분: 내 휴대폰·PC에서 주소 끝에 `?creator=on`을 붙여 한 번 열면 그 브라우저가 기억한다. 이후 그 브라우저의 모든 이벤트에 `is_creator=true`가 붙고 세션 리플레이는 녹화하지 않으며, 헤더에 "제작자 모드" 표시가 보인다. 표시를 누르거나 `?creator=off`로 열면 해제된다. 브라우저 저장소를 지우면 다시 켜야 한다. PostHog에서 Settings → Project → Product analytics → "Filter out internal and test users"에 이벤트 속성 `is_creator` = `true`를 추가하면 인사이트·웹 분석에서 제작자 방문을 뺄 수 있다.

GitHub Pages에 배포하며, 필요한 시크릿은 분석용 `POSTHOG_KEY` 하나다. `.github/workflows/pages.yml`이 main push 시 테스트·빌드·배포한다. Settings → Pages → Source를 GitHub Actions로 설정한다. 비공개 저장소는 Pages 지원 요금제가 필요하며 저장소 공개 여부는 자동 변경하지 않는다.

## 개발

Node.js 24 이상과 pnpm을 사용한다(버전은 `package.json`의 `packageManager`, `corepack enable`로 활성화). `.env.local`은 필요 없다.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
```

클라우드에서 기본 pnpm store에 쓸 수 없으면 `pnpm install --frozen-lockfile --store-dir /workspace/.pnpm-store`를 사용한다. 저장소 하위 경로는 배포 워크플로우에서 자동 설정한다. 방문객은 배포 기본 주소로 접속하며 기존 로그인·관리 해시 경로는 원페이지로 이동한다.

상세 절차: [배포 워크플로우](docs/beta-workflow.md), [운영 안내](docs/operations.md).

## 2.x.x — 향후 기능

Supabase DB·Storage 연동, 로그인·업체 계정, 매대 편집, 상품 CRUD·사진 업로드는 2.x.x 범위다. `src/auth.tsx`, `src/pages/Vendor.tsx`, `src/lib/supabase.ts`, `supabase/`, 운영자 스크립트 및 `.env.example`은 향후 개발 참고용으로 보존한다. 현재 앱은 이 모듈들을 불러오지 않으며 배포에 Supabase 키를 사용하지 않는다. 관련 패키지도 추후 작업을 위해 유지하지만 현재 브라우저 번들에는 포함하지 않는다.

기존 원격 DB·Auth 설정은 변경하지 않았다. 과거 설계·검증 기록은 1.x.x 배포 요건이 아니며, DB 마이그레이션이나 계정 발급을 지금 실행할 필요가 없다. 2.x.x 도입 시 인증 설정과 권한 검증을 다시 준비한다.

Supabase 클라이언트와 운영자 스크립트는 1.x.x에서 import 시 명시적인 오류로 중단한다. 환경변수로 우회할 수 없으며 연결 설정 자체도 2.x.x에서 시작한다. 기존 클라우드 설정에 남은 Supabase 항목은 1.x.x에 필요하지 않다.
