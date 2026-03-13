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

    return entries.map((schema) => {
      return {
        name: schema.type.name,
        field: {
          type: schema.type,
          args: { id: { type: new GraphQLNonNull(GraphQLID) } },
          resolve: (_, { id }) => {
            return fetcher.fetch(id);
          },
        },
      };
    });
  }
}
