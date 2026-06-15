import type { Client } from "../type.ts";

export type Routes = Record<PropertyKey, string>;

export interface PageProps {
  params: Record<string, string>;
  client: Client;
}

export type ExtractParams<T extends string> = T extends
  `${string}:${infer Param}/${infer Rest}`
  ? { [K in Param | keyof ExtractParams<`/${Rest}`>]: string }
  : T extends `${string}:${infer Param}` ? { [K in Param]: string }
  : never;
