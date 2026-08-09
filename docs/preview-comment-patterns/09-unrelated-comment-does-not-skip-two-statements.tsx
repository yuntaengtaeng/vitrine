// 스캔 안 됨, 0개 엔트리
// export default Foo; 형태는 한 칸 앞 문장까지만 허용되는 예외라(07번 참고),
// 두 칸 이상 앞선 A 위의 주석이 아래 export default B;로 건너뛰어 잡히면 안 됨
/** @preview */
const A = () => null;

const B = () => null;

export default B;
