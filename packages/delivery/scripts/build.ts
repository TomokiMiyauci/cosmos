import { build, emptyDir } from "@deno/dnt";

await emptyDir("./npm");

await build({
  entryPoints: ["./src/mod.ts", {
    name: "./asset",
    path: "./src/middleware/asset.ts",
  }],
  outDir: "./npm",
  shims: {},
  package: {
    name: "@TomokiMiyauci/delivery",
    version: Deno.args[0],
    publishConfig: {
      "@TomokiMiyauci:registry": "https://npm.pkg.github.com",
    },
    repository: {
      type: "git",
      url: "git+https://github.com/TomokiMiyauci/cosmos.git",
    },
  },
  mappings: {
    "../core/src/mod.ts": {
      name: "@TomokiMiyauci/cosmos",
      version: Deno.args[0],
    },
    "../node/walker/src/mod.ts": {
      name: "@TomokiMiyauci/node-walker",
      version: Deno.args[0],
    },
  },
  typeCheck: false,
});
