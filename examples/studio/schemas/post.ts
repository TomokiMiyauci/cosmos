import type { SchemaConfig } from "@cosmos/content-config";

export default {
  type: "map",
  props: {
    title: {
      required: true,
      to: "post.title",
    },
    age: {
      to: "title.age",
    },
    authors: {
      to: "post.authors",
    },
    author: {
      to: "post.author",
    },
  },
} satisfies SchemaConfig;
