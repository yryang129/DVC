import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

function staticAssets() {
  return {
    name: "static-assets",
    async generateBundle() {
      this.emitFile({ type: "asset", fileName: "index.html", source: await readFile("index.html") });
      this.emitFile({ type: "asset", fileName: "styles.css", source: await readFile("src/styles.css") });
      const emitDirectory = async (sourceDirectory, outputDirectory) => {
        const entries = await readdir(sourceDirectory, { withFileTypes: true });
        for (const entry of entries) {
          const sourcePath = path.join(sourceDirectory, entry.name);
          const outputPath = path.posix.join(outputDirectory, entry.name);
          if (entry.isDirectory()) {
            await emitDirectory(sourcePath, outputPath);
            continue;
          }
          if (!entry.isFile()) continue;
          this.emitFile({ type: "asset", fileName: outputPath, source: await readFile(sourcePath) });
        }
      };
      await emitDirectory("public/assets", "assets");
    },
  };
}

export default {
  input: "src/main.tsx",
  output: {
    dir: "dist",
    format: "es",
    entryFileNames: "assets/app.js",
    sourcemap: true,
    intro: 'const process = { env: { NODE_ENV: "production" } };',
  },
  onwarn(warning, warn) {
    if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
    warn(warning);
  },
  plugins: [
    nodeResolve({ browser: true }),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.app.json",
      compilerOptions: {
        noEmit: false,
        declaration: false,
        declarationMap: false,
        sourceMap: true,
      },
    }),
    staticAssets(),
  ],
};
