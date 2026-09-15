import { Config } from "@cosmos/content-config";
import { author, setting } from "./schemas/schema.ts";

const config = {
  models: {
    posts: { schema: "post", type: "collection" },
  },
  schemas: {
    post: {
      type: "map",
      props: {
        title: {
          required: true,
          to: "post.title",
        },
        age: {
          required: true,
          to: "post.title",
        },
        authors: {
          to: "post.authors",
        },
        author: {
          to: "post.author",
        },
        flag: {
          to: "post.flag",
        },
        createdAt: {
          to: "post.date",
        },
      },
    },
    "post.title": { type: "string" },
    "post.authors": { type: "list", item: "string" },
    "post.author": { type: "reference" },
    "post.flag": { type: "boolean" },
    "title.age": { type: "number" },
    "post.date": { type: "string", format: "date" },
    author,
    setting,
    string: { type: "string" },
  },
} satisfies Config;

export default config;
