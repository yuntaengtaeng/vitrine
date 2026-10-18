import fs from "node:fs";
import http from "node:http";
import path from "node:path";

// 정적 빌드 결과를 하위 경로에 올렸을 때도 동작하는지 보려고 /gallery/ 아래에 서빙
const [, , dir, port] = process.argv;
const PREFIX = "/gallery/";
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml" };

http
  .createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    if (!url.pathname.startsWith(PREFIX)) {
      res.writeHead(404).end();
      return;
    }
    const relative = url.pathname.slice(PREFIX.length) || "index.html";
    const file = path.resolve(dir, relative);
    if (!file.startsWith(path.resolve(dir)) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] ?? "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  })
  .listen(Number(port));
