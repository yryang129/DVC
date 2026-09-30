import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";

const root = path.resolve("dist");
const port = Number(process.env.PORT || 4173);
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp4": "video/mp4",
  ".svg": "image/svg+xml",
};

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
  const requested = path.resolve(root, `.${pathname}`);
  let file = requested.startsWith(root) ? requested : path.join(root, "index.html");
  if (!existsSync(file) || statSync(file).isDirectory()) file = path.join(root, "index.html");
  response.setHeader("Content-Type", types[path.extname(file)] ?? "application/octet-stream");
  response.setHeader("Cache-Control", "no-store");
  createReadStream(file).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`DVC estimator is running at http://127.0.0.1:${port}`);
});
