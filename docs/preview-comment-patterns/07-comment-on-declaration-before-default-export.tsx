// 스캔됨, 라벨 "Chip"
// 주석이 export default Chip; 이 아니라 그 앞 const Chip = ...; 위에 붙어있어서
// Babel의 leadingComments는 이 주석을 const 문장 쪽으로 붙임, export default
// 쪽에서는 findPreviewComment의 위치 기반 폴백이 한 칸 앞(바로 이 const 문장)
// 까지 건너뛰어 잡아내는 것, export default Foo; 형태에서만 허용되는 유일한
// 예외 케이스임 (packages/vite-plugin/src/scan.ts의 getPrecedingStatementEnd 참고)
/** @preview */
const Chip = () => null;

export default Chip;
