import { implement } from "@orpc/server";
import type { ResponseHeadersPluginContext } from "@orpc/server/plugins";
import type { Queries, Usecases } from "@cosmos/content";
import { contract } from "./patch.ts";

export const os = implement(contract).$context<Context>();

export interface Context extends ResponseHeadersPluginContext {
  usecases: Usecases;
  queries: Queries;
}

export { contract };
