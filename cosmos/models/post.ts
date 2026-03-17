import type { Model } from "@cosmos/core";

export default {
  name: "post",
  format: {
    type: "frontmatter",
    body: {
      type: "text",
      field: "body",
    },
    header: {
      type: "yaml",
    },
  },
  pattern: {
    protocol: "file",
    pathname: "/content/posts/**/*.md",
  },
  fields: [
    {
      type: "string",
      name: "title",
    },
  ],
} satisfies Model;
