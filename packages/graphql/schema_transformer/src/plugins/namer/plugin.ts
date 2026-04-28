import { GraphQLObjectType, type GraphQLSchema } from "graphql";
import type { Plugin } from "../../type.ts";
import type { Strategy } from "./type.ts";
import { Standard } from "./stragegy.ts";
import { mapKeys } from "@std/collections/map-keys";
import { MapperKind, mapSchema } from "@graphql-tools/utils";

export class NamerPlugin implements Plugin {
  constructor(private strategy: Strategy = new Standard()) {}

  transform(schema: GraphQLSchema): GraphQLSchema {
    const newSchema = mapSchema(schema, {
      [MapperKind.OBJECT_TYPE]: (type) => {
        const name = this.strategy.type(type.name);
        const config = type.toConfig();
        const fields = mapKeys(
          config.fields,
          this.strategy.field.bind(this.strategy),
        );

        return new GraphQLObjectType({
          ...config,
          name,
          fields,
        });
      },
      [MapperKind.INPUT_OBJECT_TYPE]: (type) => {
        type.name = this.strategy.type(type.name);

        return type;
      },
      [MapperKind.INTERFACE_TYPE]: (type) => {
        type.name = this.strategy.type(type.name);

        return type;
      },
    });

    return newSchema;
  }
}
