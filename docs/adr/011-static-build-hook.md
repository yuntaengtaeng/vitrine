# ADR 011: 첫 plugin hook은 정적 Gallery 빌드 요청

- 상태: 채택, Plugin API는 `0.x` 동안 실험 단계
- 날짜: 2026-10-18

## 맥락

[ADR 005](./005-plugin-architecture.md)는 선택 기능을 `vitrine({ plugins })`에 등록하는 Vitrine plugin으로
제공하고, 확장 지점은 첫 공식 plugin인 정적 Gallery 빌드를 구현하며 정하기로 했다.

정적 빌드에 필요한 일은 두 종류다.

- Gallery와 frame 문서, 프리뷰 목록 virtual module, Gallery 설정을 build 결과로 내보내는 일. 모두 코어가
  만들고 서빙하는 asset이라 plugin이 직접 만들면 코어 내부 구현에 기대게 된다 (ADR 005 재검토 조건).
- 언제 이 build를 실행할지, 결과를 어디에 어떤 base로 둘지 정하는 일. 배포 방식에 따라 달라지는 선택이다.

FAQ는 Vitrine이 사용자의 production build를 바꾸지 않는다고 약속한다. 사용자가 평소 `vite build`를 실행할
때는 Gallery가 끼어들면 안 된다.

## 결정

Vitrine plugin의 첫 hook은 `staticBuild`다.

```ts
interface VitrinePlugin {
  name: string;
  staticBuild?: () => { outDir: string; base: string } | null;
}
```

- 코어는 Vite plugin을 만들 때 등록된 plugin의 `staticBuild()`를 묻는다. 값을 돌려준 plugin이 없으면 코어는
  지금처럼 dev server에만 적용되고 `vite build`에는 관여하지 않는다.
- 값을 받으면 코어가 이번 `vite build`를 Gallery 빌드로 바꾼다. 입력은 Gallery(`index.html`)와
  frame(`frame.html`) 두 문서뿐이고, 사용자의 `build.lib`, 입력, `external` 같은 앱 build 설정은 병합하지 않고
  바꾼다. 라이브러리 모드로 React를 external로 둔 설정이 그대로 남으면 Gallery가 브라우저에서 React를 찾지
  못한다.
- 정적 Gallery는 Gallery 설정 module로 dev server 전용 기능이 없음을 안다. frame 주소는 Gallery 기준 상대
  경로이고, Open in editor와 스냅샷 히스토리는 꺼진다. HMR 코드는 build에서 `import.meta.hot`이 없어 동작하지
  않는다.
- `vitrine-plugin-static`은 `vitrine-static build` 명령을 제공한다. 명령은 `VITRINE_STATIC_BUILD=1`을 설정하고
  사용자의 Vite config로 Vite `build()`를 실행하며, plugin의 `staticBuild()`는 이 값이 있을 때만 설정을
  돌려준다. 사용자 config도 같은 값으로 앱 전용 Vite plugin을 끌 수 있다.
- 명령은 build 전에 config를 읽어 Vitrine이 이번 build를 맡는지 확인한다. 등록을 빠뜨린 채 실행하면 앱이
  그대로 build되는 대신 등록 방법을 안내하고 실패한다.

## 대안

- `vite build --mode vitrine`으로 실행: 명령은 줄지만 mode가 바뀌어 `.env.production` 대신 `.env.vitrine`을
  읽고, mode로 분기하는 사용자 config가 앱과 다르게 동작한다.
- plugin이 Gallery asset을 직접 내보냄: 코어의 HTML, virtual module, 설정 형식에 plugin이 묶여 코어를 바꿀
  때마다 plugin도 함께 바뀐다.
- 범용 hook(Vite plugin 추가, 설정 변경)부터 공개: 쓰는 곳 없는 확장 지점을 미리 공개하지 않는다는 ADR 005와
  어긋난다. 다음 공식 plugin이 필요로 할 때 더한다.

## 결과

- 사용자는 평소 `vite build`와 별개로 `vitrine-static build`로 배포용 Gallery를 만든다.
- 정적 Gallery를 위한 분기는 코어 안에 있고, plugin package는 명령과 배포 설정만 가진다.
- `VITRINE_STATIC_BUILD`와 `staticBuild` hook 모양은 공개 계약이 되어 바꾸면 changelog에 이전 방법을 적는다.

## 재검토 조건

- 두 번째 공식 plugin이 build 외의 확장 지점(Gallery toolbar, 패널, manifest 보강)을 필요로 함
- 정적 Gallery에서도 dev server 전용 기능 일부를 대체할 방법이 생김 (예: 빌드 시점 스냅샷)
- Vite가 하나의 config로 여러 build를 선언하는 공식 방법을 제공해 별도 명령이 필요 없어짐
