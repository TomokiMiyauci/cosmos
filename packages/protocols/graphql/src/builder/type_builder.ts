import type { BuildContext, Entry, TypeBuilder } from "../type.ts";
import { createObject, type RuntimeContext } from "./definition.ts";
import type { GraphQLObjectType } from "graphql";

export class CoreTypeBuilder implements TypeBuilder {
  build(ctx: BuildContext): GraphQLObjectType<Entry>[] {
    const map: RuntimeContext["map"] = {};
    const context = {
      map,
      fetcher: ctx.datalayer.node,
    } satisfies RuntimeContext;
    const entries = Object.entries(ctx.manifest.schemas).map(
      ([name, schema]) => {
        const type = createObject(
          name,
          schema,
          context,
        );

        map[name] = type;

        return type;
      },
    );

    return entries;
  }
}
