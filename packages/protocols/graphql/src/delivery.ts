import type { Node, Protocol, ProtocolContext } from "@cosmos/core";
import { SchemaBuilder } from "./builder.ts";
import { createSchema, createYoga } from "graphql-yoga";
import type { Data, Fetcher, ResolverContext, SchemaPlugin } from "./type.ts";
import { mapValues } from "@std/collections/map-values";

export interface GraphqlConfig {
  plugins?: SchemaPlugin[];
}

export class GraphqlProtocol implements Protocol {
  constructor(private config: GraphqlConfig) {}
  handle(request: Request, ctx: ProtocolContext): Promise<Response> {
    const fetcher = {
      async fetch(id): Promise<Data> {
        const node = await ctx.datalayer.node.fetch(id);

        const data = toData(node);

        return data;
      },
      list: ctx.datalayer.node.list.bind(ctx.datalayer.node),
    } satisfies Fetcher;
    const builder = new SchemaBuilder({ plugins: this.config.plugins ?? [] });
    const schema = builder.build({
      manifest: ctx.manifest,
      fetcher,
    });
    const context = { fetcher } satisfies ResolverContext;

    const yoga = createYoga<Record<PropertyKey, never>, ResolverContext>({
      schema: createSchema({ typeDefs: schema }),
      context,
    });

    const result = yoga(request);

    return Promise.resolve(result);
  }
}

function toData(node: Node): Data {
  switch (node.type) {
    case "string":
    case "boolean":
    case "reference":
    case "datetime":
    case "number":
    case "asset": {
      return node.value;
    }

    case "map": {
      return mapValues(node.value, toData);
    }

    case "list": {
      return node.value.map(toData);
    }
  }
}
