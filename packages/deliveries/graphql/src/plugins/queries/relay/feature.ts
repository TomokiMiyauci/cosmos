import type {
  GraphQLQueryField,
  QueryContext,
  QueryFeature,
} from "../../../type.ts";
import type { Node } from "@cosmos/core";
import {
  type Connection,
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
} from "graphql-relay";

export class RelayQueryFeature implements QueryFeature {
  feature = "query" as const;
  provide(ctx: QueryContext): GraphQLQueryField[] {
    return ctx.entries.map((entry) => {
      const { connectionType } = connectionDefinitions({
        nodeType: entry.type,
      });
      const name = entry.type.name;

      return {
        name: `${name}Collection`,
        field: {
          type: connectionType,
          args: connectionArgs,
          async resolve(_, args): Promise<Connection<Node>> {
            const sources = entry.sources;
            const promise = sources.map((url) => url.toString()).map((id) =>
              ctx.fetcher.fetch(id)
            );
            const result = await Promise.all(promise);
            const collection = connectionFromArray(result, args);

            return collection;
          },
        },
      };
    });
  }
}
