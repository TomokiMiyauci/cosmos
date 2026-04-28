import type { GraphQLSchema } from "graphql";
import type { Plugin } from "./type.ts";

export interface TransformerOptions {
  plugins: readonly Plugin[];
}

export class SchemaTransformer {
  constructor(public options: TransformerOptions) {
  }

  transform(schema: GraphQLSchema): GraphQLSchema {
    return this.options.plugins.reduce((acc, plugin) => {
      return plugin.transform(acc);
    }, schema);
  }
}
