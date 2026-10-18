# Vitrine

Vitrine은 React export에 붙인 `/** @preview */`를 사용자의 Vite runtime에서 렌더링하고,
VS Code panel에 보여주는 도구다. 이 파일은 Claude Code, Codex 등 모든 coding agent의 공통
진입점이다.

## 문서

| 언제 | 문서 |
| --- | --- |
| 모든 작업 전 | [`CONTRIBUTING.md`](CONTRIBUTING.md): 제품 범위, runtime 원칙, 변경과 PR 기준 |
| 코드를 작성하거나 수정할 때 | [`docs/code-philosophy.md`](docs/code-philosophy.md): 코드 구조 판단 기준 |
| 구조나 경계를 판단할 때 | [`docs/architecture.md`](docs/architecture.md), 관련 [`docs/adr/`](docs/adr/) |
| 장애를 진단할 때 | [`docs/troubleshooting.md`](docs/troubleshooting.md) |

개발 절차, 주석 스타일, 배포 절차는 `.agents/skills/`의 skill이 소유한다. 주석을 한 줄이라도
쓰거나 고치기 전에는 반드시 `comment-style` skill을 읽는다. Claude Code는
`.claude/skills/`의 포인터로 같은 skill을 읽는다.

## 원칙

Vite가 component rendering을 담당하고 extension이 editor adapter로 남는 것은 안정적인 제품
방향이다. Package 수, module 경로, build asset 위치는 바뀔 수 있는 현재 상태이며
`docs/architecture.md`가 기록한다. Runtime 경계를 바꾸는 작업은 관련 ADR의 근거와 재검토
조건을 먼저 확인한다.

공통 사실은 이 파일이나 skill에 복사하지 않고 책임을 가진 문서 한 곳에서 관리한다. 코드와
문서가 다르면 실제 동작을 확인하고 그 문서를 갱신한다. `CONTRIBUTING.md`를 고치면
`CONTRIBUTING.ko.md`도 함께 고친다.

기존 사용자 변경을 보존하고, 요청이 없으면 commit하지 않는다.
