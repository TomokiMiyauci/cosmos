import { Config } from "@cosmos/config";
import { author, post, setting } from "./schemas/schema.ts";

const config = {
  models: {
    posts: { schema: "post", type: "collection" },
  },
  schemas: {
    post,
    "post.title": { type: "string" },
    "post.authors": { type: "list", item: "string" },
    author,
    setting,
    string: { type: "string" },
  },
} satisfies Config;

export default config;
