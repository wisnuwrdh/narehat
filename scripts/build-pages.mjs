import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const pluginPath =
  "node_modules/@opennextjs/cloudflare/dist/cli/build/patches/plugins/wrangler-external.js";

let content = readFileSync(pluginPath, "utf-8");

const patched = content.replace(
  '/(\\.bin|\\.wasm(\\?module)?)$/',
  '/(\\.bin|\\.wasm(\\?module)?|\\.node)$/'
);

if (patched !== content) {
  writeFileSync(pluginPath, patched);
  console.log("Patched wrangler-external to handle .node files");
} else {
  console.log("wrangler-external already patched, skipping");
}

execSync("npx @opennextjs/cloudflare build", { stdio: "inherit" });
