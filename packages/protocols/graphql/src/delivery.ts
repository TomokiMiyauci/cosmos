import type { Node, Protocol, ProtocolContext } from "@cosmos/core";
import {
  createSchema,
  createYoga,
  type YogaServerInstance,
} from "graphql-yoga";
import type { GraphQLSchema } from "graphql";
import type { Fetcher, Plugin, ResolverContext } from "./type.ts";

export interface GraphqlConfig {
  plugins?: Plugin[];
}

interface Context {
  handler: YogaServerInstance<ProtocolContext, ResolverContext>;
}

export class GraphqlProtocol implements Protocol<Context> {
  constructor(private schema: GraphQLSchema) {
  }

  init(ctx: ProtocolContext): Context {
    const fetcher = {
      async fetch(id): Promise<Node> {
        const node = await ctx.datalayer.node.fetch(id);

        return node;
      },
      list: ctx.datalayer.node.list.bind(ctx.datalayer.node),
    } satisfies Fetcher;

    const yoga = createYoga<ProtocolContext, ResolverContext>({
      schema: createSchema({ typeDefs: this.schema }),
      context: { fetcher },
    });

    return { handler: yoga };
  }

  handle(request: Request, ctx: Context): Promise<Response> {
    const result = ctx.handler(request);

    return Promise.resolve(result);
  }
}
