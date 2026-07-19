import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const patches = [
  {
    file: "node_modules/@opennextjs/aws/dist/plugins/edge.js",
    search: '/\\.(mjs|wasm)$/',
    replace: '/\\.(mjs|wasm|node)$/',
  },
  {
    file: "node_modules/@opennextjs/cloudflare/dist/cli/build/patches/plugins/wrangler-external.js",
    search: '/(\\.bin|\\.wasm(\\?module)?)$/',
    replace: '/(\\.bin|\\.wasm(\\?module)?|\\.node)$/',
  },
];

for (const { file, search, replace } of patches) {
  const content = readFileSync(file, "utf-8");
  const patched = content.replace(search, replace);
  if (patched !== content) {
    writeFileSync(file, patched);
    console.log(`Patched ${file.split("/").pop()} to handle .node files`);
  }
}

execSync("npx @opennextjs/cloudflare build", { stdio: "inherit" });
