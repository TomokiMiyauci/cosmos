/**
 * Contract patch
 */

import * as oc from "../../generated/orpc.gen.ts";
import * as zod from "../../generated/zod.gen.ts";

const getSchema = oc.getSchema.errors({
  NOT_FOUND: {
    data: zod.zProblemDetails,
  },
});

const getEntry = oc.getEntry.errors({
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
  BAD_REQUEST: {
    data: zod.zProblemDetails,
  },
});

const putEntry = oc.putEntry.errors({
  UNPROCESSABLE_CONTENT: {
    data: zod.zValidationProblemDetails,
  },
  CONFLICT: {
    data: zod.zProblemDetails,
  },
  BAD_REQUEST: {
    data: zod.zProblemDetails,
  },
});

const getModel = oc.getModel.errors({
  NOT_FOUND: {
    data: zod.zProblemDetails,
  },
});

export const contract = {
  ...oc,
  postEntry,
  getEntry,
  getSchema,
  getModel,
  putEntry,
};
