import {
  type GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLObjectType,
} from "graphql";
import type { Plugin } from "../../type.ts";
import type { Strategy } from "./type.ts";
import { Standard } from "./stragegy.ts";
import { mapKeys } from "@std/collections/map-keys";

export class NamerPlugin implements Plugin {
  constructor(private strategy: Strategy = new Standard()) {}
  objectType(type: GraphQLObjectType): GraphQLObjectType {
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
  }
  inputObjectType(type: GraphQLInputObjectType): GraphQLInputObjectType {
    type.name = this.strategy.type(type.name);

    return type;
  }

  interfaceType(type: GraphQLInterfaceType): GraphQLInterfaceType {
    const name = this.strategy.type(type.name);
    const config = type.toConfig();
    const fields = mapKeys(
      config.fields,
      this.strategy.field.bind(this.strategy),
    );

    return new GraphQLInterfaceType({
      ...config,
      name,
      fields,
    });
  }
}
