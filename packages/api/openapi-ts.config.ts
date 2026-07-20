import type { UserConfig } from "@hey-api/openapi-ts";
export default {
  input: "./openapi.yaml",
  output: {
    path: "src/generated",
    module: {
      extension: ".ts",
    },
  },
  plugins: [{ name: "orpc", validator: true }, "zod"],
} satisfies UserConfig;
