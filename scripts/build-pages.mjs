import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const patches = [
  {
    file: "node_modules/@opennextjs/aws/dist/plugins/edge.js",
    transforms: [
      ["(mjs|wasm|node)$/g", "(mjs|wasm|node)$/"],
      ["(mjs|wasm)$/g", "(mjs|wasm|node)$/"],
      ["(mjs|wasm)$/", "(mjs|wasm|node)$/"],
    ],
  },
  {
    file: "node_modules/@opennextjs/cloudflare/dist/cli/build/patches/plugins/wrangler-external.js",
    transforms: [
      ["(\\.bin|\\.wasm\\?module)$", "(\\.bin|\\.wasm\\?module|\\.node)$"],
    ],
  },
];

for (const { file, transforms } of patches) {
  try {
    let content = readFileSync(file, "utf-8");
    const original = content;
    for (const [search, replace] of transforms) {
      content = content.replace(search, replace);
    }
    if (content !== original) {
      writeFileSync(file, content);
      console.log(`Patched ${file.split("/").pop()}`);
    } else {
      console.log(`${file.split("/").pop()} already correct`);
    }
  } catch (e) {
    console.log(`Skipping ${file}: ${e.message}`);
  }
}

execSync("npx @opennextjs/cloudflare build", { stdio: "inherit" });
