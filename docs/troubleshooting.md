# Troubleshooting과 재현된 주의사항

이 문서는 실제로 재현된 실패와 현재 알려진 배포 결함을 기록한다. 구조 선택 자체는 ADR에서
관리한다.

## `/__vitrine/manifest`가 gallery HTML을 반환함

- 상태: 방지 중
- 증상: manifest fetch가 JSON 대신 HTML을 받음
- 원인: Connect의 path middleware가 prefix match하므로 `/__vitrine` handler가 더 구체적인
  `/__vitrine/manifest` 요청도 가로챔
- 진단: 실행 중인 server에서 두 URL의 content type과 body를 각각 확인
- 안전한 대응: manifest middleware를 gallery middleware보다 먼저 등록하고 두 endpoint를
  함께 검증

## 첫 `@preview` 추가나 삭제가 live 목록에 반영되지 않음

- 상태: 방지 중
- 증상: server 시작 후 첫 source 변경만 virtual preview module invalidation을 건너뜀
- 원인: watcher의 첫 event에서 이전 render 결과를 baseline으로 lazy 초기화함
- 진단: server를 새로 시작한 뒤 첫 번째 `@preview` 추가와 제거를 각각 재현
- 안전한 대응: baseline을 `configureServer` 시점에 계산하고, watcher에서는 이전 결과와 비교

## 관련 없는 `@preview` 주석이 다른 export에 매칭됨

- 상태: 회귀 테스트로 방지 중
- 증상: export되지 않은 선언 위의 `@preview`가 뒤쪽의 무관한 named export나
  `export default Foo`에 연결됨
- 원인: Babel의 `leadingComments`가 없는 경우 사용하는 위치 기반 fallback이 앞선 문장을
  지나치게 많이 건너뜀
- 안전한 대응: fallback 하한선을 export 형태별로 필요한 최소 범위로 제한한다.
  `export default Foo`만 선언과 export 사이 한 문장을 허용하고, 선언과 export가 같은 node인
  named/default declaration은 앞선 문장을 건너뛰지 않는다.
- 검증: fallback을 수정할 때 정상 case뿐 아니라 같은 helper를 사용하는 모든 export 형태에
  무관한 선언이 끼어 있는 adversarial case를 추가

## 죽은 server의 `.vitrine/port.json`이 남아 있음

- 상태: 허용된 현재 trade-off
- 증상: Vite process 종료 뒤 port file이 디스크에 남음
- 원인: CLI 종료 경로가 `server.close()`를 항상 호출하지 않음
- 정확성 조건: extension이 `process.kill(pid, 0)` 기반 생존 검사를 통과한 후보만 사용
- 안전한 대응: stale file 자체를 server 생존 신호로 간주하지 않는다. 정리 목적의 signal
  handler는 cross-platform 동작과 종료 방해 위험을 검토하지 않고 추가하지 않는다.
- 재검토 조건: stale file이 실사용 문제를 만들거나 신뢰할 수 있는 cross-platform lifecycle
  hook이 도입됨

## Extension Development Host에 Vitrine command가 없음

- 상태: 방지 중
- 증상: 창 제목에는 Extension Development Host가 보이지만 `Vitrine: Open Preview`가 없음
- 원인: `code --extensionDevelopmentPath`에 working directory 기준 상대 경로를 넘겨 extension이
  실제로 load되지 않음
- 진단: extension host log와 development path를 확인
- 안전한 대응: `scripts/dev-host.mjs`가 `import.meta.url` 기준 절대 경로를 계산하는 방식을 유지

## Gallery source 변경이 refresh 후에도 보이지 않음

- 상태: 알려진 현재 제약
- 증상: `client/`의 TS/TSX를 고친 뒤 browser refresh만으로 UI가 갱신되지 않음
- 원인: runtime은 generated `dist/gallery/gallery-client.js`를 읽고 gallery source와 virtual
  module 사이에 Vite watch edge가 없음
- 안전한 대응: gallery bundle을 다시 build하고 dev server를 재시작
- 재검토 조건: gallery 편집 빈도가 높아지거나 독립 dev target/HMR의 가치가 build 복잡도보다 큼

## 누락된 setupFile이 Gallery 시작을 막음

