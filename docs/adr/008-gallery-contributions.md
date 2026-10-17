# ADR 008: Gallery 화면은 보기, 패널 탭, toolbar 항목 등록으로 구성한다

- 상태: 채택, Gallery 내부 구조이며 plugin 공개 API는 5단계에서 정함
- 날짜: 2026-10-18

## 맥락

리뉴얼 2단계부터 Gallery 화면에 기능이 계속 붙는다. Variants 격자 보기, Code 패널, 이후 Actions,
Prop matrix, snapshot history가 같은 무대와 패널을 나눠 쓴다. 지금처럼 `Canvas`가 기능마다 조건과
props를 직접 이어 붙이면 기능이 늘 때마다 `Canvas`가 바뀌고, 기능끼리의 경계도 흐려진다.

[ADR 005](./005-plugin-architecture.md)는 선택 기능을 Vitrine plugin으로 제공하되, 쓰는 곳 없이
확장 지점을 미리 공개하지 않기로 했다. 코어 기능이 먼저 같은 방식으로 붙어 보면 나중에 공개할
확장 지점의 모양을 실제 사용으로 검증할 수 있다.

## 결정

Gallery 화면에는 세 가지 등록 지점을 둔다. 코어 기능도 모두 이 방식으로 붙는다.

| 등록 지점 | 하는 일 | 코어 기능 |
| --- | --- | --- |
| 보기(view) | 지금 상태를 frame에 보낼 `layout` 데이터로 바꿈 | Single, Variants |
| 패널 탭(panel tab) | 무대 아래 패널의 탭 하나를 그림 | Props, Code |
| toolbar 항목(toolbar item) | 무대 위 toolbar의 한 칸을 그림 | Variant 선택, 배경, viewport |

```ts
interface GalleryView {
  id: string;
  label: string;
  /** frame이 알려준 variant 목록으로 이 프리뷰에서 쓸 수 있는지 판단 */
  available: (variants: readonly FrameVariant[]) => boolean;
  /** 순수 함수, frame은 이 데이터로 그리고 Gallery는 사용자 코드를 실행하지 않음 */
  layout: (preview: PreviewState) => FrameLayout;
}

interface GalleryPanelTab {
  id: string;
  label: string;
  Panel: ComponentType<ContributionProps>;
}

interface GalleryToolbarItem {
  id: string;
  align: "start" | "end";
  Item: ComponentType<ContributionProps>;
}
```

- 기능 폴더는 등록을 모르는 컴포넌트와 순수 함수만 내보낸다. gallery 최상위 `contributions`
  module이 이를 등록 객체로 감싸 목록을 만들고 `Canvas`가 순서대로 그린다. 기능을 더할 때
  `Canvas`는 바뀌지 않는다. `ContributionProps`가 여러 기능의 타입을 묶으므로 기능 폴더가 이를
  알면 feature 경계를 넘게 된다.
- 등록한 컴포넌트는 같은 `ContributionProps`를 props로 받는다. 지금 프리뷰 상태와 조작
  (variant, 바꾼 값, 초기화), 무대 설정, 지금 보기가 들어 있다. React Context는 쓰지 않는다
  ([code-philosophy 5장](../code-philosophy.md#설정-props보다-조합-context는-마지막)).
- 보기는 화면을 직접 그리지 않고 frame에 보낼 데이터만 만든다. Variants는
  `{ kind: "grid", cells }`이고, 이후 Prop matrix도 cells만 다르게 만든다
  ([ADR 007](./007-preview-frame.md)).
- 이 프리뷰에서 쓸 수 있는 보기가 하나뿐이면 보기 전환을 숨기고, 탭이 하나뿐이면 탭 머리를
  숨긴다. 고른 보기를 쓸 수 없는 프리뷰에서는 첫 보기(Single)로 보여준다.
- 고른 보기와 탭은 무대 설정처럼 프리뷰를 바꿔도 유지한다.
- 확장(VS Code)이 있어야 하는 항목은 필요한 capability를 선언하고, handshake 결과에 없으면 등록
  목록에서 빠진다([ADR 006](./006-capability-handshake.md)). 2-4에서 구현한다.

### 공개하지 않는 것

이 타입들은 package에서 export하지 않는다. Plugin이 Gallery 화면을 더하는 방식은 첫 공식 plugin을
만드는 5단계에서 정한다. 그때 풀어야 할 문제는 다음과 같다.

- ADR 007은 Gallery가 외부 코드를 실행하지 않도록 했다. Plugin의 Gallery 코드를 Gallery 문서에서
  실행할지, 별도 frame에 격리할지 정해야 한다.
- `ContributionProps`는 공개되는 순간 계약이 되므로 그 전까지 자유롭게 바꾼다.

## 결과

- 새 화면 기능은 기능 폴더의 컴포넌트와 `contributions`의 등록 한 줄로 끝나고, `Canvas`와 다른
  기능은 바뀌지 않는다.
- 보기의 `layout`이 순수 함수라 frame 없이 단위 테스트한다.
- 등록 객체가 모든 기능에 같은 props를 넘기므로, 한 기능만 쓰는 값도 `ContributionProps`에 들어갈
  수 있다. 커지면 나눈다.

## 재검토 조건

- 기능 하나가 세 등록 지점 밖의 자리(사이드바, 머리말)를 필요로 함
- `ContributionProps`가 대부분의 기능이 쓰지 않는 값으로 커짐
- 5단계에서 plugin 화면을 Gallery 문서에서 실행할 수 없다고 결정해 등록 방식이 달라짐
