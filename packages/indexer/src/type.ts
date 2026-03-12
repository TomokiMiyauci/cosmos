import type { Config, Node, Resource } from "@cosmos/core";

export interface Transformer {
  transform(
    contentNode: Readonly<Node>,
    ctx: Readonly<TransformContext>,
  ): Node;
}

export interface TransformContext {
  config: Config;
  resources: Resource[];
}
