import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { "zesty-sdk": "zesty-sdk.ts" },
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    sourcemap: true,
    outExtension: ({ format }) => ({ js: format === "esm" ? ".mjs" : ".cjs" }),
  },
  {
    entry: { "zesty-sdk": "zesty-sdk.ts" },
    format: "iife",
    globalName: "ZestySdk",
    minify: true,
    outExtension: () => ({ js: ".min.js" }),
    sourcemap: true,
  },
]);
