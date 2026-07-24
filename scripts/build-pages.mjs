import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const patchedFiles = [];

function ps(file, transforms) {
  try {
    let content = readFileSync(file, "utf-8");
    const original = content;
    for (const [search, replace] of transforms) {
      content = content.replace(search, replace);
    }
    if (content !== original) {
      writeFileSync(file, content);
      patchedFiles.push(file);
      console.log(`  ✓ Patched ${file.split("/").pop()}`);
    } else {
      console.log(`  ∼ ${file.split("/").pop()} already correct`);
    }
  } catch (e) {
    console.log(`  - Skipping ${file.split("/").pop()}: ${e.message}`);
  }
}

console.log("\n=== [1/5] Build Next.js app ===\n");
execSync("npx next build", { stdio: "inherit" });

console.log("\n=== [2/5] Empty native module entry points ===\n");
for (const file of [
  "node_modules/sharp/lib/sharp.js",
  "node_modules/onnxruntime-node/dist/binding.js",
]) {
  try {
    writeFileSync(file, "export default {};\n");
  } catch (e) {
    console.log(`  - Skipping ${file}: ${e.message}`);
  }
}

console.log("\n=== [3/5] Patch edge.js (first esbuild pass) ===\n");
ps("node_modules/@opennextjs/aws/dist/plugins/edge.js", [
  ["(mjs|wasm|node)$/g", "(mjs|wasm|node)$/"],
  ["(mjs|wasm)$/g", "(mjs|wasm|node)$/"],
  ["(mjs|wasm)$/", "(mjs|wasm|node)$/"],
]);

console.log("\n=== [4/5] Patch wrangler-external.js (second esbuild pass) ===\n");
const wranglerPath =
  "node_modules/@opennextjs/cloudflare/dist/cli/build/patches/plugins/wrangler-external.js";
try {
  let content = readFileSync(wranglerPath, "utf-8");
  const original = content;

  content = content.replace(
    /build\.onLoad\(\{\s*filter:\s*\/\.\*\/\s*,\s*namespace\s*\},/,
    `build.onLoad({ filter: /\\.node$/, namespace }, async () => ({ contents: 'export default {};' }));
build.onLoad({ filter: /.*/, namespace },`,
  );

  if (content !== original) {
    writeFileSync(wranglerPath, content);
    patchedFiles.push(wranglerPath);
    console.log("  ✓ Patched wrangler-external.js");
  } else {
    console.log("  ∼ wrangler-external.js already correct");
  }
} catch (e) {
  console.log(`  - Skipping wrangler-external.js: ${e.message}`);
}

console.log("\n=== [5/5] Run OpenNext Cloudflare build ===\n");
execSync("npx @opennextjs/cloudflare build --skipBuild", {
  stdio: "inherit",
  env: { ...process.env, SKIP_NEXT_APP_BUILD: "true" },
});

console.log("\n✓ Build complete!\n");
