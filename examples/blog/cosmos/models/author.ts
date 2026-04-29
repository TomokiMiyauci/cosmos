import type { Model } from "@cosmos/core";

export default {
  type: "map",
  fields: {
    name: {
      type: "string",
    },
  },
  required: ["name"],
} satisfies Model;
