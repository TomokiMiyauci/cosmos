export type Model =
  | StringModel
  | NumberModel
  | BooleanModel
  | DatetimeModel
  | MapModel
  | ReferenceModel
  | ListModel
  | AssetModel
  | UnionModel
  | MarkdownModel;

export interface Anotation {
  title: string;
  description: string;
}

export interface MapModel extends Anotation {
  type: "map";
  props: Record<string, Model>;
  required: string[];
}

export interface StringModel extends Anotation {
  type: "string";
}

export interface NumberModel extends Anotation {
  type: "number";
}

export interface BooleanModel extends Anotation {
  type: "boolean";
}

export interface DatetimeModel extends Anotation {
  type: "datetime";
}

export interface ReferenceModel extends Anotation {
  type: "reference";
  model: string;
}

export interface ListModel extends Anotation {
  type: "list";
  item: Model;
}

export interface AssetModel extends Anotation {
  type: "asset";
}

export interface UnionModel extends Anotation {
  type: "union";
  variants: Record<string, Model>;
}

export interface MarkdownModel extends Anotation {
  type: "markdown";
}
