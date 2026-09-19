import { build, type Plugin } from "esbuild";
import { dtsPlugin } from "esbuild-plugin-d.ts";
import { resolve } from "@std/path";
import { denoPlugin } from "@deno/esbuild-plugin";

const plugin = {
  name: "css-module-script",
  setup(build): void {
    build.onLoad({ filter: /\.css$/ }, (args) => {
      const content = Deno.readTextFileSync(args.path);

      return {
        loader: "ts",
        contents: `const sheet = new CSSStyleSheet();
sheet.replaceSync(${JSON.stringify(content)});
export default sheet;
`,
      };
    });
  },
} satisfies Plugin;

await build({
  minify: false,
  outdir: "./dist",
  format: "esm",
  entryPoints: [resolve("./src/mod.ts")],
  plugins: [
    plugin,

    dtsPlugin({
      experimentalBundling: true,
      tsconfig: {
        compilerOptions: {
          emitDeclarationOnly: true,
          allowImportingTsExtensions: true,
          module: "ESNext",
          jsx: "react-jsx",
          noCheck: true,
          rootDir: resolve("../.."),
          paths: {
            "@miyauci/util": ["../../util/src/mod.ts"],
            "@cosmos/schema": ["../../schema/src/mod.ts"],
            "@cosmos/schema-field": ["../../schema_field/src/mod.ts"],
          },
        },
      },
    }),

    denoPlugin(),
  ],
  sourcemap: true,
  bundle: true,
  packages: "external",
  jsx: "automatic",
  external: [
    "react*",
    "react-dom",
    "@b9g*",
    "@std*",
    "@cosmos/schema-field",
    "@miyauci/*",
  ],
  platform: "neutral",
});
