import {
  type Connection,
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
} from "graphql-relay";
import type {
  Entry,
  GraphQLQueryField,
  Plugin,
  QueryContext,
} from "../../type.ts";
import type { DocumentResource } from "@cosmos/core";

export class RelayPlugin implements Plugin {
  name = "relay";
  provideQuery(ctx: QueryContext): GraphQLQueryField[] {
    return Object.entries(ctx.resources).filter((
      [, resource],
    ): boolean =>
      resource.type === "document" && resource.entity === "collection"
    ).map(([key, resource]) => {
      const entry = ctx.entries[(resource as DocumentResource).model];

      if (!entry) throw new Error();

      const { connectionType } = connectionDefinitions({
        nodeType: entry,
      });
      const name = `${entry.name}Connection`;

      return {
        name,
        type: {
          type: connectionType,
          args: connectionArgs,
          async resolve(
            _,
            args,
            ctx,
          ): Promise<Connection<Entry>> {
            const keys = await ctx.fetcher.list(key);
            const promise = keys.map(async (key) => {
              const node = await ctx.fetcher.fetch(key);
              const resource = {
                id: key,
                node,
              } satisfies Entry;
              return resource;
            });
            const result = await Promise.all(promise);
            const collection = connectionFromArray(result, args);

            return collection;
          },
        },
      };
    });
  }
}
