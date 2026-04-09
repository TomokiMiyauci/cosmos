import type { Node, Protocol, ProtocolContext } from "@cosmos/core";
import { SchemaBuilder } from "./builder.ts";
import { createSchema, createYoga } from "graphql-yoga";
import type { Fetcher, ResolverContext, SchemaPlugin } from "./type.ts";

export interface GraphqlConfig {
  plugins?: SchemaPlugin[];
}

export class GraphqlProtocol implements Protocol {
  constructor(private config: GraphqlConfig) {}
  handle(request: Request, ctx: ProtocolContext): Promise<Response> {
    const fetcher = {
      async fetch(id): Promise<Node> {
        const node = await ctx.datalayer.node.fetch(id);

        return node;
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
