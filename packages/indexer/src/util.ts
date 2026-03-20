import type { Config, Node, NodeObject } from "@cosmos/core";
import type { Transformer } from "./type.ts";

export interface VisitorConfig {
  config: Config;
  transformers: Transformer[];
}

export class Visitor {
  constructor(private config: VisitorConfig, private resources: NodeObject[]) {}

  visit(node: Node): Node {
    const { transformers, config } = this.config;

    return walk(node, (node) => {
      const result = transformers.reduce(
        (acc, transformer) =>
          transformer.transform(acc, {
            config,
            resources: this.resources,
          }),
        node,
      );

      return result;
    });
  }
}

function walk(node: Node, on: (node: Node) => Node): Node {
  const current = on(node);

  switch (current.type) {
    case "map": {
      const nextValue: Record<string, Node> = {};
      for (const [key, child] of Object.entries(current.value)) {
        nextValue[key] = walk(child, on);
      }
      return { ...current, value: nextValue };
    }

    case "string":
    case "boolean":
    case "id":
      return current;
  }
}
