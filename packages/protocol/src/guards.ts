// protocol 내부 validator가 공유하는 값 판별 helper, public entry에서는 export하지 않음

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

export function isPositiveSafeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

export function isPort(value: unknown): value is number {
  return isPositiveSafeInteger(value) && value <= 65_535;
}

export function isControlOption(value: unknown): value is string | number {
  return typeof value === "string" || (typeof value === "number" && Number.isFinite(value));
}

export function isDefaultValue(value: unknown): value is string | number | boolean {
  return typeof value === "string" || typeof value === "boolean" || isControlOption(value);
}
