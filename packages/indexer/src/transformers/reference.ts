import type { LeafNode, Transformer } from "../type.ts";

export class ReferenceTransfomer implements Transformer {
  constructor(public resolveId: (value: string) => string) {}
  transform(node: LeafNode): unknown {
    if (node.type !== "reference") return;

    const { value } = node;

    if (typeof value !== "string") throw new Error();

    return this.resolveId(value);
  }
}
