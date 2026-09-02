import type { SchemaConfig } from "@cosmos/config";

export default {
  type: "map",
  props: {
    title: {
      required: true,
      to: "post.title",
    },
    authors: {
      to: "post.authors",
    },
  },
} satisfies SchemaConfig;
