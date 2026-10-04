# 로컬 Codex 인계 — 1.0.0 라이브 배포

작성일: 2026-10-04 (Asia/Seoul). 이 문서의 상태는 작성 당시 관측이며, 작업 시작 시 최신 Actions 결과를 먼저 확인한다.

## 1.0.0 완료 — 2026-10-04

**1.0.0은 완성됐고 라이브다.** 아래 "최우선 목표" 이하는 라이브 배포 전 인계 기록이며 현재 상태가 아니다.

- 공개 주소 https://minhoyoodev.github.io/yangjae-bridge-flea-market-2026/ 는 HTTP 200으로 응답하고, `main`의 최신 커밋이 배포돼 있다(태그 `v1.0.0`).
- 내용: 콜앤메이슨 매대 페이지. 기획상품 9종(허브 키퍼 3, 주방 도구 4, 그라인더 세트 2), 매대 위치 "꿈놀이터 계단 위", 브랜드 소개·연표·영상.
- 데이터·사진 수정 방법과 규칙은 README의 1.x.x 절을 따른다. 변경 후 `npm run format:check`, `npm test`, `npm run build`를 통과시키고 `main`에 push하면 Pages가 자동 배포된다.

## 최우선 목표

**추가 기능 개발보다 GitHub Pages 실제 라이브 배포를 먼저 완료한다.** 사용자는 이후 작업을 로컬 Codex에서 이어가기로 했다. 이미 승인된 배포 작업에 대해 다시 포괄적인 허가를 요청할 필요는 없다.

- 저장소: https://github.com/minhoyooDEV/yangjae-bridge-flea-market-2026
- 배포 브랜치: `main`
- 앱 버전: `1.0.0`
- 구현 기준 커밋: `8ea3e65f6dedec9b3d2be3460b6042dea900a52a`
- 배포 워크플로우: `.github/workflows/pages.yml` (`Deploy GitHub Pages`)
- GitHub가 반환한 Pages 주소: https://minhoyoodev.github.io/yangjae-bridge-flea-market-2026/

## 사용자 결정 — 변경하지 않을 범위

### 1.x.x

한 매대에 집중한 정적 원페이지다. 매대 사진 → 상품명·가격 목록 → 터치 시 상세 설명 모달을 제공한다. 위치 안내도 같은 페이지에 표시한다.

- 데이터는 `src/data/market.ts`에 하드코딩한다.
- DB, Supabase 설정, API, 로그인, 업체 관리 화면을 사용하지 않는다.
- 실행·빌드·배포에 Secrets나 `.env.local`이 필요 없다.
- 호스팅은 GitHub Pages다. Cloudflare 및 Vercel 작업을 재개하지 않는다.
- 사용자가 직접 저장소를 Public으로 전환했으며 API로 확인했다.
- 예시 상품·가격을 실제 판매 정보로 오인하게 만들지 않는다. 현재 화면에 예시 안내가 있다.

### 2.x.x

Supabase 설정 자체, DB·Storage 연결, 로그인·계정, 업체 관리 및 상품 편집은 모두 향후 범위다. 현재 연결을 준비하거나 마이그레이션을 적용하지 않는다.

기존 코드는 향후 참고용으로 남아 있다. `src/lib/backend-access.ts`가 `src/lib/supabase.ts`와 `scripts/admin-client.mjs` import 시 오류를 발생시켜 접근을 막는다. 환경변수로 해제하는 옵션은 없다. 클라우드 환경에 남아 있는 과거 Supabase 변수·비밀 값 요구사항은 1.x.x의 필수 조건이 아니다. 원격 Supabase 프로젝트·데이터·Auth 설정은 변경하지 않았다.

## 최신 배포 상태와 실패 이력

문서 작성 직전 확인한 상태:

