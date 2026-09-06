import type { UserConfig } from "@hey-api/openapi-ts";
export default {
  input: "./openapi.yaml",
  output: {
    path: "src/generated",
    module: {
      extension: ".ts",
    },
    entryFile: false,
  },
  plugins: [
    { name: "orpc", validator: true, contracts: "flat" },
    "zod",
    "@hey-api/typescript",
  ],
} satisfies UserConfig;
