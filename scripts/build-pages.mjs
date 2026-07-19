import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

console.log("Removing .node native binary files...");
execSync('find node_modules -name "*.node" -type f -delete', { stdio: "inherit" });
console.log("Done removing .node files");

const edgeJs = "node_modules/@opennextjs/aws/dist/plugins/edge.js";
const edgeContent = readFileSync(edgeJs, "utf-8");
const patched = edgeContent
  .replace("(mjs|wasm|node)$/g", "(mjs|wasm|node)$/")
  .replace("(mjs|wasm)$/g", "(mjs|wasm|node)$/")
  .replace("(mjs|wasm)$/", "(mjs|wasm|node)$/");
if (patched !== edgeContent) {
  writeFileSync(edgeJs, patched);
  console.log("Patched edge.js to handle .node files (no g flag)");
}

execSync("npx @opennextjs/cloudflare build", { stdio: "inherit" });
