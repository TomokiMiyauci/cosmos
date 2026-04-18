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
    [MapperKind.INPUT_OBJECT_TYPE]: (config) => {
      const name = namer.type(config.name);

      config.name = name;
      return config;
    },
    // [MapperKind.INPUT_OBJECT_FIELD]: (config, fieldName) => {
    //   const name = namer.field(fieldName);

    //   return [name, config] as const;
    // },
    [MapperKind.UNION_TYPE]: (type) => {
      const original = type.resolveType?.bind(type);

      if (original) {
        type.resolveType = async (...args) => {
          const result = await original(...args);

          if (typeof result === "string") {
            const name = namer.type(result);

            return name;
          }

          return result;
        };
      }

      return type;
    },
  });
}
