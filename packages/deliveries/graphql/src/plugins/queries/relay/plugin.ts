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
import { toCamelCase } from "@std/text";

export class RelayPlugin implements SchemaPlugin {
  name = "relay";
  provideQuery(ctx: QueryContext): GraphQLQueryField[] {
    return ctx.entries.map((entry) => {
      const { connectionType } = connectionDefinitions({
        nodeType: entry.type,
      });
      const name = `${toCamelCase(entry.type.name)}Collection`;

      return {
        name,
        type: {
          type: connectionType,
          args: connectionArgs,
          async resolve(_, args): Promise<Connection<Node>> {
            const sources = entry.sources;
            const promise = sources.map(ctx.fetcher.fetch.bind(ctx.fetcher));
            const result = await Promise.all(promise);
            const collection = connectionFromArray(result, args);

            return collection;
          },
        },
      };
    });
  }
}
