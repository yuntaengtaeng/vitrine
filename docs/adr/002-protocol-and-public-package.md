# ADR 002: Runtime 계약은 private protocol package, 공개 설치 단위는 plugin 하나

- 상태: 채택, 선택 기능 package는 ADR 005로 보완
- 날짜: 2026-08-22

## 맥락

Route, manifest DTO, port-file 형식, selection message가 Vite plugin, gallery, VS Code extension,
type-check되지 않는 webview script에 중복되어 drift가 생겼다. 한편 사용자가 이 내부 계약
package를 알거나 따로 설치할 이유는 없다. `@vitrine` npm scope는 다른 소유자가 사용 중이라
publish할 수도 없다.

## 결정

`packages/protocol`이 runtime 간 계약만 소유한다.

- gallery/manifest route와 virtual module identifier
- network로 전송되는 manifest DTO, message union, port-file schema와 각 runtime validator

Protocol은 Node, React, Vite, VS Code API와 scanner 내부 모델에 의존하지 않고 파일 I/O, HTTP
handler, UI state 같은 adapter 구현을 포함하지 않는다. 범용 `shared` utility package로 키우지
않는다.

Protocol은 private workspace package로 두고, 공개 npm 설치 단위는 `vite-plugin-react-vitrine`
하나로 제한한다. Plugin, Gallery, Extension은 protocol runtime을 각 배포 bundle에 포함하며
Plugin의 JavaScript와 declaration 배포물에 protocol 참조를 남기지 않는다. `preview()`는
`vite-plugin-react-vitrine/preview` subpath로 제공한다. Framework 전용 plugin에
`vite-plugin-react-` 접두사를 쓰는 Vite plugin 관례를 따른다.

## 결과

- Runtime 간 변경이 하나의 type과 validator를 중심으로 이뤄지고, 외부 입력을 `as` cast 대신
  경계에서 검증한다.
- 기본 사용은 plugin 하나만 설치하며 VS Code extension은 선택 사항이다. 선택 기능은
  [ADR 005](./005-plugin-architecture.md)에 따라 공식 plugin package를 추가로 설치한다.
- Plugin build는 declaration까지 self-contained여야 하고, package smoke test가 plugin tarball
  단독 설치로 이를 검증한다.

## 재검토 조건

- Protocol을 직접 소비하는 외부 adapter가 실제로 생김
- Runtime을 독립 배포해 version negotiation이 필요함
- Protocol이 framework dependency나 범용 utility를 끌어들이기 시작함
- Bundle 내부화가 별도 공개 package보다 배포 크기나 유지 비용을 크게 높임
