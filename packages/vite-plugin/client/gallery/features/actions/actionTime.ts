const pad = (value: number, length = 2) => String(value).padStart(length, "0");

/** 같은 초 안의 연속 호출도 구분되게 밀리초까지 */
export function formatActionTime(at: number): string {
  const time = new Date(at);
  return `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}.${pad(time.getMilliseconds(), 3)}`;
}
