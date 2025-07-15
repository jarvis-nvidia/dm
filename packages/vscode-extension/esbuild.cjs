// @ts-check
const esbuild = require('esbuild');
const { copyFileSync, existsSync, mkdirSync } = require('fs');
const { join } = require('path');

/** @typedef {import('esbuild').BuildOptions} BuildOptions */

/** @type BuildOptions */
const baseConfig = {
  entryPoints: ['./src/extension.ts'],
  bundle: true,
  outfile: './dist/extension.js',
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  target: 'node16',
  sourcemap: true,
  logLevel: 'info',
};

// Check if dist directory exists and create if not
if (!existsSync('./dist')) {
  mkdirSync('./dist');
}

// Handle command line args
const args = process.argv.slice(2);
const isProduction = args.includes('--production');
const isWatch = args.includes('--watch');

/** @type BuildOptions */
const buildConfig = {
  ...baseConfig,
  minify: isProduction,
  sourcemap: !isProduction,
};

// Build function
async function build() {
  try {
    const startTime = Date.now();

    if (isWatch) {
      // Start watch mode
      const context = await esbuild.context(buildConfig);
      await context.watch();
      console.log('Watching for changes...');
    } else {
      // Do one-time build
      await esbuild.build(buildConfig);

      console.log(`Build completed in ${Date.now() - startTime}ms`);
    }
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
}

// Execute build
build();
