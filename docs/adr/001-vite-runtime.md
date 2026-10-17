# ADR 001: Vite를 component rendering runtime으로 사용

- 상태: 채택, 정적 Gallery 빌드 예외는 ADR 005
- 날짜: 2026-08-22

## 맥락

프리뷰 대상 component는 사용자의 Vite project 설정, module graph, dependency, React instance,
Fast Refresh 환경 안에서 실행되어야 한다. VS Code extension host나 webview가 이를 별도로
재현하면 두 번째 bundler와 module resolution 체계가 필요하다.

## 결정

Component loading, 변환, HMR, rendering은 Vite dev server가 담당한다. VS Code extension은
server를 찾고 webview iframe을 연결하며 editor state를 전달하는 adapter로 유지한다.

## 결과

- Gallery와 previewed component가 host project의 React와 Vite module graph를 공유한다.
- Extension에는 React/TypeScript parsing이나 bundling 책임을 두지 않는다.
- Extension과 gallery가 통신하는 wire contract는 별도로 명시해야 한다.
- Vite dev server는 사용자가 직접 실행한다.
- 배포용 정적 Gallery는 [ADR 005](./005-plugin-architecture.md)의 선택 plugin이 `vite build`로
  만든다. 렌더링 책임은 계속 Vite에 있다.

## 재검토 조건

- Vite 외 runtime 지원이 실제 제품 범위에 들어옴
- editor 안에서 Vite server 없이 동작해야 한다는 요구가 생김
- iframe 대신 다른 rendering isolation이 필요해 현재 연결 모델이 성립하지 않음

