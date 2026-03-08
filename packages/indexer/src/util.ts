import type { Config } from "@cosmos/core";
import type { ContentSource, Transformer } from "./type.ts";

export interface VisitorConfig {
  config: Config;
  transformers: Transformer[];
}

export class Visitor {
  constructor(private config: VisitorConfig) {}

  *visit(contents: ContentSource[]): Iterable<ContentSource> {
    for (const content of contents) {
      const transformed = [...content.content].map((node) => {
        const transformed = this.config.transformers.reduce(
          (node, transfomer) => {
            return transfomer.transform(node, {
              config: this.config.config,
              contents,
            }) ?? node;
          },
          node,
        );

        return transformed;
      });

      yield { source: content.source, content: transformed };
    }
  }
}
