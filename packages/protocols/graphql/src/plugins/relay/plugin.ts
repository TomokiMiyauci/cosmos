import {
  type Connection,
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
} from "graphql-relay";
import type { Entry, Plugin, QueryContext, QueryMap } from "../../type.ts";
import type { Resource } from "@cosmos/core";
import { filterValues } from "@std/collections/filter-values";
import { mapEntries } from "@std/collections/map-entries";

export class RelayPlugin implements Plugin {
  name = "relay";
  provideQuery(ctx: QueryContext): QueryMap {
    const collectionResources = filterValues(ctx.resources, isCollection);

    return mapEntries(collectionResources, ([key, resource]) => {
      const entry = ctx.types[resource.model];

      if (!entry) throw new Error();
      const { type } = entry;

      const { connectionType } = connectionDefinitions({
        nodeType: type,
      });
      const name = `${type.name}Connection`;

      return [name, {
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
      }];
    });
  }
}

function isCollection(resource: Resource): boolean {
  return resource.type === "collection";
}
