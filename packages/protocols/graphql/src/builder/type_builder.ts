import type { BuilderContext, GraphqlEntry, TypeBuilder } from "../type.ts";
import { GraphQLID, GraphQLInterfaceType } from "graphql";
import { createObject, type RuntimeContext } from "./definition.ts";

export class BasicTypeBuilder implements TypeBuilder {
  build(ctx: BuilderContext): GraphqlEntry[] {
    const map: RuntimeContext["map"] = {};
    const node = new GraphQLInterfaceType({
      name: "node",
      fields: {
        id: { type: GraphQLID },
      },
    });
    const context = {
      map,
      fetcher: ctx.datalayer.node,
      base: { node },
    } satisfies RuntimeContext;
    const entries = Object.entries(ctx.manifest.schemas).map(
      ([name, schema]) => {
        const type = createObject(
          name,
          schema,
          context,
        );

        map[name] = type;

        return {
          type,
          schema,
        };
      },
    );

    return entries;
  }
}
