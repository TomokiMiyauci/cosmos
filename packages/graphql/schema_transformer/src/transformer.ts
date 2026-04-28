import type { GraphQLSchema } from "graphql";
import type { Plugin } from "./type.ts";
import { MapperKind, mapSchema, type SchemaMapper } from "@graphql-tools/utils";

export interface TransformerOptions {
  plugins: readonly Plugin[];
}

export class SchemaTransformer {
  #mappers: SchemaMapper[];
  constructor(options: TransformerOptions) {
    this.#mappers = options.plugins.map(toMapper);
  }

  transform(schema: GraphQLSchema): GraphQLSchema {
    return this.#mappers.reduce(mapSchema, schema);
  }
}

export function toMapper(plugin: Plugin): SchemaMapper {
  return {
    [MapperKind.OBJECT_TYPE]: plugin.objectType?.bind(plugin),
    [MapperKind.INPUT_OBJECT_TYPE]: plugin.inputObjectType?.bind(plugin),
    [MapperKind.INTERFACE_TYPE]: plugin.interfaceType?.bind(plugin),
  };
}
