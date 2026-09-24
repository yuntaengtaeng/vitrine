import type { Messages } from "./en";

export const ko: Messages = {
  meta: {
    title: "Vitrine: React 컴포넌트를 진열하세요",
    description:
      "React 컴포넌트 위에 /** @preview */를 붙이면, 내 Vite dev server가 렌더링한 실시간 갤러리가 에디터 옆에 나타납니다.",
  },
  header: {
    howItWorks: "사용법",
    features: "기능",
    docs: "문서",
    faq: "FAQ",
    getStarted: "시작하기",
    switchLanguage: "English",
  },
  hero: {
    label: "React와 Vite를 위한 컴포넌트 갤러리",
    titleLead: "내 컴포넌트를",
    titleAccent: "진열하세요.",
    lead: "export 바로 위에 주석 한 줄을 추가하세요. Vitrine이 내 Vite 개발 서버로 렌더링한 프리뷰를 에디터 옆에서 보여줍니다.",
    copy: "복사",
    copied: "복사됨",
    extension: "VS Code 확장 받기",
    demoHint: "프리뷰를 선택하면 갤러리가 바뀝니다",
  },
  demo: {
    editorTab: "Button.tsx",
    vitrineTab: "Vitrine",
    exhibitNumber: "No.",
    pause: "일시정지",
    play: "재생",
    ariaLabel: "@preview 주석이 있는 에디터입니다. 주석을 선택하면 갤러리 프리뷰가 바뀝니다.",
  },
  howItWorks: {
    label: "사용법",
    title: "주석 한 줄로 시작합니다.",
    lead: "컴포넌트는 내 Vite 설정 그대로 렌더링됩니다. alias, 플러그인, CSS, HMR도 앱과 같은 방식으로 동작합니다.",
    demoAria: "두 컴포넌트에 @preview 주석을 추가하면 갤러리 사이드바에 나타나고, 커서를 옮기면 프리뷰가 전환됩니다.",
    waitingForPreview: "@preview를 추가하면 컴포넌트가 나타납니다",
    scanningPreview: "프리뷰 업데이트 중",
    previewReady: "실시간",
    steps: [
      { title: "프리뷰 지정", medium: "/** @preview */", text: "export한 컴포넌트 바로 위에 주석을 추가합니다. 프리뷰는 컴포넌트 코드와 함께 관리합니다." },
      { title: "서버 실행", medium: "vite dev", text: "플러그인을 추가하고 평소처럼 개발 서버를 실행합니다. Vitrine은 개발 서버에서만 동작합니다." },
      { title: "갤러리 열기", medium: "/__vitrine", text: "브라우저에서 열거나 VS Code 확장으로 에디터 옆에 띄웁니다." },
    ],
  },
  features: {
    label: "기능",
    title: "프리뷰를 더 편하게 다루는 기능",
    items: [
      { id: "props", title: "Props 컨트롤", medium: "타입에서 자동 생성", text: "prop 타입으로 컨트롤을 만듭니다. 다른 파일에서 import한 타입도 해석합니다." },
      { id: "variants", title: "Variants", medium: "preview()", text: "이름 붙인 props 묶음을 만들고 갤러리에서 전환합니다." },
      { id: "cursor", title: "커서 따라가기", medium: "VS Code", text: "@preview export 위로 커서를 옮기면 패널이 그 프리뷰로 바뀝니다." },
      { id: "groups", title: "그룹", medium: 'name="Inputs/Button"', text: "이름에 슬래시를 넣으면 사이드바 그룹으로 정리됩니다." },
    ],
  },
  compatibility: {
    label: "호환성",
    title: "지금 쓰는 환경에 그대로 맞습니다.",
    lead: "React 18, 19와 Vite 6.4 이상을 지원합니다. 프리뷰는 내 Vite 설정으로 렌더링되어 alias, CSS, 플러그인이 앱과 같은 방식으로 동작합니다.",
  },
  docs: {
    meta: {
      title: "Vitrine 시작하기",
      description: "Vitrine을 설치하고 Vite에 연결해 첫 React 컴포넌트 프리뷰를 띄워보세요.",
    },
    label: "시작하기",
    title: "내 컴포넌트를 추가하세요.",
    lead: "기존 React와 Vite 앱에 네 단계로 Vitrine을 연결할 수 있습니다.",
    steps: [
      {
        title: "Plugin 설치",
        text: "앱의 개발 의존성으로 Vitrine을 추가합니다.",
      },
      {
        title: "Vite에 추가",
        text: "vite.config.ts에서 React 플러그인 옆에 vitrine()을 넣습니다. vite serve에서만 동작하며 프로덕션 빌드에는 아무것도 추가하지 않습니다.",
      },
      {
        title: "컴포넌트 표시",
        text: "export한 컴포넌트 바로 위에 주석을 추가합니다. export 이름이 갤러리 항목 이름이 됩니다.",
      },
      {
        title: "갤러리 열기",
        text: "평소처럼 개발 서버를 켠 다음 같은 주소의 /__vitrine을 엽니다.",
      },
    ],
    openGallery: "예를 들어 Vite가 5173 포트에서 시작됐다면 이 주소를 엽니다",
    declarations: {
      title: "프리뷰 선언과 그룹",
      lead: "export한 컴포넌트 바로 위에 @preview를 추가합니다. 이름을 따로 지정하지 않으면 export 이름이 사이드바에 표시됩니다.",
      rules: [
        "export const, export function, export default에 사용할 수 있습니다",
        "name=\"...\"으로 사이드바 이름을 바꿀 수 있습니다",
        "이름에 /를 넣으면 사이드바 그룹이 만들어집니다",
        "이름 없는 default export는 파일 이름으로 표시됩니다",
      ],
    },
    controls: {
      title: "Args, controls와 variants",
      lead: "Vitrine은 prop 타입으로 컨트롤을 자동 생성합니다. 샘플 값이나 다른 컨트롤, 이름 붙은 variant가 필요할 때 preview()를 사용합니다.",
      supported: "string, number, boolean과 문자열 또는 숫자 리터럴 유니온을 자동으로 지원하며 다른 파일에서 가져온 타입도 해석합니다.",
      options: [
        { name: "args", text: "prop 초기값" },
        { name: "controls", text: "text, number, boolean, select, radio 등 prop별 컨트롤 종류" },
        { name: "variants", text: "갤러리에서 선택할 수 있는 이름 붙은 args 묶음" },
        { name: "defaultVariant", text: "처음 선택할 variant" },
      ],
      note: "preview()는 메타데이터만 등록하며 컴포넌트를 감싸거나 바꾸지 않습니다.",
    },
    nextTitle: "에디터 옆에서 열기",
    nextText: "VS Code 확장을 설치하면 커서를 옮길 때 프리뷰도 함께 바뀝니다. 컨트롤, variant, 그룹과 플러그인 옵션은 전체 가이드에서 볼 수 있습니다.",
    extension: "VS Code 확장 설치",
    fullGuide: "전체 가이드 보기",
  },
  faq: {
    label: "FAQ",
    title: "자주 묻는 질문",
    items: [
      { question: "production 빌드가 바뀌나요?", answer: "아니요. plugin은 vite serve에서만 동작하고 빌드 결과에는 아무것도 추가하지 않습니다." },
      { question: "VS Code 확장이 꼭 필요한가요?", answer: "아니요. 갤러리는 어느 브라우저에서나 /__vitrine으로 열립니다. 확장은 커서를 따라가는 옆 패널을 더해줍니다." },
      { question: "프로젝트에 .vitrine 폴더가 생기는 이유는요?", answer: "확장이 dev server를 찾을 수 있도록 plugin이 포트를 기록합니다. 이 폴더는 스스로를 git에서 제외해서 커밋에 들어가지 않습니다." },
    ],
    reportIssue: {
      question: "문제가 생기면 어디에 알려야 하나요?",
      beforeLink: "React와 Vite 버전을 적어 ",
      link: "GitHub 이슈",
      afterLink: "를 열어주세요",
    },
  },
  footer: {
    tagline: "MIT 라이선스. React와 Vite를 위해 만들었습니다.",
    reportIssue: "문제 신고",
  },
};
