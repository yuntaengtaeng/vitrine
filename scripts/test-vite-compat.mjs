import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

/** 저장소 루트 경로 */
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** 운영체제별 pnpm 실행 파일 */
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

/** 고정 버전 호환성 package 디렉터리 */
const compatibilityRoot = path.join(repoRoot, "tests", "compat");

/** package.json이 존재하는 호환성 lane 경로 */
const laneRoots = fs
  .readdirSync(compatibilityRoot, { withFileTypes: true })
  .filter(
    (entry) => entry.isDirectory() && fs.existsSync(path.join(compatibilityRoot, entry.name, "package.json")),
  )
  .map((entry) => path.join(compatibilityRoot, entry.name))
  .sort();

/** build가 생성한 protocol runtime 계약 */
const protocol = await import(
  pathToFileURL(path.join(repoRoot, "packages", "protocol", "dist", "index.js")).href
);

/** build가 생성한 Vitrine Vite plugin */
const vitrine = (
  await import(pathToFileURL(path.join(repoRoot, "packages", "vite-plugin", "dist", "index.js")).href)
).default;

/** Windows cmd shim을 포함한 package command 실행 */
function runPackageCommand(command, args, options) {
  if (process.platform !== "win32") return execFileSync(command, args, options);
  return execFileSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", command, ...args], options);
}

/** 호환성 package에 선언된 정확한 dependency 버전 조회 */
function getExactVersion(lanePackage, dependencyName) {
  const version = lanePackage.dependencies?.[dependencyName] ?? lanePackage.devDependencies?.[dependencyName];
  assert.match(
    version ?? "",
    /^\d+\.\d+\.\d+$/,
    `${lanePackage.name} must pin ${dependencyName} to an exact version`,
  );
  return version;
}

for (const laneRoot of laneRoots) {
  /** 로그와 오류 메시지에 사용하는 호환성 lane 이름 */
  const laneName = path.basename(laneRoot);

  /** 설치 환경과 기대 버전을 함께 소유하는 lane package manifest */
  const lanePackage = JSON.parse(fs.readFileSync(path.join(laneRoot, "package.json"), "utf8"));

  /** 현재 lane의 node_modules를 기준으로 package를 해석하는 require */
  const laneRequire = createRequire(path.join(laneRoot, "package.json"));

  /** 현재 lane에 실제 설치된 Vite module */
  const vite = await import(pathToFileURL(laneRequire.resolve("vite")).href);

  /** 현재 lane에 실제 설치된 React module */
  const react = laneRequire("react");

  /** 현재 lane에 실제 설치된 TypeScript module */
  const typescript = laneRequire("typescript");

  /** 현재 Vite major와 조합되는 React plugin */
  const reactPlugin = (await import(pathToFileURL(laneRequire.resolve("@vitejs/plugin-react")).href)).default;

  /** 실제 사용자 프로젝트를 모사하는 격리된 임시 fixture */
  const fixtureRoot = fs.mkdtempSync(path.join(laneRoot, ".vitrine-compat-"));

  /** 종료 단계에서도 접근할 Vite 개발 서버 */
  let server;

  try {
    assert.equal(react.version, getExactVersion(lanePackage, "react"));
    assert.equal(vite.version, getExactVersion(lanePackage, "vite"));
    assert.equal(typescript.version, getExactVersion(lanePackage, "typescript"));

    // TypeScript type 검사와 Vitrine preview 탐색에 함께 사용하는 최소 React component fixture
    fs.mkdirSync(path.join(fixtureRoot, "src"));
    fs.writeFileSync(
      path.join(fixtureRoot, "src", "Smoke.tsx"),
      '/** @preview name="Smoke/Card" */\nexport function Smoke() {\n  return <button>Smoke</button>;\n}\n',
    );
    fs.writeFileSync(
      path.join(fixtureRoot, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          jsx: "react-jsx",
          module: "ESNext",
          moduleResolution: "Bundler",
          noEmit: true,
          strict: true,
          target: "ES2022",
        },
        include: ["src"],
      }),
    );

    // lane의 TypeScript로 fixture type 검사
    runPackageCommand(pnpmCommand, ["exec", "tsc", "-p", path.join(fixtureRoot, "tsconfig.json")], {
      cwd: laneRoot,
      stdio: "inherit",
    });

    // lane의 Vite와 React plugin에 배포 대상 Vitrine plugin을 결합한 개발 서버 실행
    server = await vite.createServer({
      root: fixtureRoot,
      configFile: false,
      logLevel: "silent",
      plugins: [reactPlugin(), vitrine()],
      server: { host: "127.0.0.1", port: 0, strictPort: true },
    });
    await server.listen();

    const address = server.httpServer?.address();
    assert.ok(address && typeof address === "object", `${laneName} did not bind a port`);

    /** 운영체제가 배정한 임시 port 기반 서버 주소 */
    const baseUrl = `http://127.0.0.1:${address.port}`;

    /** 응답 대기 제한과 connection 정리를 적용한 HTTP 요청 */
    const request = (url) =>
      fetch(url, {
        headers: { connection: "close" },
        signal: AbortSignal.timeout(10_000),
      });

    // Gallery HTML과 browser entry virtual module 제공 여부 검증
    const galleryResponse = await request(`${baseUrl}${protocol.GALLERY_ROUTE}`);
    assert.equal(galleryResponse.status, 200);
    assert.match(await galleryResponse.text(), /id="vitrine-root"/);

    const galleryModuleResponse = await request(
      `${baseUrl}/@id/${protocol.GALLERY_MODULE_ID}`,
    );
    assert.equal(galleryModuleResponse.status, 200);
    assert.match(await galleryModuleResponse.text(), /createRoot/);

    // Scanner가 발견한 component virtual module 제공 여부 검증
    const previewsModuleResponse = await request(
      `${baseUrl}/@id/__x00__${protocol.PREVIEWS_MODULE_ID}`,
    );
    assert.equal(previewsModuleResponse.status, 200);
    assert.match(await previewsModuleResponse.text(), /src\/Smoke\.tsx#Smoke/);

    /** 초기 scan 완료까지 polling한 preview manifest */
    let manifest = [];
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const manifestResponse = await request(`${baseUrl}${protocol.MANIFEST_ROUTE}`);
      assert.equal(manifestResponse.status, 200);
      manifest = await manifestResponse.json();
      if (manifest.length > 0) break;
      await delay(100);
    }

    // HTTP 경계의 manifest schema와 preview annotation 해석 결과 검증
    assert.equal(protocol.isManifest(manifest), true);
    assert.equal(manifest.length, 1);
    assert.equal(manifest[0].id, "src/Smoke.tsx#Smoke");
    assert.equal(manifest[0].group, "Smoke");
    assert.equal(manifest[0].name, "Card");

    // lane runtime에서 변환한 TSX module의 React element 생성 여부 검증
    const smokeModule = await server.ssrLoadModule("/src/Smoke.tsx");
    const element = smokeModule.Smoke();
    assert.equal(element.type, "button");

    console.log(`Compatibility lane ${laneName} passed`);
  } finally {
    // 실패 여부와 관계없는 server connection과 임시 fixture 정리
    server?.httpServer?.closeAllConnections?.();
    if (server) await Promise.race([server.close(), delay(1_000)]);
    fs.rmSync(fixtureRoot, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }
}
