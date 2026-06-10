import type { Config } from "@cosmos/core";

export type Routes = Record<PropertyKey, string>;

export interface PageProps {
  config: ParsedConfig;
  params: Record<string, string>;
}

export type ExtractParams<T extends string> = T extends
  `${string}:${infer Param}/${infer Rest}`
  ? { [K in Param | keyof ExtractParams<`/${Rest}`>]: string }
  : T extends `${string}:${infer Param}` ? { [K in Param]: string }
  : never;

export interface ParsedConfig {
  value: Config;
  location: URL;
}
