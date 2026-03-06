import type { Definition, Entry } from "@cosmos/core";
import type { LeafNode, NodeTree } from "./type.ts";

export interface Origin {
  definitions: Definition[];
  entries: Entry[];
}

export function nodeTreeToOrigin(nodeTrees: Iterable<NodeTree>): Entry[] {
  return [...nodeTrees].map((nodeTree) => {
    const entries = nodeTree.children.map((node) => {
      return [node.name, node.value];
    });

    return {
      key: nodeTree.id,
      value: Object.fromEntries(entries),
    };
  });
}

export function* originToNodeTree(origin: Origin): Iterable<NodeTree> {
  const documentMap = new Map(
    origin.entries.map(({ key, value }) => [key, value]),
  );
  for (const def of origin.definitions) {
    const documents = def.members.map((key) => {
      const value = documentMap.get(key);

      if (!value) throw new Error("unreachable");

      return { id: key, value };
    });
    const nodes = documents.map(({ id, value }) => {
      const children = def.schemas.map((schema) => {
        return {
          name: schema.name,
          value: Reflect.get(value, schema.name),
          type: schema.type,
        } satisfies LeafNode;
      });

      const parent = {
        name: def.name,
        id,
        children,
      } satisfies NodeTree;

      return parent;
    });

    yield* nodes;
  }
}

export interface Transformer {
  transform(node: LeafNode): unknown;
}

export class ReferenceTransfomer implements Transformer {
  constructor(public resolveId: (value: string) => string) {}
  transform(node: LeafNode): unknown {
    if (node.type !== "reference") return;

    const { value } = node;

    if (typeof value !== "string") throw new Error();

    return this.resolveId(value);
  }
}

export class Visitor {
  constructor(public transformers: Transformer[]) {}

  *visit(trees: Iterable<NodeTree>): Iterable<NodeTree> {
    for (const tree of trees) {
      const { id, name } = tree;
      const children = tree.children.map((child) => {
        const value = this.transformers.reduce((acc, transformer) => {
          return transformer.transform({ ...child, value: acc }) ?? acc;
        }, child.value);

        return {
          name: child.name,
          type: child.type,
          value,
        } satisfies LeafNode;
      });

      yield { id, name, children };
    }
  }
}
