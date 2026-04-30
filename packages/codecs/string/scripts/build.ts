import { build, emptyDir } from "@deno/dnt";

await emptyDir("./npm");

await build({
  entryPoints: ["./src/mod.ts"],
  outDir: "./npm",
  shims: {},
  package: {
    name: "@TomokiMiyauci/codec-string",
    version: Deno.args[0],
    publishConfig: {
      "@TomokiMiyauci:registry": "https://npm.pkg.github.com",
    },
    repository: {
      type: "git",
      url: "git+https://github.com/TomokiMiyauci/cosmos.git",
    },
  },
  typeCheck: false,
  mappings: {
    "../../core/src/mod.ts": {
      name: "@TomokiMiyauci/cosmos",
      version: Deno.args[0],
    },
    "../../node/builder/src/mod.ts": {
      name: "@TomokiMiyauci/node-builder",
      version: Deno.args[0],
    },
  },
});
