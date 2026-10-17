---
name: release
description: 사용자가 "배포하자", "릴리스하자", "새 버전 내자"처럼 npm 패키지나 VS Code 확장 배포를 요청할 때 사용하는 Vitrine 배포 절차. changeset 준비, Version PR, 버전 태그 push와 결과 확인을 다룸
---

# Vitrine 배포 절차

사용자가 "배포하자", "릴리스하자", "새 버전 내자"처럼 배포를 요청하면 이 절차를 따른다. 버전 정책과
사람을 위한 요약은 `.changeset/README.md`가 소유하고, 이 문서는 에이전트가 수행할 단계와 확인 지점을
소유한다.

## 배포 구조

| 대상 | 배포 방법 |
| --- | --- |
| `vite-plugin-react-vitrine` (npm) | `vite-plugin-react-vitrine@<version>` 태그 push -> `publish.yml`이 Trusted Publishing(OIDC)으로 publish |
| `vitrine` (VS Code 확장) | VSIX를 만들어 Marketplace 관리 화면에 수동 업로드 |

- `version.yml`은 main push마다 대기 중인 changeset으로 "Version Packages" PR을 갱신하고 배포는 하지 않는다.
- `publish.yml`은 태그와 `packages/vite-plugin/package.json` 버전이 다르면 실패한다.
- npm 패키지는 2FA 필수, 우회 토큰 금지로 설정되어 있다. CI는 OIDC, 수동 배포는 사용자의 2FA로만 가능하다.

## npm 배포 단계

1. **상태 확인**: `main`을 최신으로 맞추고 main CI가 성공인지 확인한다. 실패 중이면 배포를 멈추고 원인부터 해결한다.
2. **배포할 변경 확인**: 마지막 태그 이후 사용자에게 보이는 변경을 `git log vite-plugin-react-vitrine@<last>..main`으로
   정리하고 `pnpm changeset status`로 대기 중인 changeset을 확인한다.
3. **changeset 준비**: 사용자에게 보이는 변경이 있는데 changeset이 없으면 `.changeset/<이름>.md`를 작성해 PR로 올린다.
   bump 종류는 `.changeset/README.md`의 0.x 정책을 따르고, 제안한 bump와 changelog 문구는 사용자에게 확인받는다.
4. **Version PR 머지**: changeset이 main에 들어가면 `version.yml`이 "Version Packages" PR을 만든다. 버전과 CHANGELOG를
   사용자와 함께 확인하고 사용자가 머지한다.
5. **배포 전 검증**: 머지된 main에서 버전을 읽고 `npm view vite-plugin-react-vitrine@<version> version`이 404인지
   확인한다. 이미 있는 버전이면 멈춘다.
6. **태그 push 확인받기**: npm에 올라간 버전은 되돌리거나 같은 번호로 다시 쓸 수 없다. 태그 이름과 버전을
   보여주고 사용자 확인을 받은 뒤에만 push한다.
7. **태그 push**: `git tag vite-plugin-react-vitrine@<version>` 후 `git push origin vite-plugin-react-vitrine@<version>`
8. **결과 확인**: `publish.yml` 실행 결과를 확인하고 `npm view vite-plugin-react-vitrine version`으로 반영을 확인한다.
   GitHub 공개 API로 job과 step 결론은 볼 수 있지만 로그 원문은 인증이 필요하다. `gh`가 없으면 로그는 사용자에게 받는다.

## 실패 대응

- **태그와 버전 불일치**: publish 전 단계에서 실패하므로 npm에는 아무것도 올라가지 않는다. 사용자 확인 후 로컬과 원격
  태그를 지우고 올바른 버전으로 다시 진행한다.
- **OIDC 인증 실패(ENEEDAUTH, `E404 Not Found - PUT`)**: npm은 인증 실패를 404로 돌려준다. npmjs.com 패키지
  Settings의 Trusted Publisher를 확인한다.
  - 목록 없이 "Select your publisher"만 보이면 등록되지 않은 상태다
  - 표시가 정확히 `yuntaengtaeng/vitrine`, `publish.yml`이어야 한다. Repository 칸에는 URL이 아니라 저장소 이름
    `vitrine`만 넣는다. URL을 넣으면 `yuntaengtaeng/https://github.com/...`처럼 저장된다
  - Permissions에 `npm publish`가 포함되어야 한다
  - 설정을 고친 뒤에는 workflow를 바꾸지 않았으므로 실패한 Publish 실행을 Re-run하면 된다
- **수동 배포가 필요할 때**: 사용자가 명시적으로 요청한 경우에만 사용자의 PC에서 `pnpm pack` 후
  `npm publish ./vite-plugin-react-vitrine-<version>.tgz`로 배포한다. 사용자가 2FA로 인증해야 한다.

## 하지 않는 것

- 패키지 폴더에서 `npm publish`를 바로 실행하지 않는다. `catalog:`와 `workspace:` 범위가 변환되지 않은 채 올라간다.
- 배포 태그를 force push하거나 publish된 버전 번호를 재사용하지 않는다.
- 사용자 확인 없이 Version PR을 머지하거나 배포 태그를 push하지 않는다.
- 2FA 우회 토큰을 만들거나 요청하지 않는다. 패키지 설정이 이를 막고 있다.

## VS Code 확장 배포

확장은 수동으로 배포한다. Azure DevOps 전역 PAT이 2026년 12월 1일에 폐지되고 Marketplace Trusted Publishing 설정
위치를 확인하지 못해 CI 게시는 두지 않았다.

1. 확장에 사용자에게 보이는 변경이 있으면 changeset에 `vitrine`을 포함해 버전을 올린다.
2. Version PR이 머지된 main에서 `pnpm run package:extension`으로 VSIX를 만든다. CI에서 만든 파일이 필요하면
   `Package VS Code extension` workflow의 artifact를 받는다.
3. 사용자가 VSIX를 설치해 핵심 흐름을 확인한다.
4. 사용자가 https://marketplace.visualstudio.com/manage 의 publisher `yuntaengtaeng` 페이지에서 확장의 Update로 VSIX를 올린다.
5. Marketplace 공개 API로 새 버전이 조회되는지 확인하고 `vitrine@<version>` 태그를 push한다.

같은 버전 번호로는 다시 올릴 수 없으므로 3번 확인을 건너뛰지 않는다.
