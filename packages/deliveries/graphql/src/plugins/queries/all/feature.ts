import type {
  GraphQLQueryField,
  QueryContext,
  QueryFeature,
} from "../../../type.ts";
import { GraphQLList } from "graphql";

export class AllQueryFeature implements QueryFeature {
  feature = "query" as const;

  provide(ctx: QueryContext): GraphQLQueryField[] {
    const { fetcher, entries } = ctx;

    return entries.map((schema) => {
      return {
        name: `all${schema.type.name}s`,
        field: {
          type: new GraphQLList(schema.type),
          resolve: async () => {
            const result = await Promise.all(
              schema.sources.map((url) => fetcher.fetch(url)),
            );

            return result;
          },
        },
      };
    });
  }
}
