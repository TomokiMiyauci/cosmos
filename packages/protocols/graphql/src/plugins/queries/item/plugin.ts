import type {
  GraphQLQueryField,
  QueryContext,
  SchemaPlugin,
} from "../../../type.ts";
import { GraphQLID, GraphQLNonNull } from "graphql";
import { toCamelCase } from "@std/text";
export class ItemPlugin implements SchemaPlugin {
  name = "item";

  provideQuery(ctx: QueryContext): GraphQLQueryField[] {
    const { fetcher, entries } = ctx;

    return entries.map((schema) => {
      const name = toCamelCase(schema.type.name);

      return {
        name,
        type: {
          type: schema.type,
          args: { id: { type: new GraphQLNonNull(GraphQLID) } },
          resolve: (_, { id }) => {
            return fetcher.node.fetch(id);
          },
        },
      };
    });
  }
}
