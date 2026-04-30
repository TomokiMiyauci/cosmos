import { build, emptyDir, type EntryPoint } from "@deno/dnt";
import denoJson from "../deno.json" with { type: "json" };

interface DenoJson {
  exports: string | Record<string, string>;
}

function toEntryPoints(json: DenoJson): EntryPoint[] {
  if (typeof json.exports === "string") {
    return [{
      name: ".",
      path: json.exports,
    }];
  }

  return Object.entries(json.exports).map(([key, value]) => {
    return {
      name: key,
      path: value,
    } satisfies EntryPoint;
  });
}

await emptyDir("./npm");

await build({
  entryPoints: toEntryPoints(denoJson),
  outDir: "./npm",
  shims: {},
  package: {
    name: "@TomokiMiyauci/protocol-graphql",
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
    "../../core/src/mod.ts": {
      name: "@TomokiMiyauci/cosmos",
      version: Deno.args[0],
    },
  },
  typeCheck: false,
});
