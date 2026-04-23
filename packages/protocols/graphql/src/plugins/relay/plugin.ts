import {
  type Connection,
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
} from "graphql-relay";
import type {
  GraphQLQueryField,
  QueryContext,
  Resource,
  SchemaPlugin,
} from "../../type.ts";

export class RelayPlugin implements SchemaPlugin {
  name = "relay";
  provideQuery(ctx: QueryContext): GraphQLQueryField[] {
    return ctx.entries.map(
      ({ type: entry }) => {
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
            ): Promise<Connection<Resource>> {
              const model = entry.name;
              const keys = await ctx.fetcher.list(model);
              const promise = keys.map(async (key) => {
                const node = await ctx.fetcher.fetch(key);
                const resource = {
                  id: key,
                  node,
                } satisfies Resource;
                return resource;
              });
              const result = await Promise.all(promise);
              const collection = connectionFromArray(result, args);

              return collection;
            },
          },
        };
      },
    );
  }
}
