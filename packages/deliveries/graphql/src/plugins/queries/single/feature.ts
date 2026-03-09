import type {
  GraphQLQueryField,
  QueryContext,
  QueryFeature,
} from "../../../type.ts";
import { GraphQLID, GraphQLNonNull } from "graphql";

export class SingleQueryFeature implements QueryFeature {
  feature = "query" as const;

  provide(ctx: QueryContext): GraphQLQueryField[] {
    const { fetcher, entries } = ctx;

    return entries.map((schema) => {
      return {
        name: schema.type.name,
        field: {
          type: schema.type,
          args: { id: { type: new GraphQLNonNull(GraphQLID) } },
          resolve: (_, { id }) => {
            const url = new URL(id);

            return fetcher.fetch(url);
          },
        },
      };
    });
  }
}
