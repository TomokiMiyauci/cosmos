import {
  type GraphQLNamedOutputType,
  type GraphQLNamedType,
  isOutputType,
} from "graphql";
import type { Plugin } from "./type.ts";
import { MapperKind, type SchemaMapper } from "@graphql-tools/utils";

export function isNamedOutputType(
  type: GraphQLNamedType,
): type is GraphQLNamedOutputType {
  return isOutputType(type);
}

export function toMapper(plugin: Plugin): SchemaMapper {
  return {
    [MapperKind.OBJECT_TYPE]: plugin.objectType?.bind(plugin),
    [MapperKind.INPUT_OBJECT_TYPE]: plugin.inputObjectType?.bind(plugin),
    [MapperKind.INTERFACE_TYPE]: plugin.interfaceType?.bind(plugin),
  };
}
