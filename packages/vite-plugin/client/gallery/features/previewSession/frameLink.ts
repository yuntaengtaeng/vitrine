import {
  FRAME_PROTOCOL,
  FRAME_READY_MESSAGE_TYPE,
  FRAME_RENDER_MESSAGE_TYPE,
  isFrameToGalleryMessage,
  type FrameArgs,
  type FrameControl,
  type FrameGlobalValues,
  type FrameLayout,
  type FrameRenderMessage,
  type FrameToGalleryMessage,
  type FrameVariant,
  type GalleryToFrameMessage,
} from "@vitrine/protocol";

/** Gallery가 고른 variant와 바꾼 값 */
export interface FrameSelection {
  variantKey: string | null;
  args: FrameArgs;
}

/** 지금 보기의 배치 함수 */
export interface LayoutInput {
  variants: readonly FrameVariant[];
  controls: Record<string, FrameControl>;
  variantKey: string | null;
  overrides: FrameArgs;
}

export type LayoutFor = (input: LayoutInput) => FrameLayout;

/** Gallery가 frame에 그리게 할 상태 */
export interface FrameRenderState extends FrameSelection {
  layout: FrameLayout;
  globals: FrameGlobalValues;
}

/** Gallery 상태를 frame render 메시지로 변환 */
export function toRenderMessage(state: FrameRenderState): FrameRenderMessage {
  return {
    type: FRAME_RENDER_MESSAGE_TYPE,
    protocol: FRAME_PROTOCOL,
    variantKey: state.variantKey,
    args: state.args,
    layout: state.layout,
    globals: state.globals,
  };
}

/** Gallery 쪽 frame 연결 */
export interface GalleryFrameLink {
  /** 그릴 상태 갱신, frame이 준비 전이면 최신 상태만 보관 */
  render(state: FrameRenderState): void;
  /** 받은 값을 검증해 frame 메시지로 반환 (계약에 맞지 않으면 null), frameReady면 보관한 상태 전송 */
  receive(data: unknown): FrameToGalleryMessage | null;
}

/** frame 준비 전에는 최신 render 상태 하나만 보관했다가 준비되면 보내는 연결 생성 (frame이 다시 뜨면 다시 전송) */
export function createGalleryFrameLink(send: (message: GalleryToFrameMessage) => void): GalleryFrameLink {
  let ready = false;
  let latest: FrameRenderMessage | null = null;

  return {
    render: (state) => {
      latest = toRenderMessage(state);
      if (ready) send(latest);
    },
    receive: (data) => {
      if (!isFrameToGalleryMessage(data)) return null;
      if (data.type === FRAME_READY_MESSAGE_TYPE) {
        ready = true;
        if (latest) send(latest);
      }
      return data;
    },
  };
}
