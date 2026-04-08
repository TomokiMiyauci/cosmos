import type {
  AssetNode,
  ListNode,
  MapNode,
  Node,
  NumberNode,
  ReferenceNode,
  StringNode,
} from "@cosmos/core";

export interface TextMapNode extends MapNode {
  value: TextNodeValue;
}

export interface StrongMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "strong";
    };
    children: PhrasingContentListNode;
  };
}

export interface PhrasingContentListNode extends ListNode {
  type: "list";
  value: PharasingContentMapNode[];
}

export interface HeadingMapNode extends MapNode {
  value: HeadingNodeValue;
}

export interface HeadingNodeValue extends Record<string, Node> {
  type: {
    type: "string";
    value: "heading";
  };
  depth: NumberNode;
  children: PhrasingContentListNode;
}

export type PharasingContentMapNode = StrongMapNode | TextMapNode | LinkMapNode;

export type RootNodeMapNode =
  | PharasingContentMapNode
  | HeadingMapNode
  | ParapraphMapNode;

export type RootNodeValue = RootNodeMapNode["value"];

export interface RootNodeListNode extends ListNode {
  value: RootNodeMapNode[];
}

export interface TextNodeValue extends LiteralNodeValue {
  type: {
    type: "string";
    value: "text";
  };
}

export interface ParapraphMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "paragraph";
    };
    children: PhrasingContentListNode;
  };
}

export interface LiteralNodeValue extends Record<string, Node> {
  value: StringNode;
}

export interface LinkMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "link";
    };
    children: PhrasingContentListNode;
    url: StringNode | AssetNode | ReferenceNode;
  };
}
