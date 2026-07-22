import type {
  AssetNode,
  BooleanNode,
  DatetimeNode,
  ListNode,
  MapNode,
  Node,
  NumberNode,
  ReferenceNode,
  StringNode,
  UnionNode,
} from "@cosmos/core";
import { mapValues } from "@std/collections";

export type Json = JsonValue | JsonObject | Json[];

export type JsonObject = { readonly [k: string]: Json };

export type JsonValue =
  | string
  | number
  | boolean
  | null;

export interface EntryDto extends SummaryDTO, JsonObject {
  node: NodeJson;
}

export interface EntryInputDto extends JsonObject {
  name: string;
  node: NodeJson;
}

export interface SummaryDTO extends JsonObject {
  id: string;
  model: string;
  name: string;
}

export type NodeJson =
  | StringNodeJson
  | NumberNodeJson
  | BooleanNodeJson
  | DatetimeNodeJson
  | ReferenceNodeJson
  | AssetNodeJson
  | UnionNodeJson
  | ListNodeJson
  | MapNodeJson;

interface StringNodeJson extends StringNode, JsonObject {}

interface NumberNodeJson extends NumberNode, JsonObject {}

interface UnionNodeJson extends JsonObject {
  type: UnionNode["type"];
  key: UnionNode["key"];
  value: NodeJson;
}

interface BooleanNodeJson extends BooleanNode, JsonObject {}

interface ReferenceNodeJson extends ReferenceNode, JsonObject {}

interface AssetNodeJson extends AssetNode, JsonObject {}

interface DatetimeNodeJson extends JsonObject {
  type: DatetimeNode["type"];
  value: string;
}

interface ListNodeJson extends JsonObject {
  type: ListNode["type"];
  value: NodeJson[];
}

interface MapNodeJson extends JsonObject {
  type: MapNode["type"];
  value: Record<string, NodeJson>;
}

export function toNode(dto: NodeJson): Node {
  switch (dto.type) {
    case "string":
    case "number":
    case "boolean":
    case "reference":
    case "asset": {
      return dto;
    }
    case "datetime": {
      return {
        type: "datetime",
        value: new Date(dto.value),
      };
    }
    case "union": {
      return {
        ...dto,
        value: toNode(dto.value),
      };
    }
    case "map": {
      return {
        type: "map",
        value: mapValues(dto.value, toNode),
      };
    }
    case "list": {
      return {
        type: "list",
        value: dto.value.map(toNode),
      };
    }
  }
}
