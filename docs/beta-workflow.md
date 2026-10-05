# 1.x.x 원페이지: 개발 및 GitHub Pages 배포

## 콘텐츠 관리

`apps/web/src/data/market.ts`에서 한 매대의 이름·설명·사진·위치와 상품 목록을 수정한다. 상품 항목은 `id`, `name`, `price`(원 단위 숫자), `description`, `image_path`(선택)다. 사진은 `apps/web/public/`에 보관한다. 현재 예시 상품·가격을 실제 판매 정보로 교체한 후 `booth.is_sample=false`로 설정한다. 0은 ‘0원’, null은 ‘가격 문의’로 표시한다.

1.x.x는 DB·API·로그인을 사용하지 않는다. Supabase 연결과 마이그레이션은 필요 없다. 분석을 사용한다면 기존 `POSTHOG_KEY` 시크릿을 유지한다. 기존 Supabase 환경변수 및 Secrets가 있어도 이 배포에서 참조하지 않는다. DB·인증은 2.x.x의 별도 작업이다.

## 개발과 검증

Node.js 24+와 pnpm을 사용한다. 클라우드 작업 디렉터리는 `/workspace/yangjae-bridge-flea-market-2026`이다. 이미 격리된 기존 체크아웃을 사용하고 별도 worktree는 만들지 않는다.

```sh
pnpm install --frozen-lockfile --store-dir /workspace/.pnpm-store
pnpm test
pnpm run format:check
pnpm run build
pnpm run dev --port 5173 --strictPort
```

`.env.local`과 서비스 프로세스는 필요 없다. 개발 서버만 실행한다. 원페이지의 사진·가격·상세 모달, 닫기·Escape·포커스 복원, 모바일 가로 넘침을 확인한다. 네트워크에서 Supabase/Auth 요청이 없어야 한다.

GitHub Pages 프로젝트 경로 검증:

```sh
PAGES_BASE_PATH=/yangjae-bridge-flea-market-2026 pnpm run build
PAGES_BASE_PATH=/yangjae-bridge-flea-market-2026 pnpm run preview --port 4173 --strictPort
```

## 배포

1. 비공개 저장소의 GitHub Pages를 지원하는 계정 요금제인지 확인한다. GitHub Free에서는 공개 저장소가 필요하다. 저장소 공개 전환은 별도 결정한다.
2. Settings → Pages → Build and deployment → Source를 **GitHub Actions**로 설정한다.
3. 작업 브랜치의 변경으로 main 대상 PR을 열고 PR checks 통과 후 병합한다. main에는 직접 푸시하지 않는다. Actions가 설치 → 테스트 → 포맷 검사 → 빌드 → Pages 배포를 수행한다. 수동 실행은 Actions → Deploy GitHub Pages → Run workflow를 사용한다.
4. 성공한 deploy 작업이 출력하는 URL 또는 Settings → Pages에 표시되는 실제 URL을 확인한다. 기본 예상 주소는 `https://minhoyooDEV.github.io/yangjae-bridge-flea-market-2026/`이며 실제 배포 성공을 뜻하지 않는다.
5. 공개 주소에서 사진·상품명·가격·모달을 확인한다. 기존 `#/vendor/login`, `#/vendor`, `#/visit` 주소 및 새로고침은 모두 원페이지로 돌아와야 한다.
6. 확인된 기본 URL로 `pnpm qr https://실제-배포주소/`를 실행하고 휴대폰에서 검사한다.

경로는 `actions/configure-pages`의 `base_path`를 Vite에 전달한다. Cloudflare 전용 `_headers`, `_redirects`는 산출물에서 제거한다. GitHub Pages는 해당 응답 헤더 설정을 지원하지 않는다. 기존 `package:pages` ZIP 명령은 과거 Cloudflare 보조 도구로 남아 있으며 현재 배포에 사용하지 않는다.

GitHub Pages 웹사이트 배포와 Codex 클라우드 환경 게시(Publish)는 별개다. 클라우드 설정 초안 저장만으로 웹사이트가 배포되지는 않는다.

## 모노레포 실행 경로

루트에서 pnpm 명령을 실행한다. 웹은 `apps/web`, 영상 제작은 `packages/herb-film`이다. 루트 `pnpm build`는 완성 영상을 복사한 뒤 웹을 빌드한다. Pages artifact 경로는 `apps/web/dist`이다. 영상 패키지의 `assets`만 원본으로 편집하고 웹의 `public/films` 복사본은 직접 편집하지 않는다. `pnpm film:render`는 macOS 전용이며 Linux 배포 작업에서는 실행하지 않는다.
