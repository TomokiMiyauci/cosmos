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

export class RelayPlugin implements Plugin {
  name = "relay";
  provideQuery(ctx: QueryContext): GraphQLQueryField[] {
    return Object.values(ctx.resources).filter((resource) =>
      resource.type === "collection"
    ).map((resource) => {
      const entry = ctx.entries[resource.model];

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
            const model = entry.name;
            const keys = await ctx.fetcher.list(model);
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
