import type { Config, Node, NodeObject } from "@cosmos/core";

export interface Transformer {
  transform(
    contentNode: Readonly<Node>,
    ctx: Readonly<TransformContext>,
  ): Node;
}

export interface TransformContext {
  config: Config;
  resources: NodeObject[];
}
