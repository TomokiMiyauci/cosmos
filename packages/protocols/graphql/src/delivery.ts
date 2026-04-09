import type { Node, Protocol, ProtocolContext } from "@cosmos/core";
import { createSchema, createYoga } from "graphql-yoga";
import type { GraphQLSchema } from "graphql";
import type { Fetcher, ResolverContext, SchemaPlugin } from "./type.ts";

export interface GraphqlConfig {
  plugins?: SchemaPlugin[];
}

export class GraphqlProtocol implements Protocol {
  constructor(private schema: GraphQLSchema) {
  }
  handle(request: Request, ctx: ProtocolContext): Promise<Response> {
    const fetcher = {
      async fetch(id): Promise<Node> {
        const node = await ctx.datalayer.node.fetch(id);

        return node;
      },
      list: ctx.datalayer.node.list.bind(ctx.datalayer.node),
    } satisfies Fetcher;

    const context = { fetcher } satisfies ResolverContext;

    const yoga = createYoga<Record<PropertyKey, never>, ResolverContext>({
      schema: createSchema({ typeDefs: this.schema }),
      context,
    });

    const result = yoga(request);

    return Promise.resolve(result);
  }
}
