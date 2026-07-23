import * as oc from "./generated/orpc.gen.ts";
import * as zod from "./generated/zod.gen.ts";

const getResource = oc.getResource.errors({
  NOT_FOUND: {
    data: zod.zProblemDetails,
  },
});

export const contract = {
  ...oc,
  getResource,
};
