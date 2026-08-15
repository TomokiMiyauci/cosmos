import * as oc from "./generated/orpc.gen.ts";
import * as zod from "./generated/zod.gen.ts";

const getResource = oc.getResource.errors({
  NOT_FOUND: {
    data: zod.zProblemDetails,
  },
});

const postEntry = oc.postEntry.errors({
  UNPROCESSABLE_CONTENT: {
    data: zod.zValidationProblemDetails,
  },
  CONFLICT: {
    data: zod.zProblemDetails,
  },
  INTERNAL_SERVER_ERROR: {
    data: zod.zProblemDetails,
  },
});

export const contract = {
  ...oc,
  postEntry,
  getResource,
};
