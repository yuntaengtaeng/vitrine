const pad = (value: number, length = 2) => String(value).padStart(length, "0");

/** 시:분:초, 같은 초 안의 연속 기록을 구분해야 하면 밀리초까지 */
export function clockTime(at: number, options: { milliseconds?: boolean } = {}): string {
  const time = new Date(at);
  const seconds = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;
  return options.milliseconds ? `${seconds}.${pad(time.getMilliseconds(), 3)}` : seconds;
}
