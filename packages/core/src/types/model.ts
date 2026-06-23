export type Model =
  | StringModel
  | NumberModel
  | BooleanModel
  | InstanceModel
  | ReferenceModel
  | ListModel
  | AssetModel
  | MapModel
  | DatetimeModel
  | MarkdownModel
  | UnionModel;

export interface BaseModel {
  description?: string;
  type: string;
}

export interface StringModel extends BaseModel {
  type: "string";
  format?: string;
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

export interface MapModel extends BaseModel {
  type: "map";
  props: Record<string, Model>;
  required?: string[];
}

export interface InstanceModel extends BaseModel {
  type: "instance";
  model: string;
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
