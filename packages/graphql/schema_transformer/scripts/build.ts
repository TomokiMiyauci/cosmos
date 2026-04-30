import { build, emptyDir } from "@deno/dnt";

await emptyDir("./npm");

await build({
  entryPoints: ["./src/mod.ts", {
    name: "./namer",
    path: "./src/plugins/namer/mod.ts",
  }],
  outDir: "./npm",
  shims: {},
  package: {
    name: "@TomokiMiyauci/graphql-schema-transformer",
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
});
