import type { ModelConfig } from "@cosmos/config";

export default {
  title: "Author",
  schema: {
    type: "map",
    props: {
      name: {
        schema: { type: "string" },
      },
    },
    required: ["name"],
  },
} satisfies ModelConfig;
