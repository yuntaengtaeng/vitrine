import { FRAME_PROTOCOL, isGalleryToFrameMessage, type FrameReadyMessage, type GalleryToFrameMessage } from "@vitrine/protocol";
import { describe, expect, it } from "vitest";
import { createGalleryFrameLink, toRenderMessage } from "./frameLink";

const SINGLE = { kind: "single" } as const;

const ready: FrameReadyMessage = {
  type: "frameReady",
  protocol: FRAME_PROTOCOL,
  controls: {},
  variants: [],
  initialVariantKey: null,
  defaultArgs: {},
  variantArgs: {},
  componentName: "Button",
  defaultFrameOnlyArgs: [],
  variantFrameOnlyArgs: {},
};

describe("createGalleryFrameLink", () => {
  it("frame 준비 전에는 보내지 않고 최신 상태 하나만 준비 직후 전송", () => {
    const sent: GalleryToFrameMessage[] = [];
    const link = createGalleryFrameLink((message) => sent.push(message));

    link.render({ variantKey: "primary", args: { label: "one" }, layout: SINGLE });
    link.render({ variantKey: "danger", args: { label: "two" }, layout: SINGLE });
    expect(sent).toEqual([]);

    link.receive(ready);
    expect(sent).toEqual([toRenderMessage({ variantKey: "danger", args: { label: "two" }, layout: SINGLE })]);
  });

  it("준비된 뒤의 상태 변경은 바로 전송", () => {
    const sent: GalleryToFrameMessage[] = [];
    const link = createGalleryFrameLink((message) => sent.push(message));
    link.receive(ready);

    link.render({ variantKey: null, args: { count: 2 }, layout: SINGLE });
    expect(sent).toHaveLength(1);
    expect(sent[0].args).toEqual({ count: 2 });
  });

  it("frame이 다시 뜨면 최신 상태를 다시 전송", () => {
    const sent: GalleryToFrameMessage[] = [];
    const link = createGalleryFrameLink((message) => sent.push(message));
    link.render({ variantKey: null, args: { count: 1 }, layout: SINGLE });
    link.receive(ready);
    link.receive(ready);
    expect(sent).toHaveLength(2);
  });

  it("계약에 맞지 않는 메시지는 null로 무시", () => {
    const link = createGalleryFrameLink(() => {});
    expect(link.receive({ type: "frameReady", protocol: FRAME_PROTOCOL + 1 })).toBeNull();
    expect(link.receive("hello")).toBeNull();
    expect(link.receive({ type: "frameSize", height: 40 })).toEqual({ type: "frameSize", height: 40 });
  });
});

describe("Gallery와 frame 왕복", () => {
  it("MessageChannel로 frame 준비 전 상태가 유실되지 않고 마지막 상태만 도착", async () => {
    const channel = new MessageChannel();
    const galleryPort = channel.port1;
    const framePort = channel.port2;
    const received: unknown[] = [];

    const link = createGalleryFrameLink((message) => galleryPort.postMessage(message));
    galleryPort.addEventListener("message", (event) => link.receive(event.data));
    const firstRender = new Promise<void>((resolve) => {
      framePort.addEventListener("message", (event) => {
        if (isGalleryToFrameMessage(event.data)) received.push(event.data.args);
        resolve();
      });
    });
    galleryPort.start();
    framePort.start();

    link.render({ variantKey: null, args: { label: "draft" }, layout: SINGLE });
    link.render({ variantKey: null, args: { label: "final" }, layout: SINGLE });
    framePort.postMessage(ready);

    await firstRender;
    galleryPort.close();
    framePort.close();
    expect(received).toEqual([{ label: "final" }]);
  });
});
