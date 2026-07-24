import { readFileSync, writeFileSync, renameSync, existsSync } from "node:fs";
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
      console.log(`  ∼ ${file.split("/").pop()} already`);
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
  console.log("\n=== [1/5] Patch build.js — empty native mods after next build ===\n");
  patch(
    "node_modules/@opennextjs/cloudflare/dist/cli/build/build.js",
    [
      [
        "    }\n    // Make sure no Node.js middleware is used",
        [
          "    }",
          "    try {",
          `        const { writeFileSync: w, existsSync: e } = await import("node:fs");`,
          `        for (const f of ["node_modules/sharp/lib/sharp.js","node_modules/onnxruntime-node/dist/binding.js",".next/standalone/node_modules/sharp/lib/sharp.js",".next/standalone/node_modules/onnxruntime-node/dist/binding.js"]) {`,
          `            if (e(f)) { w(f, "export default {};\\n"); }`,
          "        }",
          "    } catch(_) {}",
          "    // Make sure no Node.js middleware is used",
        ].join("\n"),
      ],
    ],
  );

  console.log("\n=== [2/5] Patch edge.js (first pass) ===\n");
  patch("node_modules/@opennextjs/aws/dist/plugins/edge.js", [
    ["(mjs|wasm)$/", "(mjs|wasm|node)$/"],
  ]);

  console.log("\n=== [3/5] Patch wrangler-external.js (second pass) ===\n");
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

  console.log("\n=== [4/5] Run OpenNext Cloudflare build ===\n");
  execSync("npx @opennextjs/cloudflare build", { stdio: "inherit" });

  console.log("\n=== [5/5] Rename worker.js → _worker.js for Pages ===\n");
  const workerPath = ".open-next/worker.js";
  const underscoreWorkerPath = ".open-next/_worker.js";
  if (existsSync(workerPath)) {
    renameSync(workerPath, underscoreWorkerPath);
    console.log("  ✓ _worker.js ready");
  } else {
    console.log("  - worker.js not found");
  }

  console.log("\n✓ Build succeeded!\n");
} finally {
  console.log("\n=== [5/5] Restore files ===\n");
  restoreAll();
}
