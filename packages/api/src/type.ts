import type { Node } from "@cosmos/core";

export interface Data {
  node: Node;
  model: string;
}

export interface Entry extends Data {
  id: string;
}
