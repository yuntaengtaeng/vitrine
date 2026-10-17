export interface PreviewFailure {
  message: string;
  stack?: string;
}

/** 메시지를 먼저 보여주므로 V8 stack 첫머리의 `Name: message` 반복을 뺀 호출 위치, 남는 게 없으면 null */
export function stackFrames(failure: PreviewFailure): string | null {
  const stack = failure.stack ?? "";
  const headerEnd = stack.indexOf(failure.message);
  const frames = headerEnd >= 0 && failure.message ? stack.slice(headerEnd + failure.message.length) : stack;
  const trimmed = frames.replace(/^\s*\n/, "").trimEnd();
  return trimmed.length > 0 ? trimmed : null;
}
