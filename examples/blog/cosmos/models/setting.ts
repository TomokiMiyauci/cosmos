import type { Model } from "@cosmos/core";

export default {
  type: "map",
  fields: {
    site_name: {
      type: "string",
      description: "Name of site",
    },
  },
  required: ["site_name"],
} satisfies Model;
