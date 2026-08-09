// 스캔됨, 라벨은 참조하는 로컬 식별자 이름을 사용, 라벨 "Tag"
// 주석이 export default Tag; 바로 위에 붙어있어서 Babel의 leadingComments로
// 바로 잡힘, 폴백 없이도 동작
const Tag = () => null;

/** @preview */
export default Tag;
