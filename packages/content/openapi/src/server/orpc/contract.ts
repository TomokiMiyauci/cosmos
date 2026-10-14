import { implement } from "@orpc/server";
import type { ResponseHeadersPluginContext } from "@orpc/server/plugins";
import type { Commands, Readers } from "@cosmos/content";
import { contract } from "./patch.ts";

export const os = implement(contract).$context<Context>();

export interface Context extends ResponseHeadersPluginContext {
  usecases: Commands;
  queries: Readers;
}

export { contract };
