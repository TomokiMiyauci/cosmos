import type { BuildContext, TypeBuilder, TypeEntry } from "../type.ts";
import { createObject, type RuntimeContext } from "./definition.ts";
import { mapValues } from "@std/collections/map-values";

export class CoreTypeBuilder implements TypeBuilder {
  build(ctx: BuildContext): Record<string, TypeEntry> {
    const map: RuntimeContext["map"] = {};
    const context = {
      map,
      fetcher: ctx.datalayer.node,
    } satisfies RuntimeContext;

    const types = mapValues(ctx.manifest.schemas, (schema, name) => {
      const type = createObject(
        name,
        schema,
        context,
      );

      map[name] = type;

      return { type, schema } satisfies TypeEntry;
    });

    return types;
  }
}
