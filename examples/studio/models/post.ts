import type { ModelConfig } from "@cosmos/config";

export default {
  title: "Post",
  description: "Post example",
  schema: {
    type: "map",
    props: {
      title: {
        title: "Title",
        description: "Title of post",
        schema: {
          type: "string",
        },
      },
      description: {
        title: "description",
        schema: {
          type: "string",
        },
      },
      published_at: {
        title: "published at",
        schema: {
          type: "datetime",
        },
      },
      authors: {
        title: "authors",
        schema: {
          type: "list",
          item: {
            type: "string",
          },
        },
      },
      author: {
        title: "Author",
        schema: {
          type: "reference",
          model: "author",
        },
      },
    },
    required: ["title"],
  },
} satisfies ModelConfig;
