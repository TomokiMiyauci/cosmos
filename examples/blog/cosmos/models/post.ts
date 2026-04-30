import type { Model } from "@cosmos/core";

export default {
  type: "map",
  fields: {
    title: {
      type: "string",
      description: "Title of post",
    },
    description: {
      type: "string",
    },
    body: {
      type: "markdown",
    },
    published_at: {
      type: "datetime",
    },
    authors: {
      type: "list",
      field: {
        type: "reference",
        model: "author",
      },
    },
  },
  required: ["title", "body"],
} satisfies Model;