- 저장소 `private=false`, `has_pages=true`.
- Pages API의 `build_type=workflow`: **Pages 활성화는 이제 완료됐다.** 이전 대화의 “Pages 미활성화” 안내를 그대로 반복하지 않는다.
- 공개 주소에 GET 요청한 결과는 아직 **HTTP 404**다. 라이브 성공으로 보고하면 안 된다.
- 문서 작성 전 마지막 실행은 실패 상태이며, 이 문서를 main에 푸시하면 새 실행이 자동 생성된다. 아래 과거 실행 대신 최신 main SHA의 실행을 확인한다.

| 실행 | 커밋 | 확인된 원인 |
| --- | --- | --- |
| [37178382302](https://github.com/minhoyooDEV/yangjae-bridge-flea-market-2026/actions/runs/37178382302) | `8300a1f` | Configure Pages 조회 권한 부족. 빌드 job에 `pages: read`를 추가해 수정함 |
| [37178749335](https://github.com/minhoyooDEV/yangjae-bridge-flea-market-2026/actions/runs/37178749335) | `8ea3e65` | Configure Pages의 `Not Found`. 당시 Pages가 미활성화였음 |

현재 워크플로우는 main push 또는 workflow_dispatch로 실행되며, 설치 → 테스트 → 포맷 검사 → Pages 설정 조회 → 빌드 → artifact 업로드 → 배포 순서다. 빌드 job은 `contents: read`, `pages: read`; 배포 job은 `pages: write`, `id-token: write`를 사용한다.

## 로컬에서 바로 이어갈 순서

1. 기존 사용자 변경을 확인하고 보존한 뒤 main 최신 내용을 받는다. 클라우드의 `/workspace/...` 경로를 로컬 경로로 가정하지 않는다. 기존 체크아웃을 사용하고 요청 없이 새 worktree를 만들지 않는다.
2. 최신 Actions 실행을 확인한다. 이미 진행 중이라면 중복 실행하지 않고 결과를 기다린다.

   ```sh
   gh run list --repo minhoyooDEV/yangjae-bridge-flea-market-2026 --workflow pages.yml --limit 5
   gh api repos/minhoyooDEV/yangjae-bridge-flea-market-2026/pages
   ```

3. 최신 커밋의 실행이 없거나 Pages 활성화 전 실행만 남아 있다면 수동 실행한다.

   ```sh
   gh workflow run pages.yml --ref main --repo minhoyooDEV/yangjae-bridge-flea-market-2026
   ```

4. 출력에서 실제 run ID를 확인하고 상태·실패 로그를 읽는다. 임의의 run ID나 과거 실행을 최신 결과로 취급하지 않는다.

   ```sh
   gh run watch RUN_ID --exit-status --repo minhoyooDEV/yangjae-bridge-flea-market-2026
   gh run view RUN_ID --log-failed --repo minhoyooDEV/yangjae-bridge-flea-market-2026
   ```

5. 실패하면 해당 단계만 진단·수정한다. DB 설정, Secrets 입력, 로그인 개발은 해결책이 아니다. Pages 권한/설정 문제라면 실제 오류를 확인한다.
6. 배포 job 성공 후 아래 공개 주소와 브라우저 동작까지 확인한다. 사용자에게 **검증된 라이브 URL**을 전달하면 우선 목표가 완료된다.

   ```sh
   curl -I https://minhoyoodev.github.io/yangjae-bridge-flea-market-2026/
   ```

## 완료 기준

- 최신 main 커밋의 Actions build와 deploy가 모두 성공한다.
- 공개 기본 URL이 HTTP 200이며 사진·JS·CSS가 정상 로드된다.
- 매대 사진, 상품명·가격, 상품 상세 모달이 실제로 표시된다.
- 모달 닫기, Escape, 닫은 뒤 포커스 복원을 확인한다.
- 320px/390px 모바일에서 가로 넘침이 없다.
- 로그인·관리 메뉴가 없고 Supabase/Auth 등 외부 API 요청이 없다.
- 기존 `#/vendor/login`, `#/vendor`, `#/visit` 주소와 새로고침이 원페이지로 돌아온다.
- GitHub Pages 배포와 Codex 클라우드 환경 게시(Publish)를 혼동하지 않는다.

## 구현 위치

| 파일 | 역할 |
| --- | --- |
| `src/data/market.ts` | 매대 정보, 상품명·원화 가격·설명. 현재 상품 3개와 가격은 예시 |
| `src/pages/BetaBooth.tsx` | 원페이지 및 네이티브 dialog 상세 모달 |
| `src/App.tsx` | 홈 라우트 및 나머지 해시 경로의 홈 리다이렉트 |
| `src/components.tsx` | 브랜드·사진·기본 레이아웃. 로그인/관리/별도 메뉴 없음 |
| `src/lib/public-image.ts` | BASE_URL을 적용한 로컬 이미지 경로 |
| `src/lib/backend-access.ts` | 1.x.x Supabase 접근 차단 |
| `vite.config.ts` | PAGES_BASE_PATH를 이용한 프로젝트 하위 경로 지원 |
| `.github/workflows/pages.yml` | 키 없이 수행하는 Pages 자동 배포 |

실제 판매 정보를 받으면 `src/data/market.ts`를 수정한다. 사진은 `public/` 아래에 보관한다. 실제 데이터로 교체한 뒤에만 `booth.is_sample=false`로 바꾼다. `price=0`은 ‘0원’, null은 ‘가격 문의’다.

## 이미 완료한 검증

- Node.js 24.19.0 / npm 11.9.0에서 lockfile 기반 설치 성공.
- 단위 테스트 **18개**, TypeScript 및 포맷 검사 통과.
- 실제 키 없이 프로젝트 하위 경로용 운영 빌드 성공.
- Chromium으로 운영 빌드의 로컬 preview를 확인: 정적 상품·가격·사진, 모달·키보드·포커스, 모바일 폭, 기존 해시 경로 리다이렉트 통과.
- 해당 브라우저 검사에서 외부 API 요청 및 런타임 오류 없음.
- 빌드 JS에 Supabase 클라이언트·프로젝트 호스트·로그인 호출 코드가 포함되지 않음을 확인.
- 계정 생성·비밀번호 재발급·이미지 정리·통합 검사 스크립트는 실행 전에 차단됨을 확인.
- 위 결과는 로컬 빌드 검증이다. 실제 공개 서비스 검증은 별도로 필요하다.

필요 시 저장소 루트에서:

```sh
npm ci
npm test
npm run format:check
PAGES_BASE_PATH=/yangjae-bridge-flea-market-2026 npm run build
PAGES_BASE_PATH=/yangjae-bridge-flea-market-2026 npm run preview -- --port 4174 --strictPort
```

Node.js 24 이상을 사용한다. 클라우드에서는 기본 npm 캐시가 쓰기 불가여서 `--cache /workspace/.npm-cache`를 사용했지만, 로컬에서는 일반 `npm ci`부터 사용한다. 테스트를 통과한 코드에 불필요한 리팩터링을 추가하지 않는다.

## 참고 및 주의

- 과거 구현/검증 문서에는 Supabase·업체 로그인·Cloudflare 설명이 남아 있을 수 있다. 최신 사용자 결정은 이 문서와 README의 1.x.x 범위다.
- 기존 `package:pages`는 과거 Cloudflare ZIP 도구이며 GitHub Pages에 사용하지 않는다.
- Cloudflare `_headers`, `_redirects`는 Pages 배포 artifact에서 제거한다.
- 클라우드의 GitHub 연결은 Git push/Actions 조회는 가능했지만 Pages 활성화 POST는 403이었다. 로컬 인증 상태는 별도로 확인하되 토큰 값을 출력하지 않는다.
- 플랫폼 네트워크 제한으로 로그 다운로드가 차단되면 check-run annotations에서도 원인을 확인할 수 있다. 로컬에서는 먼저 정상 `gh` 조회를 시도한다.
