import type { SchemaConfig } from "@cosmos/config";

export default {
  type: "map",
  props: {
    name: {
      to: "string",
    },
  },
} satisfies SchemaConfig;
