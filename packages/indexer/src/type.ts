export interface BaseNode {
  name: string;
}

export interface LeafNode extends BaseNode {
  value: unknown;
  type: "string" | "boolean" | "reference";
}

export interface NodeTree extends BaseNode {
  id: string;
  children: LeafNode[];
}

export interface Transformer {
  transform(node: LeafNode): unknown;
}
