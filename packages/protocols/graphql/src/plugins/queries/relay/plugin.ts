import {
  type Connection,
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
} from "graphql-relay";
import type { Node } from "@cosmos/core";
import type {
  GraphQLQueryField,
  QueryContext,
  SchemaPlugin,
} from "../../../type.ts";

export class RelayPlugin implements SchemaPlugin {
  name = "relay";
  provideQuery(ctx: QueryContext): GraphQLQueryField[] {
    return ctx.entries.map((entry) => {
      const { connectionType } = connectionDefinitions({
        nodeType: entry.type,
      });
      const name = `${entry.type.name}Collection`;
      const fetch = ctx.fetcher.fetch.bind(ctx.fetcher);

      return {
        name,
        type: {
          type: connectionType,
          args: connectionArgs,
          async resolve(_, args): Promise<Connection<Node>> {
            const sources = entry.sources;
            const promise = sources.map(fetch);
            const result = await Promise.all(promise);
            const collection = connectionFromArray(result, args);

            return collection;
          },
        },
      };
    });
  }
}