- 상태: 해결, 회귀 테스트로 방지 중
- 과거 증상: 설정 파일이 없으면 previews virtual module 요청이 500으로 실패하고 Gallery가 열리지 않음
- 원인: Vite import analysis가 virtual module 안의 정적 dynamic import를 미리 resolve함
- 현재 대응: previews module load 시 파일 존재를 확인해 없으면 import 대신 안내 메시지로 reject하는
  loader를 생성. 설정 파일의 생성과 삭제만 previews module을 무효화하고, 내용 변경은 Vite HMR에 맡김
- 피해야 할 대응: `@vite-ignore`로 분석을 숨기거나 파일 내용을 별도 virtual module로 복제. 실제
  파일이 module graph에서 빠져 transform, 상대 import, HMR을 다시 구현해야 함
- 검증: `preview-setup.integration.test.ts`가 실제 Vite server에서 누락 중 응답, 생성과 삭제 후 재로드,
  TypeScript transform과 상대 import 로드를 확인

## setupFile 오류를 고쳐도 Gallery가 오류 화면에 남음

- 상태: 해결, 회귀 테스트로 방지 중
- 과거 증상: setup module이나 그 의존 module이 처음부터 변환 또는 평가에 실패하면 파일을 고쳐도
  Gallery가 수동 새로고침 전까지 오류를 표시
- 원인: Vite는 변환에 성공한 적 없는 module의 갱신을 전파하지 않음. 갱신이 전달되어도 평가에
  실패한 module은 browser에 HMR 경계를 등록하지 못함
- 현재 대응: plugin의 `handleHotUpdate`가 setup import tree의 미분석 module 변경 시 Gallery 전용
  custom event를 보내고, Gallery는 setup 실패 상태일 때만 그 event나 다음 HMR 갱신에서 reload
- 피해야 할 대응: full-reload broadcast. Vite는 변환 실패와 아직 요청되지 않은 lazy import module을
  구분하지 않아, setup tree의 lazy module을 고칠 때마다 사용자 앱 page까지 reload됨
- 검증: `preview-setup.integration.test.ts`의 변환 실패 복구와 lazy import 비reload case, `needsPreviewSetupRecovery`와
  `reloadOnNextHotUpdate` unit test

## symlink를 거친 Vite root에서 setupFile 오류 복구가 동작하지 않음

- 상태: 해결, 회귀 테스트로 방지 중
- 과거 증상: junction이나 symlink를 거친 root에서 처음부터 깨진 setup 파일을 고쳐도 Gallery 복구
  신호가 오지 않음
- 원인: Vite module graph는 symlink를 푼 실제 경로를 `file`로 기록하지만, setup 경로는 Vite root
  기준으로 계산함
- 현재 대응: `needsPreviewSetupRecovery`가 root 기준 경로와 `realpath` 결과를 함께 비교
- 검증: `preview-setup.integration.test.ts`의 symlink root 복구 case

## Windows 8.3 짧은 경로 root에서 모든 source 요청이 403

- 상태: Vite 제약, 테스트에서 회피
- 증상: `C:\Users\RUNNER~1\...` 같은 8.3 경로를 Vite root로 쓰면 plugin 유무와 무관하게 source
  요청이 `outside of Vite serving allow list` 403으로 실패. GitHub Actions Windows runner의 임시
  폴더가 이 형태임
- 현재 대응: Vite server를 띄우는 테스트는 `fs.realpathSync.native(os.tmpdir())`로 실제 경로를 root로 사용
- 재검토 조건: Vite가 8.3 root의 serving allow list 비교를 지원함

## setupFile의 특수문자 파일명이 로드되지 않음

- 상태: Vite 제약, 경로 해석 단계에서 거부
- 증상: 실제로 존재하는 설정 파일의 이름에 `#`, `?`, `%`가 포함되면 module loading 실패
- 원인: Vite 7.3 dev server가 module 경로의 `#`, `?`, `%`를 URL fragment, query, escape로 해석함.
  인코딩한 specifier나 plugin resolve로 실제 경로를 넘겨도 제공하지 못함
- 현재 대응: `resolvePreviewSetupPath`가 invalid로 판정하고 dev server는 유지한 채 Gallery와 터미널에
  이름 변경 안내와 해석된 경로 표시
- 재검토 조건: Vite가 해당 문자를 포함한 module 경로 제공을 지원함

## Gallery bundle이 package tarball에서 누락됨

