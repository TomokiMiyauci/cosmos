import type { Commands, Readers } from "@cosmos/content";

export interface Context {
  commands: Commands;
  queries: Readers;
}
