# ADR 005: 선택 기능은 Vitrine plugin으로 제공

- 상태: 채택, 확장 지점의 구체 설계는 후속 문서에서 정함
- 날짜: 2026-10-17

## 맥락

정적 Gallery 빌드처럼 일부 사용자만 필요로 하는 기능 요구가 생겼다. Storybook에서 넘어오려는
팀은 Gallery를 정적 사이트로 배포해 리뷰하기를 원하지만, 대부분의 사용자에게는 필요 없는 코드와
dependency다. 이런 기능을 코어 package에 넣으면 쓰지 않는 사용자도 설치 크기와 유지 비용을 함께
부담한다.

Vitrine은 Vite plugin 생태계 위에서 동작하며, 사용자도 같은 방식으로 자기 필요에 맞게 기능을
더할 수 있기를 기대한다.

## 결정

Vitrine은 자체 plugin 등록 지점을 제공한다. 사용자는 Vite config 안에서 Vitrine에 plugin을
넘긴다.

```ts
vitrine({ plugins: [vitrineStatic()] });
```

- Vitrine plugin은 Vite plugin이 아니라 Vitrine이 정의한 hook을 가진 객체다. 코어는 이 hook을
  Vite lifecycle과 Gallery runtime에 연결한다.
- 코어에는 모든 사용자에게 필요한 기능만 둔다. 선택 기능은 별도 npm package의 공식 plugin으로
  제공한다. 첫 공식 plugin은 정적 Gallery 빌드다.
- 누구나 Vitrine plugin을 작성해 배포할 수 있다. 제3자 plugin의 호환성 유지는 작성자가 책임진다.
- Plugin API는 `0.x` 동안 실험 단계다. Plugin API의 breaking change는 `0.x`에서는 minor, `1.0`
  이후에는 major 버전에서만 하고 changelog에 이전 방법을 적는다. Plugin은 지원하는 코어 버전
  범위를 `peerDependencies`로 선언한다.
- 확장 지점(manifest 보강, Gallery toolbar와 패널, 프리뷰 wrapper, 빌드)은 첫 공식 plugin을
  구현하며 정하고 별도 설계 문서에 기록한다. 쓰는 곳 없이 확장 지점을 미리 공개하지 않는다.

정적 Gallery 빌드 plugin은 dev server 없이 배포 가능한 Gallery를 만든다.
[ADR 001](./001-vite-runtime.md)의 예외지만 렌더링과 번들링은 여전히 사용자의 Vite(`vite build`)가
담당하며, HMR, port file, 커서 동기화처럼 dev server에 기대는 기능은 정적 결과물에 포함하지 않는다.

## 결과

- 기본 사용자는 계속 `vite-plugin-react-vitrine` 하나만 설치한다. 선택 기능을 원하는 사용자만
  공식 plugin package를 추가 설치한다.
- 공개 package가 코어와 공식 plugin으로 늘어나며 버전과 호환 범위를 함께 관리해야 한다.
- Plugin API가 공개 계약이 되므로 Gallery 내부 구조를 바꿀 때 확장 지점에 미치는 영향을 함께
  검토한다.
- 제3자 plugin이 생기면 Vitrine 문서나 Gallery에서 공식 plugin과 구분해 표시한다.

## 재검토 조건

- 공식 plugin이 코어 내부 구현에 직접 의존해야만 동작함
- Plugin API의 잦은 breaking change로 제3자 plugin이 유지되지 못함
- 대부분의 사용자가 특정 공식 plugin을 함께 설치해 코어로 옮기는 편이 단순해짐
