import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

function p(msg) {
  console.log(`\n=== ${msg} ===\n`);
}

function emptyModule(path) {
  if (existsSync(path)) {
    writeFileSync(path, "export default {};\n");
    console.log(`  ✓ Emptied ${path}`);
  } else {
    console.log(`  - Not found: ${path}`);
  }
}

function patch(file, transforms) {
  try {
    let content = readFileSync(file, "utf-8");
    const original = content;
    for (const [search, replace] of transforms) {
      content = content.replace(search, replace);
    }
    if (content !== original) {
      writeFileSync(file, content);
      console.log(`  ✓ Patched ${file.split("/").pop()}`);
    } else {
      console.log(`  ∼ ${file.split("/").pop()} already correct`);
    }
  } catch (e) {
    console.log(`  - Skipping ${file.split("/").pop()}: ${e.message}`);
  }
}

p("1/5 Build Next.js app");
execSync("npx next build", { stdio: "inherit" });

p("2/5 Empty native module entry points");
for (const file of [
  "node_modules/sharp/lib/sharp.js",
  "node_modules/onnxruntime-node/dist/binding.js",
  ".next/standalone/node_modules/sharp/lib/sharp.js",
  ".next/standalone/node_modules/onnxruntime-node/dist/binding.js",
]) {
  emptyModule(file);
}

p("3/5 Patch edge.js (first esbuild pass)");
patch("node_modules/@opennextjs/aws/dist/plugins/edge.js", [
  ["(mjs|wasm|node)$/g", "(mjs|wasm|node)$/"],
  ["(mjs|wasm)$/g", "(mjs|wasm|node)$/"],
  ["(mjs|wasm)$/", "(mjs|wasm|node)$/"],
]);

p("4/5 Patch wrangler-external.js (second esbuild pass)");
patch(
  "node_modules/@opennextjs/cloudflare/dist/cli/build/patches/plugins/wrangler-external.js",
  [
    // Add .node to onResolve filter (try multiple formats)
    ["(\\.bin|\\.wasm\\?module)", "(\\\\.bin|\\\\.wasm\\\\?module|\\\\.node)"],
    ["(\\\\\\\\.bin|\\\\\\\\.wasm\\\\\\?module)", "(\\\\\\\\.bin|\\\\\\\\.wasm\\\\\\?module|\\\\\\\\.node)"],
  ],
);
patch(
  "node_modules/@opennextjs/cloudflare/dist/cli/build/patches/plugins/wrangler-external.js",
  [
    // Add .node-specific onLoad BEFORE the general one
    [
      "build.onLoad({ filter: /.*/, namespace }, async ({ path }) => {",
      `build.onLoad({ filter: /\\.node$/, namespace }, async () => ({ contents: 'export default {};' }));
build.onLoad({ filter: /.*/, namespace }, async ({ path }) => {`,
    ],
    // Minified variant
    [
      "build.onLoad({filter:/.*/,namespace},async({path})=>{",
      `build.onLoad({filter:/\\.node$/,namespace},async()=>({contents:'export default {};'}));
build.onLoad({filter:/.*/,namespace},async({path})=>{`,
    ],
  ],
);

p("5/5 Run OpenNext Cloudflare build (skip next build)");
execSync("npx @opennextjs/cloudflare build --skipBuild", {
  stdio: "inherit",
  env: { ...process.env, SKIP_NEXT_APP_BUILD: "true" },
});

console.log("\n✓ Build complete!\n");
