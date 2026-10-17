import { Component, type ReactNode } from "react";
import { ErrorText } from "./ErrorText";

/** 클래스 컴포넌트만 에러 바운더리를 구현할 수 있어서 훅으로 대체 불가 */
export class PreviewErrorBoundary extends Component<
  { children?: ReactNode; onError?: (error: Error) => void },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }

  render() {
    if (this.state.error) {
      return <ErrorText>{String(this.state.error.stack ?? this.state.error.message)}</ErrorText>;
    }
    return this.props.children;
  }
}
