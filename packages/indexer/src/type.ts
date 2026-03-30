import type { Config, Node, NodeEntry } from "@cosmos/core";

export interface Transformer {
  transform(
    contentNode: Readonly<Node>,
    ctx: Readonly<TransformContext>,
  ): Node;
}

export interface TransformContext {
  config: Config;
  resources: NodeEntry[];
}
