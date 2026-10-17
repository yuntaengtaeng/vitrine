# ADR 006: Gallery와 VS Code 확장은 capability handshake로 기능을 맞춘다

- 상태: 채택, 구현은 처음 필요한 기능에서 함
- 날짜: 2026-10-18

## 맥락

Vite plugin(npm)과 VS Code 확장(Marketplace)은 따로 배포되고 사용자도 따로 업데이트한다. Gallery와
확장 사이에 새 메시지가 필요한 기능(Save as variant, 테마 동기화 등)이 생기면 "새 plugin과 옛 확장"
또는 그 반대 조합에서 버튼은 보이지만 눌러도 아무 일이 없는 상태가 생긴다. 일부만 동작하는 기능은
제공하지 않는다는 원칙과 맞지 않는다.

[ADR 002](./002-protocol-and-public-package.md)는 runtime을 독립 배포해 version negotiation이
필요해지면 재검토하도록 정했다. 이 결정이 그 재검토의 결과다.

## 결정

Gallery가 VS Code webview 안에서 시작하면 자신이 할 수 있는 기능 목록을 확장에 보내고, 확장은 자신이
할 수 있는 목록으로 답한다. Gallery는 양쪽이 모두 지원하는 기능만 화면에 보여준다.

```ts
// Gallery -> webview relay -> 확장
{ type: "capabilitiesRequest", protocol: 1, capabilities: { "selection.sync": 1, "variant.save": 1, "theme.sync": 1 } }

// 확장 -> webview relay -> Gallery
{ type: "capabilitiesResponse", protocol: 1, capabilities: { "selection.sync": 1 } }
```

- `protocol`은 메시지 형식이나 handshake 자체가 깨지는 변경에만 올리는 정수다. 양쪽 값이 다르면
  Gallery는 확장이 필요한 기능을 모두 숨기고 패널 상단에 업데이트 안내를 한 줄 보여준다.
- capability 이름은 `영역.동작` 형식이고 값은 그 기능의 버전이다. 기능은 양쪽 중 낮은 버전으로
  동작한다. Plugin이 추가하는 기능은 `plugin.<name>.<동작>` 형식을 쓴다.
- 모르는 capability는 무시한다. 어느 쪽이 먼저 업데이트되어도 handshake가 깨지지 않는다.
- 정해진 시간 안에 응답이 없으면 빈 목록으로 본다. 옛 확장의 relay는 모르는 type을 전달하지 않으므로
  옛 확장과 함께 쓰면 자연스럽게 이 경우가 된다. 브라우저 단독 사용도 같다.
- 메시지 type 이름은 기존 메시지(`switchProject`, `previewSelected`, `selectPreview`)와 같은
  camelCase를 쓰고, 타입과 runtime validator는 `@vitrine/protocol`이 소유한다.
- 기존 커서 동기화(`selection.sync`)는 handshake 이전부터 있던 기능이므로 응답이 없어도 지금처럼
  동작한다. Handshake는 이후 추가되는 기능에만 적용한다.

구현은 처음 handshake가 필요한 기능(Gallery 다크 모드의 `theme.sync`)과 함께 한다.

## 결과

- 사용자는 어떤 버전 조합에서도 동작하지 않는 버튼을 보지 않는다.
- 새 메시지 기능을 추가할 때 capability 이름과 버전을 함께 정해야 한다.
- 확장의 webview relay가 handshake 메시지를 통과시키도록 허용 목록을 관리해야 한다.
- 브라우저 단독 사용에서는 확장이 필요한 기능이 항상 숨겨진다.

## 재검토 조건

- 기능별 버전 대신 기능의 세부 옵션까지 협상해야 하는 경우가 생김
- 확장 없이도 dev server와 직접 통신하는 다른 editor adapter가 생겨 같은 handshake를 공유해야 함
- capability 수가 늘어 Gallery의 표시 조건 관리가 복잡해짐
