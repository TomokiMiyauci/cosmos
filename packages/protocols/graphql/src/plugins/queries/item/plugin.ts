import type {
  GraphQLQueryField,
  QueryContext,
  SchemaPlugin,
} from "../../../type.ts";
import { GraphQLID, GraphQLNonNull } from "graphql";

export class ItemPlugin implements SchemaPlugin {
  name = "item";

  provideQuery(ctx: QueryContext): GraphQLQueryField[] {
    const { fetcher, entries } = ctx;

    return entries.map(({ type: schema }) => {
      return {
        name: schema.name,
        type: {
          type: schema,
          args: { id: { type: new GraphQLNonNull(GraphQLID) } },
          resolve: (_, { id }) => {
            return fetcher.node.fetch(id);
          },
        },
      };
    });
  }
}