- 상태: 해결, package smoke test로 방지 중
- 과거 증상: workspace에서는 동작하지만 packed package를 설치한 소비자에서 gallery virtual
  module load가 `ENOENT`로 실패할 수 있었음
- 과거 원인: runtime은 `client/gallery-client.js`를 읽었지만 package의 `files`는 `dist`만 포함
- 현재 대응: asset을 `dist/gallery/` 아래에 생성하고 runtime도 같은 경로를 읽음
- 검증: `pnpm run test:package`가 tarball 파일 목록과 임시 소비자의 `/__vitrine`, gallery 및
  previews virtual module, manifest 응답을 확인

## Package smoke test의 Babel dependency 설치가 registry 상태에 따라 실패함

- 상태: 임시 소비자 override로 방지 중
- 증상: workspace test와 build는 통과하지만 `pnpm run test:package`의 tarball 임시 설치가
  `@babel/*` 하위 dependency version을 찾지 못해 실패함
- 원인: Scanner가 사용하는 Babel package의 semver range가 registry에서 부분적으로 게시된 최신
  dependency graph를 선택할 수 있으며 이 graph가 workspace lockfile에서 검증된 조합과 다름
- 현재 대응: Published package manifest의 정상 semver range는 유지하고 package smoke runner가
  workspace에 실제 설치된 Babel dependency graph를 조회해 임시 소비자의 `pnpm.overrides`에만 고정
- 검증: `pnpm run test:package`로 tarball 설치와 Gallery runtime smoke test를 함께 실행
- 재검토 조건: Babel 배포 상태가 안정되어 override가 불필요해지거나 별도의 package manager와
  registry 조합까지 검증 범위를 넓힘

## Package smoke test가 CI에서만 `ERR_PNPM_NO_OFFLINE_META`로 실패함

- 상태: 해결됨
- 증상: 로컬에서는 `pnpm run test:package`가 통과하지만 GitHub Actions의 새 runner에서는 임시 소비자
  설치가 `ERR_PNPM_NO_OFFLINE_META`로 실패함
- 원인: lockfile 없는 임시 소비자를 `--offline`으로 설치하면 버전 범위 해석에 pnpm metadata cache가
  필요함. CI는 store만 복원하고 metadata cache는 비어 있음
- 현재 대응: 임시 소비자 설치에 `--prefer-offline`을 사용해 store를 우선 쓰고 없는 metadata만 조회
- 검증: `npm_config_cache_dir`를 빈 디렉터리로 지정한 뒤 `pnpm run test:package` 실행

## Package smoke test가 Windows runner에서 소스 요청을 403으로 받음

- 상태: 해결됨
- 증상: GitHub Actions Windows job에서 임시 소비자의 `/src/Smoke.tsx` 요청이 403으로 실패함. 로컬 Windows는 통과
- 원인: runner의 `os.tmpdir()`가 8.3 짧은 경로(`RUNNER~1`)를 반환함. Vite root는 짧은 경로, 요청 파일은
  긴 실제 경로로 해석되어 `server.fs` 허용 범위 밖으로 판단됨. Vitrine이 아닌 Vite 파일 서빙 동작
- 현재 대응: smoke test의 임시 폴더를 `fs.realpathSync.native(os.tmpdir())` 기준으로 생성
- 검증: 긴 이름 폴더를 만들고 그 짧은 경로를 `TEMP`, `TMP`로 지정한 뒤 `pnpm run test:package` 실행

## Sidebar 관련 파일이 일부 환경에서 같은 파일로 취급됨

- 상태: 방지 중
- 증상: 대소문자만 다른 두 파일이 Windows/macOS에서 TypeScript build를 깨뜨림
- 원인: 기본 case-insensitive filesystem에서 `sidebarTree.ts`와 `SidebarTree.tsx` 같은 이름이
  충돌
- 안전한 대응: 순수 tree builder와 React component의 basename을 대소문자 외에도 다르게 유지

## Cursor tracking이 다른 project로 자동 전환하지 않음

- 상태: 의도된 현재 UX trade-off
- 증상: panel이 project A를 보여줄 때 project B 파일로 cursor를 옮겨도 반응하지 않음
- 근거: 자동 전환이 사용자의 명시적인 Switch Project 선택과 경쟁하지 않게 함
- 재검토 조건: 실제 사용에서 자동 전환 기대가 명시적 선택 보존보다 중요하다는 근거가 생김
