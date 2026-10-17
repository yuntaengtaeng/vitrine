# ADR 003: Gallery를 vite-plugin 내부 독립 build target으로 유지

- 상태: 채택
- 날짜: 2026-08-22

## 맥락

Gallery는 Node plugin과 다른 browser runtime이라 별도 source root, JSX transform, type-check가
필요하다. 그러나 유일한 host와 배포 단위는 `vite-plugin-react-vitrine`이다. 별도 workspace
package로 만들어도 package asset 누락 문제는 자동으로 해결되지 않는다. 실제로 bundle을 `dist`
밖에 생성해 tarball에서 asset이 빠진 적이 있다.

## 결정

Gallery source와 독립 type-check/build target은 `vite-plugin` 안에 유지하고 별도 npm package로
배포하지 않는다. 최종 bundle은 package의 `files: ["dist"]` 경계 안에 생성하고 plugin runtime도
그 경로만 읽는다. Package 완료 조건은 tarball을 임시 소비자에 설치해 Vite dev server에서
`/__vitrine`, gallery virtual module, manifest 응답을 확인하는 것이다.

## 결과

- Browser runtime 경계는 build target으로 드러나고 배포 단위는 실제 소비 관계와 일치한다.
- Gallery source edit의 HMR은 asset 위치와 별개의 문제다.

## 재검토 조건

- Vite plugin 외 host가 gallery를 그대로 소비함
- Gallery에 독립 version, release, ownership이 필요함
- 별도 package가 내부 build target보다 소비 또는 테스트 비용을 실질적으로 낮춤
