import type { SchemaConfig } from "@cosmos/config";

export default {
  type: "map",
  props: {
    site_name: {
      required: true,
      to: "string",
    },
  },
} satisfies SchemaConfig;
