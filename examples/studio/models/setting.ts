import type { ModelConfig } from "@cosmos/config";

export default {
  schema: {
    type: "map",
    props: {
      site_name: {
        title: "Site Name",
        schema: {
          type: "string",
        },
      },
    },
    required: ["site_name"],
  },
} satisfies ModelConfig;
