import type { Resource } from "@cosmos/core";
import type { Entry, Plugin, QueryContext, QueryMap } from "../../type.ts";
import { mapValues } from "@std/collections/map-values";
import { filterValues } from "@std/collections/filter-values";

export class SingletonPlugin implements Plugin {
  name = "singleton";
  provideQuery(ctx: QueryContext): QueryMap {
    const singletonResources = filterValues(ctx.resources, isSingleton);

    return mapValues(singletonResources, (resource, key) => {
      const entry = ctx.types[resource.model];

      if (!entry) throw new Error();

      const { type } = entry;

      return {
        type,
        async resolve(
          _,
          __,
          ctx,
        ): Promise<Entry | null> {
          const keys = await ctx.fetcher.list(key);
          const id = keys[0];

          if (!id) return null;

          const node = await ctx.fetcher.fetch(id);
          const resource = { id, node } satisfies Entry;

          return resource;
        },
      };
    });
  }
}

function isSingleton(resource: Resource): boolean {
  return resource.type === "singleton";
}
