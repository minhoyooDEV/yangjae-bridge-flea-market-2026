# 2026 양재브릿지 플리마켓

1층에서 QR로 접속하여, 계단 위 매대와 주요 판매상품을 미리 살펴보는 모바일 홈페이지.

## 확정한 범위

- 방문객은 로그인 없이 매대 소개, 주요 상품, 매대 위치를 확인한다.
- 운영자가 업체 계정을 사전 생성하고 아이디와 비밀번호를 부여한다.
- 업체는 자기 매대 소개와 상품을 등록·수정·삭제한다.
- 매대는 DB에 등록된 N개를 한 열 목록으로 보여준다.
- 따뜻한 크림색·딥그린·주황 포인트를 사용한다. 모바일을 우선하고 넓은 화면에서는 최대 480px 폭으로 가운데 배치한다.
- 상품은 저장에 성공하면 승인 절차 없이 공개하며, 새 조회에서 최신 내용을 제공한다.
- 상품 소개와 위치 안내까지 제공한다. 예약과 주문은 현재 범위에 포함하지 않는다.
- 소스는 비공개 GitHub 저장소에서 관리한다.
- 실제 운영에 쓰는 기능은 무료 요금제의 사용량 및 이용 조건을 모두 충족해야 한다.

## 현재 단계

모바일 홈페이지와 업체 관리 기능을 구현하고 Supabase에 DB·Storage 권한을 적용했다.
방문객 목록·검색·상세·위치 안내, 업체 로그인·소개 수정·상품 CRUD·사진 업로드를 제공한다.
구체적인 설계는 [구현 계획](docs/implementation-plan.md), 계정 발급·DB 관리·배포 방법은 [운영 안내](docs/operations.md)에 기록한다.

Supabase 프로젝트 `sgxnccckhweykhautotb`의 Free 상태를 확인하고 CLI 연결을 완료했다.
업체 2계정으로 실제 저장·공개 및 다른 업체의 접근 차단을 검증했다.
원격 신규 가입·익명 로그인을 차단했고 발급된 계정의 비밀번호 로그인은 허용한다.
`supabase/config.toml`은 로컬 개발용, `ops/supabase/config.toml`은 원격 Auth 변경용이다.
실제 접속 키는 Git에서 제외하는 `.env.local`에 보관한다.
환경변수의 이름과 형식은 `.env.example`을 참고한다.

GitHub 비공개 저장소: [yangjae-bridge-flea-market-2026](https://github.com/minhoyooDEV/yangjae-bridge-flea-market-2026).

운영 호스팅 기본안은 Cloudflare Pages Free다. 계정 연결과 배포는 아직 실행하지 않았다.
기존 Vercel 프로젝트 연결 이후 Hobby의 상업용 제한을 확인하여 사용자 결정에 따라 무료 대안으로 변경했다.

제공된 HEIC 원본을 보존하고 `public/sample-images`에 웹용 JPEG 전경·매대·썸네일 4개를 준비했다.

## 개발

Node.js 24와 npm을 사용한다. `.env.example`을 참고해 `.env.local`을 준비한다.

```sh
npm ci
npm run dev
npm run test
npm run build
```

방문객은 `/`, 업체는 `/vendor/login`으로 접속한다. 화면 확인용 `sample01` 계정의 발급 파일은 Git에서 제외된 `.local/vendor-sample01.json`에 있다.

## 설정 파일 관리

`.env.local`, 다른 실제 환경 파일, `.vercel`, `supabase/.temp`는 커밋하지 않는다.
실제 키, 비밀번호, 인증 코드가 담긴 파일을 GitHub에 올리지 않는다.
Supabase 계정 매핑과 비밀번호는 공개 매대·상품 데이터와 분리한다.
