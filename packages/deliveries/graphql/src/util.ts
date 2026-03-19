import type { GraphQLSchema } from "graphql";
import type { NamingStrategy } from "./type.ts";
import { MapperKind, mapSchema } from "@graphql-tools/utils";

export function overrideName(
  namer: NamingStrategy,
  schema: GraphQLSchema,
): GraphQLSchema {
  return mapSchema(schema, {
    [MapperKind.OBJECT_TYPE]: (config) => {
      const name = namer.type(config.name);

      config.name = name;
      return config;
    },
  });
}
