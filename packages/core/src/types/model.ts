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

export interface BaseModel extends Anotation {
  id: string;
}

export interface Anotation {
  title: string;
  description: string;
}

export interface MapModel extends BaseModel {
  type: "map";
  props: Record<string, Model>;
  required: string[];
}

export interface StringModel extends BaseModel {
  type: "string";
}

export interface NumberModel extends BaseModel {
  type: "number";
}

export interface BooleanModel extends BaseModel {
  type: "boolean";
}

export interface DatetimeModel extends BaseModel {
  type: "datetime";
}

export interface ReferenceModel extends BaseModel {
  type: "reference";
  model: string;
}

export interface ListModel extends BaseModel {
  type: "list";
  item: Model;
}

export interface AssetModel extends BaseModel {
  type: "asset";
}

export interface UnionModel extends BaseModel {
  type: "union";
  variants: Record<string, Model>;
}

export interface MarkdownModel extends BaseModel {
  type: "markdown";
}
