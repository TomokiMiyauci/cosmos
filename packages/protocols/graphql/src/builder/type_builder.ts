import type { BuildContext, TypeBuilder, TypeEntry } from "../type.ts";
import { createObject, type RuntimeContext } from "./definition.ts";
import { mapValues } from "@std/collections/map-values";
import { SchemaBuilder } from "@miyauci/graphql-builder";

export class CoreTypeBuilder implements TypeBuilder {
  build(ctx: BuildContext): Record<string, TypeEntry> {
    const builder = new SchemaBuilder();
    const context = {
      fetcher: ctx.datalayer.node,
      builder,
    } satisfies RuntimeContext;

    const types = mapValues(ctx.manifest.schemas, (schema, name) => {
      const type = createObject(
        name,
        schema,
        context,
      );

      return { type, schema };
    });

    return mapValues(types, ({ type, schema }) => ({
      type: type.type,
      schema,
    }));
  }
}
