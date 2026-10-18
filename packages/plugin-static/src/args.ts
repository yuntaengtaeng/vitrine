export const USAGE = `Usage: vitrine-static build [root] [--config <file>]

Builds the Vitrine Gallery into static files using your Vite config.
Register vitrineStatic() in vitrine({ plugins }) first.`;

export type ParsedArgs =
  | { ok: true; root?: string; configFile?: string }
  /** message가 없으면 도움말 요청 */
  | { ok: false; message?: string };

/** CLI 인자 해석, 명령은 build 하나 */
export function parseArgs(argv: string[]): ParsedArgs {
  const [command, ...rest] = argv;
  if (command === undefined || command === "--help" || command === "-h") return { ok: false };
  if (command !== "build") return { ok: false, message: `Unknown command: ${command}` };

  let root: string | undefined;
  let configFile: string | undefined;
  for (let index = 0; index < rest.length; index++) {
    const arg = rest[index];
    if (arg === "--help" || arg === "-h") return { ok: false };
    if (arg === "--config" || arg === "-c") {
      configFile = rest[++index];
      if (!configFile) return { ok: false, message: "--config needs a file path" };
    } else if (arg.startsWith("-")) {
      return { ok: false, message: `Unknown option: ${arg}` };
    } else if (root === undefined) {
      root = arg;
    } else {
      return { ok: false, message: `Unexpected argument: ${arg}` };
    }
  }
  return { ok: true, root, configFile };
}
