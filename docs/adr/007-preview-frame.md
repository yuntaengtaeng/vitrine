# ADR 007: 프리뷰는 iframe frame에서 렌더링하고 Gallery는 사용자 코드를 실행하지 않는다

- 상태: 채택
- 날짜: 2026-10-18

## 맥락

Gallery는 사용자 컴포넌트, 그 컴포넌트가 import한 CSS, setup file을 Gallery UI와 같은 문서에서
실행해 왔다. 이 구조에는 다음 문제가 있다.

- 미디어 쿼리는 문서 창 너비를 따르므로 프리뷰 영역 너비를 바꿔도 breakpoint가 반응하지 않는다.
  Tailwind의 반응형 class처럼 대부분의 반응형 스타일이 이 경우에 해당한다.
- 사용자 전역 CSS와 reset이 Gallery UI에 섞이고, 반대로 Gallery가 프리뷰에 영향을 줄 수 있다.
- 컴포넌트의 렌더 실패나 전역 부수 효과가 Gallery 전체에 번진다.

2026-10-18 스파이크에서 별도 frame 페이지를 iframe으로 띄워 확인했다. iframe 너비에 따른 미디어
쿼리 반응, 부모 CSS 차단, frame 안 HMR과 Fast Refresh, 부모가 보낸 args 반영 시 Provider와
컴포넌트 state 유지, frame 하나 안의 variant 격자, frame 단위 에러 격리가 모두 동작했고 frame
부팅은 약 100~125ms였다.

## 결정

프리뷰는 plugin이 제공하는 `/__vitrine/frame?id=<preview id>` 페이지를 iframe으로 띄워 렌더링한다.
렌더링과 번들링은 계속 사용자의 Vite가 담당한다([ADR 001](./001-vite-runtime.md)).

### 역할

- **Frame**은 setup file, 프리뷰 컴포넌트와 `preview()` 설정을 로드하고 렌더링한다. 함수나 JSX를
  포함한 원본 args는 frame만 가진다.
- **Gallery**는 사용자 모듈을 import하지 않는다. 사이드바, 머리말, toolbar, Props 패널과 사용자가
  고른 값(바꾼 args, variant, 너비, 배경, 이후 globals)만 가진다.

### 메시지 계약

메시지 타입과 runtime validator는 `@vitrine/protocol`이 소유한다. 이름은 기존 메시지와 같은
camelCase를 쓰고, 정수 `protocol` 값으로 형식이 깨지는 변경을 구분한다.

| 방향 | 메시지 | 내용 |
| --- | --- | --- |
| Gallery -> Frame | `frameRender` | 지금 그릴 상태 전체. variant, 사용자가 바꾼 args, layout. 마지막 메시지가 이긴다 |
| Frame -> Gallery | `frameReady` | variant 목록, `preview()` override를 반영한 control 정보, 직렬화 가능한 초기 args |
| Frame -> Gallery | `frameSize` | 렌더링된 내용 높이 |
| Frame -> Gallery | `frameError` | 로드나 렌더 실패의 message와 stack |

- `frameRender`는 명령이 아니라 상태다. 새 기능은 이 상태에 필드를 더하는 방식으로 붙인다.
- 배치는 데이터로 표현한다. `layout`은 `{ kind: "single" }` 또는 `{ kind: "grid", cells }`이고,
  Variants 보기와 Prop matrix는 cells만 다르게 보낸다.
- 이후 Actions 같은 기능은 Frame -> Gallery 메시지를 추가해 붙인다.

### 통신과 높이 규칙

- `postMessage`는 채널 모듈 한 곳에서만 다룬다. 보낸 창과 origin을 확인하고 validator를 통과한
  메시지만 처리하며 모르는 메시지는 무시한다.
- Gallery는 `frameReady` 전까지 보낼 상태를 쌓지 않고 최신 상태 하나만 보관했다가 준비되면 보낸다.
- 높이는 frame이 렌더 root 요소를 `ResizeObserver`로 재서 보고하고 Gallery는 iframe 높이로만 쓴다.
- 너비 프리셋은 iframe 너비를 바꾼다.

### 코드 구조

- `client/gallery/`, `client/frame/`, 둘이 공유하는 순수 로직 `client/preview/`로 나눈다.
- Gallery와 frame은 각각 별도 bundle로 build하고 plugin이 virtual module로 제공한다.

### 테스트

- protocol validator와 세션 규칙(준비 전 최신 상태 보관, 받은 상태로 args 계산)은 DOM 없는 순수
  함수로 테스트한다.
- Gallery와 frame 사이 왕복은 Node의 `MessageChannel`로 브라우저 없이 테스트한다.
- frame 페이지는 단독으로 열어도 렌더링되어 frame만 e2e로 확인할 수 있게 한다.
- iframe의 준비 상태를 DOM 속성으로 드러내 e2e가 준비를 명시적으로 기다린다.

## 결과

- Breakpoint와 반응형 스타일이 실제 앱과 같은 조건에서 동작한다.
- 사용자 CSS와 Gallery UI가 서로 영향을 주지 않고, 프리뷰 실패가 frame 안에 머문다.
- Gallery가 사용자 코드를 실행하지 않으므로 setup file 로딩과 복구 처리도 frame이 맡는다.
- 프리뷰를 바꿀 때 frame 부팅 비용(약 0.1초)이 생긴다.
- 비동기 통신과 높이 동기화를 관리해야 하며, e2e는 frame 안을 다룬다.
- [ADR 005](./005-plugin-architecture.md)의 정적 Gallery 빌드는 frame 페이지도 함께 build한다.
- Gallery와 VS Code 확장 사이 통신([ADR 006](./006-capability-handshake.md))은 바뀌지 않는다.

## 재검토 조건

- frame 부팅 비용이 프리뷰 전환이나 Prop matrix에서 체감될 만큼 커짐
- iframe 경계 때문에 지원해야 할 사용 사례(예: 프리뷰와 Gallery가 같은 전역 상태를 공유해야 함)가
  실제로 생김
- frame 메시지가 상태 하나로 표현되지 않는 명령형 요구로 늘어남
