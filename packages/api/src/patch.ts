import * as oc from "./generated/orpc.gen.ts";
import { z } from "zod";

const getResource = oc.getResource.errors({
  NOT_FOUND: {
    data: z.void(),
  },
});

export const contract = {
  ...oc,
  getResource,
};
