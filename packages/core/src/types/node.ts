import type {
  AssetSchema,
  BooleanSchema,
  DatetimeSchema,
  ListSchema,
  MapSchema,
  MarkdownSchema,
  NumberSchema,
  ReferenceSchema,
  StringSchema,
  UnionSchema,
} from "./schema.ts";

export type Node = NodeValue | MapNode | ListNode;

export type NodeValue =
  | ReferenceNode
  | StringNode
  | NumberNode
  | BooleanNode
  | DatetimeNode
  | AssetNode
  | UnionNode
  | MarkdownNode;

export interface ReferenceNode {
  type: ReferenceSchema["type"];
  value: string;
}

export interface StringNode {
  type: StringSchema["type"];
  value: string;
}

export interface NumberNode {
  type: NumberSchema["type"];
  value: number;
}

export interface BooleanNode {
  type: BooleanSchema["type"];
  value: boolean;
}

export interface DatetimeNode {
  type: DatetimeSchema["type"];
  value: Date;
}

export interface AssetNode {
  type: AssetSchema["type"];
  value: string;
}

export interface ListNode {
  type: ListSchema["type"];
  value: Node[];
}

export interface MapNode {
  type: MapSchema["type"];
  value: Record<string, Node>;
}

export interface UnionNode {
  type: UnionSchema["type"];
  key: string;
  value: Node;
}

export interface MarkdownNode {
  type: MarkdownSchema["type"];
  value: RootNodeListNode;
}

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

export type PharasingContentMapNode =
  | StrongMapNode
  | TextMapNode
  | LinkMapNode
  | ImageMapNode
  | BreakMapNode
  | DeleteMapNode
  | EmphasisMapNode
  | HtmlMapNode
  | ImageReferenceMapNode
  | InlineCodeMapNode
  | LinkReferenceMapNode
  | FootnoteReferenceMapNode;

export type RootNodeMapNode =
  | PharasingContentMapNode
  | HeadingMapNode
  | ParagraphMapNode
  | BlockquoteMapNode
  | CodeMapNode
  | DefinitionMapNode
  | FootnoteDefinitionMapNode
  | ListMapNode
  | ListItemMapNode
  | TableMapNode
  | TableCellMapNode
  | TableRowMapNode
  | YamlMapNode
  | ThematicBreakMapNode;

export type BlockContentMapNode =
  | BlockquoteMapNode
  | CodeMapNode
  | HeadingMapNode
  | HtmlMapNode
  | ListMapNode
  | ParagraphMapNode
  | TableMapNode
  | ThematicBreakMapNode;

export type ListContentMapNode = ListItemMapNode;

export type TableContentMapNode = TableRowMapNode;
export type RowContentMapNode = TableCellMapNode;

export type DefinitionContentMapNode =
  | DefinitionMapNode
  | FootnoteDefinitionMapNode;

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

export interface ParagraphMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "paragraph";
    };
    children: PhrasingContentListNode;
  };
}

export interface BlockquoteMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "blockquote";
    };
    children: {
      type: "list";
      value: (BlockContentMapNode | DefinitionContentMapNode)[];
    };
  };
}

export interface CodeMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "code";
    };
    lang: StringNode;
    meta: StringNode;
    value: StringNode;
  };
}

export interface DefinitionMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "definition";
    };
    identifier: StringNode;
    label: StringNode;
    title: StringNode;
    url: StringNode | AssetNode | ReferenceNode;
  };
}

export interface FootnoteDefinitionMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "footnoteDefinition";
    };
    identifier: StringNode;
    label: StringNode;
    children: {
      type: "list";
      value: (BlockContentMapNode | DefinitionContentMapNode)[];
    };
  };
}

export interface FootnoteReferenceMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "footnoteReference";
    };
    identifier: StringNode;
    label: StringNode;
  };
}

export interface ListMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "list";
    };
    children: {
      type: "list";
      value: ListContentMapNode[];
    };
    ordered: BooleanNode;
    spread: BooleanNode;
    start: NumberNode;
  };
}

export interface ListItemMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "listItem";
    };
    checked: BooleanNode;
    children: {
      type: "list";
      value: (BlockContentMapNode | DefinitionContentMapNode)[];
    };
    spread: BooleanNode;
  };
}

export interface TableMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "table";
    };
    align: {
      type: "list";
      value: {
        type: "string";
        value: "center" | "left" | "right";
      }[];
    };
    children: {
      type: "list";
      value: TableContentMapNode[];
    };
  };
}

export interface TableCellMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "tableCell";
    };
    children: PhrasingContentListNode;
  };
}

export interface TableRowMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "tableRow";
    };
    children: {
      type: "list";
      value: RowContentMapNode[];
    };
  };
}

export interface ThematicBreakMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "thematicBreak";
    };
  };
}

export interface YamlMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "yaml";
    };
    value: StringNode;
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

export interface ImageMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "image";
    };
    url: StringNode | AssetNode | ReferenceNode;
    alt: StringNode;
    title: StringNode;
  };
}

export interface BreakMapNode extends MapNode {
  value: {
    type: { type: "string"; value: "break" };
  };
}

export interface DeleteMapNode extends MapNode {
  value: {
    type: { type: "string"; value: "delete" };
    children: PhrasingContentListNode;
  };
}

export interface EmphasisMapNode extends MapNode {
  value: {
    type: { type: "string"; value: "emphasis" };
    children: PhrasingContentListNode;
  };
}

export interface HtmlMapNode extends MapNode {
  value: {
    type: { type: "string"; value: "html" };
    value: StringNode;
  };
}

export interface ImageReferenceMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "imageReference";
    };
    identifier: StringNode;
    alt: StringNode;
    label: StringNode;
    referenceType: { type: "string"; value: ReferenceType };
  };
}

export type ReferenceType = "shortcut" | "collapsed" | "full";

export interface InlineCodeMapNode extends MapNode {
  value: {
    type: { type: "string"; value: "inlineCode" };
    value: StringNode;
  };
}

export interface LinkReferenceMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "linkReference";
    };
    identifier: StringNode;
    label: StringNode;
    referenceType: { type: "string"; value: ReferenceType };
    children: PhrasingContentListNode;
  };
}
