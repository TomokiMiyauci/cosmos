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

export class GraphqlProtocol implements Protocol {
  #handler: YogaServerInstance<ProtocolContext, ResolverContext>;
  constructor(private schema: GraphQLSchema) {
    const yoga = createYoga<ProtocolContext, ResolverContext>({
      schema: createSchema({ typeDefs: this.schema }),
      context: (ctx) => {
        const fetcher = {
          async fetch(id): Promise<Node> {
            const node = await ctx.datalayer.node.fetch(id);

            return node;
          },
          list: ctx.datalayer.node.list.bind(ctx.datalayer.node),
        } satisfies Fetcher;

        return {
          fetcher,
        };
      },
    });

    this.#handler = yoga;
  }
  handle(request: Request, ctx: ProtocolContext): Promise<Response> {
    const result = this.#handler(request, ctx);

    return Promise.resolve(result);
  }
}
