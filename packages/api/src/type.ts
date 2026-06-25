import type { Node } from "@cosmos/core";

export interface Data {
  node: Node;
  model: string;
}

export interface Resource extends Data {
  id: string;
}
