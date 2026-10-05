# 작업 및 배포 규칙

- 웹은 `apps/web`, 영상 제작은 `packages/herb-film`에서 수정한다. 루트 pnpm workspace와 `pnpm-lock.yaml` 하나를 사용한다.
- `main`에 직접 커밋하거나 푸시하지 않는다. 작업 브랜치에서 커밋하고 PR을 통해 병합한다.
- PR 병합 전 `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm format:check`, `pnpm build`와 GitHub의 PR 검사를 통과해야 한다.
- 영상 원본은 `packages/herb-film/assets`이다. `apps/web/public/films`는 생성된 복사본이므로 커밋하지 않는다. 영상 변경 시 `pnpm film:check`로 검증한다. 영상 재생성은 macOS에서 `pnpm film:render`로 한다.
- 사용자에게 배포 요청을 받은 경우 PR 검사 확인 → PR 병합 → GitHub Pages workflow 성공 → 실제 공개 URL 확인 순서로 완료한다. 사용자 승인 없이 branch protection이나 검사 요건을 우회하지 않는다.
- 웹 버전은 `apps/web/package.json`과 루트 `package.json`에서 함께 올린다. 릴리스 태그 `vX.Y.Z`는 병합된 main 커밋을 가리키도록 한다.
- 비밀 값, `.env` 파일, 로컬 백업, 에이전트 실행 자료는 커밋하지 않는다. 기존 사용자 변경을 덮어쓰지 않는다.
