import {
  createAssetNode,
  createBooleanNode,
  createDatetimeNode,
  createListNode,
  createMapNode,
  createNumberNode,
  createReferenceNode,
  createStringNode,
  createUnionNode,
} from "./factory.ts";

export const nodeBuilder = {
  string: createStringNode,
  number: createNumberNode,
  boolean: createBooleanNode,
  asset: createAssetNode,
  datetime: createDatetimeNode,
  list: createListNode,
  map: createMapNode,
  reference: createReferenceNode,
  union: createUnionNode,
};
