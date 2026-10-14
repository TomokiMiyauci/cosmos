import type { SchemaConfig } from "@cosmos/content-config";

export default {
  type: "map",
  props: {
    name: {
      to: "string",
    },
  },
} satisfies SchemaConfig;
