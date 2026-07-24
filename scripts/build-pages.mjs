import path from "node:path";
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, renameSync, existsSync, cpSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";

const isAndroid = process.platform === "android";
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
  console.log("\n=== [1/7] Patch build.js — empty native mods after next build ===\n");
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

  console.log("\n=== [2/7] Patch edge.js (first pass) ===\n");
  patch("node_modules/@opennextjs/aws/dist/plugins/edge.js", [
    ["(mjs|wasm)$/", "(mjs|wasm|node)$/"],
  ]);

  console.log("\n=== [3/7] Patch wrangler-external.js (second pass) ===\n");
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
        `            build.onLoad({ filter: /.*/, namespace }, async ({ path }) => {`,
`            build.onLoad({ filter: /\\.node$/, namespace }, async () => ({ contents: 'export default {};' }));
            build.onLoad({ filter: /.*/, namespace }, async ({ path }) => {`,
      ],
    ],
  );

  if (isAndroid) {
    console.log("\n=== [4/7] Patch @ast-grep/napi — mock native bindings on android arm64 ===\n");
    const astGrepPath = "node_modules/@ast-grep/napi/index.js";
    const origAstGrep = readFileSync(astGrepPath, "utf-8");
    originals[astGrepPath] = origAstGrep;
    writeFileSync(
      astGrepPath,
      readFileSync(path.resolve("scripts/ast-grep-mock.js"), "utf-8")
    );
    console.log("  ✓ @ast-grep/napi");
  }

  console.log(`\n=== [${isAndroid ? "5" : "4"}/7] Run OpenNext Cloudflare build ===\n`);
  const { build: buildImpl } = await import(
    path.resolve("node_modules/@opennextjs/cloudflare/dist/cli/build/build.js")
  );
  const { compileOpenNextConfig } = await import(
    path.resolve("node_modules/@opennextjs/aws/dist/build/compileConfig.js")
  );
  const { normalizeOptions } = await import(
    path.resolve("node_modules/@opennextjs/aws/dist/build/helper.js")
  );
  const { config, buildDir } = await compileOpenNextConfig(
    path.resolve("open-next.config.ts"),
    { compileEdge: true }
  );
  const require = createRequire(import.meta.url);
  const openNextDistDir = path.dirname(
    require.resolve("@opennextjs/aws/index.js")
  );
  const options = normalizeOptions(config, openNextDistDir, buildDir);
  const projectOpts = { skipNextBuild: isAndroid, minify: false, sourceDir: process.cwd() };
  const wranglerConfig = existsSync("wrangler.jsonc")
    ? JSON.parse(readFileSync("wrangler.jsonc", "utf-8"))
    : { compatibility_date: "2024-01-01", compatibility_flags: ["nodejs_compat"] };

  if (isAndroid) {
    // Run next build separately (shebang #!/usr/bin/env node fails on Termux)
    console.log("\n  → Running next build via node directly...\n");
    process.env.NEXT_PRIVATE_STANDALONE = "true";
    process.env.NEXT_PRIVATE_OUTPUT_TRACE_ROOT = options.monorepoRoot;
    execSync("node node_modules/next/dist/bin/next build", {
      stdio: "inherit",
      cwd: path.dirname(options.appPackageJsonPath),
    });
  }

  await buildImpl(options, config, projectOpts, wranglerConfig, true);

  console.log("\n=== [6/7] Rename worker.js → _worker.js for Pages ===\n");
  const workerPath = ".open-next/worker.js";
  const underscoreWorkerPath = ".open-next/_worker.js";
  if (existsSync(workerPath)) {
    renameSync(workerPath, underscoreWorkerPath);
    console.log("  ✓ _worker.js ready");
  } else {
    console.log("  - worker.js not found");
  }

  console.log("\n=== [7/7] Patch _worker.js to serve static assets + copy to root ===\n");
  // Add static asset serving via env.ASSETS before middleware
  if (existsSync(underscoreWorkerPath)) {
    let workerCode = readFileSync(underscoreWorkerPath, "utf-8");
    const search = `            // - \`Request\`s are handled by the Next server`;
    const insert = `            // Serve static assets from env.ASSETS (Cloudflare Pages)\n            if (url.pathname.startsWith("/_next/static/")) {\n                const asset = await env.ASSETS.fetch(request);\n                if (asset.status !== 404) return asset;\n            }\n            `;
    if (workerCode.includes(search)) {
      workerCode = workerCode.replace(search, insert + search);
      writeFileSync(underscoreWorkerPath, workerCode);
      console.log("  ✓ Patched _worker.js with static asset serving");
    }
  }
  const assetsDir = ".open-next/assets";
  if (existsSync(assetsDir)) {
    for (const entry of readdirSync(assetsDir)) {
      const src = `${assetsDir}/${entry}`;
      const dest = `.open-next/${entry}`;
      if (!existsSync(dest)) {
        cpSync(src, dest, { recursive: true });
        console.log(`  ✓ Copied ${entry}/ to root`);
      }
    }
  } else {
    console.log("  - assets/ not found");
  }

  console.log("\n✓ Build succeeded!\n");
} finally {
  console.log("\n=== Restore files ===\n");
  restoreAll();
}
