import path from "node:path";
import { build, resolveConfig } from "vite";
import { STATIC_BUILD_ENV } from "./index.js";
import { parseArgs, USAGE } from "./args.js";

const args = parseArgs(process.argv.slice(2));
if (!args.ok) {
  console.error(args.message ? `${args.message}\n\n${USAGE}` : USAGE);
  process.exit(args.message ? 1 : 0);
}

process.env[STATIC_BUILD_ENV] = "1";
const inline = { root: args.root, configFile: args.configFile };

// 등록을 빠뜨리면 그대로 앱이 build되므로, Vitrine이 이번 build를 맡는지 먼저 확인
// vite build와 같은 mode와 NODE_ENV로 읽어야 이어지는 build가 개발용 React를 묶지 않음
const config = await resolveConfig(inline, "build", "production", "production");
if (!config.plugins.some((plugin) => plugin.name === "vitrine")) {
  console.error(
    "[vitrine-static] Add vitrineStatic() to vitrine({ plugins }) in your Vite config, then run this command again.",
  );
  process.exit(1);
}

await build(inline);
const outDir = path.resolve(config.root, config.build.outDir);
console.log(`\n[vitrine-static] Gallery written to ${path.relative(process.cwd(), outDir) || "."}`);
