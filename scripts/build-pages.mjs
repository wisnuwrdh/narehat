import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

const originals = {};

function patch(file, transforms) {
  try {
    let content = readFileSync(file, "utf-8");
    if (!originals[file]) originals[file] = content;
    const base = content;
    for (const [search, replace] of transforms) {
      content =
        typeof search === "string"
          ? content.replaceAll(search, replace)
          : content.replace(search, replace);
    }
    if (content !== base) {
      writeFileSync(file, content);
      console.log(`  ✓ ${file.split("/").pop()}`);
    } else {
      console.log(`  ∼ ${file.split("/").pop()} already correct`);
    }
  } catch (e) {
    console.log(`  - ${file.split("/").pop()}: ${e.message}`);
  }
}

function restoreAll() {
  for (const [file, original] of Object.entries(originals)) {
    writeFileSync(file, original);
  }
}

try {
  console.log("\n=== [1/5] Build Next.js app ===\n");
  execSync("npx next build", { stdio: "inherit" });

  console.log("\n=== [2/5] Empty native module entry points ===\n");
  for (const file of [
    "node_modules/sharp/lib/sharp.js",
    "node_modules/onnxruntime-node/dist/binding.js",
    ".next/standalone/node_modules/sharp/lib/sharp.js",
    ".next/standalone/node_modules/onnxruntime-node/dist/binding.js",
  ]) {
    if (existsSync(file)) {
      writeFileSync(file, "export default {};\n");
      console.log(`  ✓ ${file.split("/").pop()}`);
    } else {
      console.log(`  - ${file.split("/").pop()} not found`);
    }
  }

  console.log("\n=== [3/5] Patch edge.js (mjs|wasm → mjs|wasm|node) ===\n");
  patch("node_modules/@opennextjs/aws/dist/plugins/edge.js", [
    ["(mjs|wasm|node)$/g", "(mjs|wasm|node)$/"],
    ["(mjs|wasm)$/g", "(mjs|wasm|node)$/"],
    ["(mjs|wasm)$/", "(mjs|wasm|node)$/"],
  ]);

  console.log("\n=== [4/5] Patch wrangler-external.js (v1.20.2) ===\n");
  patch(
    "node_modules/@opennextjs/cloudflare/dist/cli/build/patches/plugins/wrangler-external.js",
    [
      [
        "(\\.bin|\\.wasm(\\?module)?)",
        "(\\\\.bin|\\\\.wasm(\\\\?module)?|\\\\.node)",
      ],
    ],
  );
  patch(
    "node_modules/@opennextjs/cloudflare/dist/cli/build/patches/plugins/wrangler-external.js",
    [
      [
        "build.onLoad({ filter: /.*/, namespace }, async ({ path }) => {",
`build.onLoad({ filter: /\\.node$/, namespace }, async () => ({ contents: 'export default {};' }));
build.onLoad({ filter: /.*/, namespace }, async ({ path }) => {`,
      ],
    ],
  );

  console.log("\n=== [5/5] Run OpenNext Cloudflare build (skip next build) ===\n");
  execSync("npx @opennextjs/cloudflare build --skipBuild", {
    stdio: "inherit",
    env: { ...process.env, SKIP_NEXT_APP_BUILD: "true" },
  });

  console.log("\n✓ Build succeeded!\n");
} finally {
  console.log("\n=== Restoring patched files ===\n");
  restoreAll();
}
