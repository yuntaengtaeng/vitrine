# ADR 012: 프리뷰는 일반 문서 흐름에 padding만 두고 렌더링한다

- 상태: 채택
- 날짜: 2026-11-06

## 맥락

frame root는 flex 컨테이너(`justify-content: center`, `align-items: flex-start`)로 프리뷰를 가운데에 두었다.
flex item은 내용 너비로 줄어들기 때문에, 앱에서는 부모 너비를 채우는 header, 배너, 목록 안의 카드 같은 block
컴포넌트가 프리뷰에서는 좁게 보였다. setup file이나 `preview()` wrapper가 DOM 요소를 렌더링하면 그 요소도
줄어들어 `width: 100%` 컴포넌트까지 좁아졌다.

사용성 연구에서 6명 모두 앱과 프리뷰가 다르게 보이는 경우를 만났고 Vitrine은 아무 안내도 하지 않았다.
앱에서는 고친 레이아웃이 프리뷰에서는 계속 깨져 보이거나, 고친 결과가 보이지 않는 경우도 있었다.

## 결정

- frame root는 일반 문서 흐름에 `2rem` padding만 둔다. block 요소는 너비를 채우고, 작은 요소는 왼쪽 위에
  놓인다. padding은 자식 margin이 root 밖으로 겹쳐 높이 측정이 어긋나는 것도 막는다.
- 배치를 고르는 `preview()` 옵션이나 plugin 옵션은 두지 않는다. 가운데 정렬은 setup file이나
  `preview(Component, { wrapper })`의 flex wrapper로 할 수 있다.
- wrapper는 자신이 어느 보기에서 렌더링되는지 모르므로, 전체 wrapper로 가운데 정렬하면 Variants, Matrix,
  History 칸도 가운데에 놓인다. 이 한계는 README에 밝힌다.

## 결과

- 앱의 부모 요소 안에서와 같은 너비로 컴포넌트가 보인다.
- 작은 컴포넌트는 무대 가운데가 아니라 왼쪽 위에 보인다. 가운데를 원하면 wrapper가 필요하다.
- fragment로 여러 형제를 반환하는 컴포넌트는 더 이상 가로로 나란히 놓이지 않는다. inset 없는
  `position: absolute` 요소는 왼쪽 위로 옮겨진다.

## 재검토 조건

- 보기마다 다른 배치(예: Single은 가운데, 격자 칸은 채움)를 원하는 요구가 많아 wrapper로는 부족함
- 일반 문서 흐름으로도 앱과 다르게 보이는 흔한 경우가 확인됨
