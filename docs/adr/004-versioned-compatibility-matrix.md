# ADR 004: 고정 버전 compatibility matrix 운영

- 상태: 채택
- 날짜: 2026-08-22

## 맥락

Plugin은 사용자의 Vite runtime에서 실행되므로 저장소의 기본 개발 버전 하나로는 공개 peer
dependency 범위를 검증할 수 없다. 반대로 모든 작업에서 여러 조합을 실행하면 feedback이 느려진다.
`minimum`, `latest` 같은 lane 이름은 시간이 지나면 다른 버전을 뜻하게 되어 과거 지원 범위의
회귀 여부를 알기 어렵다.

## 결정

호환성 환경은 `tests/compat/` 아래 독립 workspace package로 관리하고, lane 이름에 major 조합을
명시한다(`react18-vite6-ts56`). 각 lane의 `package.json`이 React, Vite, TypeScript의 정확한
버전과 기대 버전의 단일 원본이다. 새 major 지원은 기존 lane을 갱신하지 않고 새 lane 추가로
표현한다.

`pnpm run test:compat`은 호환성 경계를 바꾸는 변경과 release 전에만 실행한다. 세부 실행 조건은
`vitrine-dev` skill이 소유한다.

## 결과

- 저장소 기본 catalog version과 공개 지원 범위를 분리한다.
- 미래 major 추가가 기존 lane의 의미를 바꾸지 않는다.

## 재검토 조건

- Lane 수가 늘어 local 실행 시간이 일상 개발을 방해함
- CI provider의 matrix 기능이 package 기반 runner보다 명확한 격리를 제공함
- Major별 fixture 동작이 달라 공통 smoke fixture로 검증할 수 없음
- 지원 종료 정책이 생겨 lane 제거 기준이 필요함
