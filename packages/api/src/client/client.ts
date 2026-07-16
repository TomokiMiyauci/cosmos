import { initClient, type InitClientReturn } from "@ts-rest/core";
import { contract } from "../contract.ts";

export function createClient(baseUrl: URL): Client {
  return initClient(contract, { baseUrl: baseUrl.href });
}

export interface Client
  extends InitClientReturn<typeof contract, { baseUrl: string }> {}
