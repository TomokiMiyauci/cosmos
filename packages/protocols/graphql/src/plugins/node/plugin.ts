import type { Plugin } from "../../type.ts";
import {
  type GraphQLFieldConfig,
  GraphQLID,
  GraphQLInterfaceType,
  type GraphQLObjectTypeConfig,
} from "graphql";
import type { Resource } from "../../type.ts";

export const id = {
  type: GraphQLID,
  resolve(resource): string {
    return resource.id;
  },
} satisfies GraphQLFieldConfig<Resource, unknown>;

export class NodePlugin implements Plugin {
  #node: GraphQLInterfaceType;
  constructor() {
    this.#node = new GraphQLInterfaceType({
      name: "node",
      fields: { id },
    });
  }

  transform(
    config: GraphQLObjectTypeConfig<Resource, unknown>,
  ): GraphQLObjectTypeConfig<Resource, unknown> {
    const fields = typeof config.fields === "function"
      ? config.fields()
      : config.fields;

    if ("id" in fields) {
      throw new Error("id already exists");
    }

    const interfaces = config.interfaces
      ? typeof config.interfaces === "function"
        ? config.interfaces()
        : config.interfaces
      : [];

    return {
      ...config,
      interfaces: interfaces.concat(this.#node),
      fields: {
        ...fields,
        id,
      },
    };
  }
}
