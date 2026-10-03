# 운영 안내

## 현재 구성

- React + TypeScript + Vite 정적 홈페이지. 방문객은 로그인 없이 이용한다.
- Supabase Free: DB, Auth, 공개 이미지 Storage. RLS와 열 단위 권한으로 자기 매대만 관리한다.
- Cloudflare Pages Free에 정적 빌드 파일을 배포한다. 무료 기본 주소를 QR에 사용한다.
- 별도 서버, Edge Functions, Realtime, 유료 이미지 변환은 사용하지 않는다.
- 480px 최대 폭의 모바일 한 열 디자인이다. 매대 수는 DB에서 동적으로 조회하고 12개씩 더 불러온다.
- 실제 행사 시간·위치·업체 정보가 없으므로 현재 샘플 매대를 명시해 둔다. 출시 전에 운영자가 실제 정보로 교체한다.

## 로컬 실행

Node.js 24를 사용한다. `.env.example`을 참고해 `.env.local`에 지정 프로젝트의 URL와 공개 키를 설정한다. 비밀 키를 `VITE_` 환경변수로 만들지 않는다.

```sh
npm ci
npm run dev
npm run test
npm run build
```

`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` 두 값만 빌드에 들어간다. `.env.local`의 다른 값은 브라우저에 포함하지 않는다. 운영자 스크립트는 인증된 Supabase CLI에서 서버 키를 메모리로 읽고 키 값을 출력하지 않는다.

## 매대와 업체 등록

1. Supabase Table Editor에서 `public.booths`에 매대를 추가한다. 이름, 소개, 종류(category), 매대 번호, 위치 안내, 표시 순서를 입력한다. 실제 매대는 `is_sample=false`, 공개할 때 `is_active=true`로 설정한다.
2. 매대의 `id`를 복사하고 다음 명령으로 계정을 만든다.

```sh
npm run vendor:create -- --login-id booth02 --booth-id 매대의_UUID
```

3. 발급 결과는 `.local/vendor-booth02.json`에만 저장된다. 해당 업체에게 아이디와 비밀번호를 개별 전달한다. 파일은 Git에서 제외되며 소유자만 읽을 수 있다.
4. 업체는 `/vendor/login`에서 로그인하고 자기 매대 소개·사진 및 상품을 관리한다. 매대 이름·번호·위치·공개 여부는 운영자가 관리한다.

아이디는 영문 소문자·숫자·`_`·`-`로 3~32자다. 로그인할 때 `아이디@vendors.yangjae-market.invalid`라는 내부 주소로 변환한다. 이 주소는 실제 이메일이 아니며 메일을 발송하지 않는다. 비밀번호는 Supabase Auth가 관리하고, DB 매대 정보에는 저장하지 않는다. 업체 계정과 매대 연결은 공개 API에서 접근할 수 없는 `private.vendor_accounts`에 보관한다.

현재 화면 확인용 계정은 `sample01`이며 비밀번호는 로컬 `.local/vendor-sample01.json`에 있다. 이 계정은 샘플 매대 하나만 관리한다.

## 비밀번호 재발급

```sh
npm run vendor:reset -- --login-id booth02
```

해당 계정의 새 비밀번호를 생성하고 기존 로컬 발급 파일을 갱신한다. 업체에 새 정보를 전달한다. 자체 회원가입·익명 로그인은 차단되어 있다. 비밀번호 로그인 기능은 켜져 있어야 하므로 `auth.email.enable_signup=true`, 전역 `auth.enable_signup=false`를 함께 사용한다.

## 상품과 사진

- 상품 이름 1~80자, 설명 1,000자 이하. 가격·결제·주문 기능은 없다.
- 매대 소개 1,500자 이하. 저장 성공 후 방문객의 다음 조회에 바로 반영된다.
- JPG·PNG·WebP 원본 20MB 이하. 브라우저에서 JPEG로 변환해 긴 변 1,280px, 업로드 파일 1MB 이하로 줄이고 480px 썸네일을 만든다. HEIC는 JPG로 변환한 뒤 선택한다.
- 사진 경로는 매대 UUID 아래에 새 UUID로 저장한다. 사진 교체 시 새 사진 업로드 → DB 저장 → 이전 사진 정리 순서로 처리한다.
- 저장 실패 시 입력을 유지한다. 서버 저장 후 응답만 끊겼을 수 있으므로 새 사진을 즉시 삭제하지 않고, 먼저 목록에서 저장 여부를 확인하도록 안내한다. 24시간 이상 참조되지 않은 사진은 아래 점검 도구로 확인한다. 소개·이름만 수정할 때는 사진 경로를 보내지 않아 다른 창에서 교체한 사진을 이전 경로로 되돌리지 않는다.

```sh
npm run images:check
# 결과를 검토한 뒤, 업체 편집이 없는 시간에 24시간 이상 미참조 파일만 정리:
npm run images:check -- --apply
```

## DB 및 Auth 설정 반영

```sh
npx supabase db push --dry-run
npx supabase db push
npx supabase config diff --project-ref sgxnccckhweykhautotb --workdir ops
npx supabase config push --project-ref sgxnccckhweykhautotb --workdir ops
```

`supabase/config.toml`은 로컬 개발용이다. 원격 설정은 필요한 Auth 항목만 선언한 `ops/supabase/config.toml`을 사용한다. CLI는 선언하지 않은 원격 설정을 유지한다.

## 검증

`npm run test:integration`은 지정된 프로젝트에 임시 업체 2개와 계정을 만들어 실제 로그인, 저장·공개, 다른 업체의 변경 차단, Storage 권한, 파일 제한, 검색·페이지 조회를 검증한다. `finally`에서 생성한 데이터·계정·사진을 지운다. 운영 중에는 변경이 없는 시간에 실행한다.

DB 보안 점검의 `public.my_booth_id()` SECURITY DEFINER 경고는 의도된 구성이다. 이 함수는 인자를 받지 않고 `auth.uid()`에 연결된 자기 매대 UUID 하나만 반환한다. 비공개 계정 매핑 전체를 공개하지 않으며 익명 실행도 허용하지 않는다. 다른 SECURITY DEFINER 함수인 `assign_vendor_account`는 서버 역할만 실행할 수 있다.

## 배포

```sh
npm run package:pages
```

생성된 `.local/cloudflare-pages.zip`을 Cloudflare Pages의 Direct Upload에 올린다. ZIP의 최상단에는 `index.html`, `_headers`, `_redirects`, `assets` 등이 들어간다. 원본 코드와 변경 이력은 GitHub 비공개 저장소에서 관리하며, 현재 방식은 자동 Git 배포가 아닌 정적 빌드 업로드다.

배포 주소를 확인한 뒤 다음 명령으로 인쇄용 QR을 생성한다.

```sh
node scripts/generate-qr.mjs https://확인한-배포주소/
```

## 행사 전 확인

- 실제 업체·매대 번호·계단 기준 위치와 행사 안내를 입력하고 샘플을 숨기거나 교체한다.
- Supabase가 일시정지되지 않았는지 확인하고 DB·Storage·전송량을 확인한다.
- 제공된 사진은 정적 호스팅으로, 업체 업로드 사진은 Supabase Storage로 제공하므로 Supabase 전송량 한도는 별도로 적용된다.
- 현장 1층에서 실제 휴대폰으로 QR → 매대 → 위치 안내를 확인한다.
- DB와 사진을 수동 백업한다. 자동 백업·유료 전환·유료 기능 활성화는 하지 않는다.
