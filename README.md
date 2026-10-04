# 2026 양재브릿지 플리마켓

## 1.x.x — 한 매대 정적 원페이지

현재 버전은 **1.0.0**이다. 매대 사진 아래 상품명·가격을 표시하고, 상품을 터치하면 상세 설명 모달을 연다. 위치 안내도 같은 페이지에 표시한다. 로그인, DB 연결, 서버 API, 관리 화면은 사용하지 않는다.

매대·상품 데이터는 [`src/data/market.ts`](src/data/market.ts)에 직접 작성한다. 현재 상품과 가격은 **예시**이며 실제 판매 정보로 확정된 값이 아니다. 실제 내용으로 교체하고 `booth.is_sample`을 false로 바꾸면 미리보기 안내가 사라진다. 사진은 `public/`에 넣고 경로를 데이터에 지정한다. 데이터를 바꾼 뒤 다시 배포한다.

GitHub Pages에 배포하며 Secrets나 환경변수는 필요 없다. `.github/workflows/pages.yml`이 main push 시 테스트·빌드·배포한다. Settings → Pages → Source를 GitHub Actions로 설정한다. 비공개 저장소는 Pages 지원 요금제가 필요하며 저장소 공개 여부는 자동 변경하지 않는다.

## 개발

Node.js 24 이상과 npm을 사용한다. `.env.local`은 필요 없다.

```sh
npm ci
npm run dev
npm test
npm run build
```

클라우드에서 기본 npm 캐시에 쓸 수 없으면 `npm ci --cache /workspace/.npm-cache`를 사용한다. 저장소 하위 경로는 배포 워크플로우에서 자동 설정한다. 방문객은 배포 기본 주소로 접속하며 기존 로그인·관리 해시 경로는 원페이지로 이동한다.

상세 절차: [배포 워크플로우](docs/beta-workflow.md), [운영 안내](docs/operations.md).

## 2.x.x — 향후 기능

Supabase DB·Storage 연동, 로그인·업체 계정, 매대 편집, 상품 CRUD·사진 업로드는 2.x.x 범위다. `src/auth.tsx`, `src/pages/Vendor.tsx`, `src/lib/supabase.ts`, `supabase/`, 운영자 스크립트 및 `.env.example`은 향후 개발 참고용으로 보존한다. 현재 앱은 이 모듈들을 불러오지 않으며 배포에 Supabase 키를 사용하지 않는다. 관련 패키지도 추후 작업을 위해 유지하지만 현재 브라우저 번들에는 포함하지 않는다.

기존 원격 DB·Auth 설정은 변경하지 않았다. 과거 설계·검증 기록은 1.x.x 배포 요건이 아니며, DB 마이그레이션이나 계정 발급을 지금 실행할 필요가 없다. 2.x.x 도입 시 인증 설정과 권한 검증을 다시 준비한다.
