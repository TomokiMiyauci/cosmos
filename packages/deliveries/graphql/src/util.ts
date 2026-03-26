import type { GraphQLSchema } from "graphql";
import type { Namer } from "./type.ts";
import { MapperKind, mapSchema } from "@graphql-tools/utils";

export function overrideName(
  namer: Namer,
  schema: GraphQLSchema,
): GraphQLSchema {
  return mapSchema(schema, {
    [MapperKind.OBJECT_TYPE]: (config) => {
      const name = namer.type(config.name);

      config.name = name;
      return config;
    },
    [MapperKind.OBJECT_FIELD]: (config, fieldName) => {
      const name = namer.field(fieldName);

      return [name, config] as const;
    },
  });
}
