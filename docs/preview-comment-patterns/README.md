# `@preview` 주석 패턴

`packages/vite-plugin/src/scan.ts`가 실제로 어떻게 `@preview` 주석을 찾아서
매칭하는지, 코드 형태별로 정리한 참고 문서입니다. 이 폴더는 어떤 워크스페이스
패키지에도 속하지 않아서 (`pnpm-workspace.yaml` 대상 아님) 실제로 스캔되거나
빌드되지 않고, 순수하게 읽기용 예시입니다. 각 파일의 결과는
`packages/vite-plugin/src/scan.ts`의 `scanFile`을 직접 돌려서 검증한
값입니다 (직접 검증하려면 이 폴더의 파일을 `scanFile(file, root)`에 넣어
보면 됩니다).

## 스캔되는 패턴

| 파일 | 형태 | exportName | 라벨 |
| --- | --- | --- | --- |
| `01-named-const.tsx` | `export const Foo = ...` | `Foo` | `Foo` |
| `02-named-const-with-name-option.tsx` | `export const` + `name=...` | `Foo` | `name=` 값 |
| `03-named-function.tsx` | `export function Foo() {}` | `Foo` | `Foo` |
| `04-default-named-function.tsx` | `export default function Foo() {}` | `default` | 함수 자체 이름 `Foo` |
| `05-default-anonymous.tsx` | `export default () => ...` | `default` | 식별자가 없어서 파일 basename으로 폴백 |
| `06-default-referenced-identifier.tsx` | `const Foo = ...; export default Foo;`, 주석은 export 문 위 | `default` | 참조하는 식별자 `Foo` |
| `07-comment-on-declaration-before-default-export.tsx` | 위와 같지만 주석이 export 문이 아니라 `const` 선언 위 | `default` | 참조하는 식별자 |

`export default`는 `exportName`이 항상 문자열 `"default"`입니다 (동적
`import()`가 모듈 네임스페이스 객체에 노출하는 키와 맞춘 것), 라벨과
`exportName`이 같은 문자열인 건 named export일 때뿐입니다.

`06`과 `07`은 최종 결과(라벨 "Tag"/참조 식별자 이름)는 같지만 매칭 경로가
다릅니다:

- `06`: 주석이 `export default Tag;` 바로 위에 있어서 Babel의
  `leadingComments`로 바로 잡힙니다 (폴백 불필요).
- `07`: 주석이 `export default Chip;`이 아니라 그 앞 `const Chip = ...;`
  위에 있어서, `findPreviewComment`의 위치 기반 폴백이 한 칸 앞 문장까지
  건너뛰어 잡아냅니다. **이 한 칸 건너뛰기는 `export default Foo;` 형태에서만
  허용됩니다** — 선언과 export 문이 서로 다른 문장인 유일한 경우라서입니다.

## 스캔되지 않는 패턴 (수정된 버그의 회귀 테스트 역할)

| 파일 | 무엇을 확인하는가 |
| --- | --- |
| `08-unrelated-comment-does-not-skip-named-export.tsx` | `export const`/`export function`은 선언과 export가 한 문장이라 한 칸도 건너뛸 수 없음, 앞선 무관한 `const` 위 주석이 뒤 `export const`에 잘못 매칭되면 안 됨 |
| `09-unrelated-comment-does-not-skip-two-statements.tsx` | `export default Foo;`도 한 칸까지만 허용, 두 칸 이상 앞선 무관한 문장 위 주석까지 건너뛰면 안 됨 |

두 파일 모두 `scanFile`을 돌리면 빈 배열이 나와야 정상입니다. 예전에는
`findPreviewComment`의 폴백에 하한선이 전혀 없어서 (`08`) 또는 하한선이
모든 export 형태에 균일하게 적용돼서 (`09`, PR 리뷰에서 지적받음) 두
경우 다 잘못된 export에 매칭되는 버그가 있었습니다. 자세한 경위는
`LESSONS.md`를 참고하세요. 동작하는 코드로는
`packages/vite-plugin/src/scan.ts`의 `getPrecedingStatementEnd`,
회귀 테스트로는 `packages/vite-plugin/src/scan.test.ts`의 "named export
comment fallback scope"와 "scan export default" 스위트를 참고하세요.
