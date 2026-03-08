import type { Config, ContentNode } from "@cosmos/core";

export interface Transformer {
  transform(
    contentNode: Readonly<ContentNode>,
    ctx: Readonly<TransformContext>,
  ): ContentNode | undefined;
}

export interface TransformContext {
  config: Config;
  contents: ContentSource[];
}

export interface ContentSource {
  source: URL;
  content: Iterable<ContentNode>;
}
