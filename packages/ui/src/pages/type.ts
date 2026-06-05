import type { Config } from "@cosmos/core";

export type Routes = Record<"resources" | "home", URLPatternInit>;

export interface PageProps {
  config: Config;
  params: Record<string, string>;
}
