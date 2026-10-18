import { Component, type ReactNode } from "react";
import { ErrorText } from "../ErrorText";

interface Props {
  children?: ReactNode;
  /** 바뀌면 잡아 둔 에러를 버리고 다시 렌더링, Gallery에서 값을 되돌려 복구할 수 있게 함 */
  resetKey: string;
  onError: (error: Error) => void;
  /** 에러 없이 마운트되거나 에러 뒤 복구됐을 때, Fast Refresh는 실패한 바운더리를 새로 마운트함 */
  onRendered: () => void;
}

/** 클래스 컴포넌트만 에러 바운더리를 구현할 수 있어서 훅으로 대체 불가 */
export class PreviewErrorBoundary extends Component<Props, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  componentDidMount() {
    if (!this.state.error) this.props.onRendered();
  }

  componentDidUpdate(prevProps: Props, prevState: { error: Error | null }) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) this.setState({ error: null });
    if (prevState.error && !this.state.error) this.props.onRendered();
  }

  render() {
    if (this.state.error) {
      return <ErrorText>{String(this.state.error.stack ?? this.state.error.message)}</ErrorText>;
    }
    return this.props.children;
  }
}
