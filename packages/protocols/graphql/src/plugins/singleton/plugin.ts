import type {
  Entry,
  GraphQLQueryField,
  Plugin,
  QueryContext,
} from "../../type.ts";

export class SingletonPlugin implements Plugin {
  name = "singleton";
  provideQuery(ctx: QueryContext): GraphQLQueryField[] {
    return Object.entries(ctx.resources).filter((
      [, resource],
    ): boolean => resource.type === "singleton")
      .map(([key, resource]) => {
        const entry = ctx.types[resource.model];

        if (!entry) throw new Error();

        const { type } = entry;

        return {
          name: type.name,
          type: {
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
          },
        };
      });
  }
}
