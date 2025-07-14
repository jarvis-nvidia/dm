// esbuild.cjs
const esbuild = require("esbuild");

const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");

/**
 * Custom esbuild plugin for readable error logging
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
  name: "esbuild-problem-matcher",
  setup(build) {
    build.onStart(() => {
      console.log(`[esbuild] ▶ Build started (${production ? "prod" : "dev"})`);
    });
    build.onEnd((result) => {
      if (result.errors.length > 0) {
        console.error(`\n❌ Build completed with ${result.errors.length} error(s):\n`);
        result.errors.forEach(({ text, location }) => {
          console.error(`✘ ${text}`);
          if (location) {
            console.error(`   at ${location.file}:${location.line}:${location.column}`);
          }
        });
      } else {
        console.log("[esbuild] ✅ Build completed successfully\n");
      }
    });
  },
};

async function main() {
  const ctx = await esbuild.context({
    entryPoints: ["src/extension.ts"],
    bundle: true,
    format: "cjs",
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: "node",
    outfile: "dist/extension.js",
    external: ["vscode", "node-fetch"],
    logLevel: "silent",
    plugins: [esbuildProblemMatcherPlugin],
  });

  if (watch) {
    await ctx.watch();
    console.log("[esbuild] 👀 Watching for changes...");
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}

main().catch((err) => {
  console.error("❌ Build failed due to unexpected error:\n", err);
  process.exit(1);
});
