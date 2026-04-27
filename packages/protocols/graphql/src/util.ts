import {
  type GraphQLFieldConfig,
  type GraphQLNamedOutputType,
  type GraphQLNamedType,
  isOutputType,
} from "graphql";
import type { Plugin } from "./type.ts";
import {
  type FieldMapper,
  MapperKind,
  type SchemaMapper,
} from "@graphql-tools/utils";

export function isNamedOutputType(
  type: GraphQLNamedType,
): type is GraphQLNamedOutputType {
  return isOutputType(type);
}

export function toMapper(plugin: Plugin): SchemaMapper {
  const objectField = plugin.objectField
    ? toFieldMapper(plugin.objectField.bind(plugin))
    : undefined;

  return {
    [MapperKind.OBJECT_TYPE]: plugin.objectType?.bind(plugin),
    [MapperKind.OBJECT_FIELD]: objectField,
  };
}

function toFieldMapper(
  fn: (
    field: GraphQLFieldConfig<unknown, unknown>,
  ) => GraphQLFieldConfig<unknown, unknown>,
): FieldMapper {
  return (fieldConfig) => {
    return fn(fieldConfig);
  };
}
