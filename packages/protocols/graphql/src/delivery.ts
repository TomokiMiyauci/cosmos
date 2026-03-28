import type { Protocol, ProtocolContext } from "@cosmos/core";
import { SchemaBuilder } from "./builder.ts";
import { createSchema, createYoga } from "graphql-yoga";
import type { SchemaPlugin } from "./type.ts";

export interface GraphqlConfig {
  plugins?: SchemaPlugin[];
}

export class GraphqlProtocol implements Protocol {
  constructor(private config: GraphqlConfig) {}
  handle(request: Request, ctx: ProtocolContext): Promise<Response> {
    const builder = new SchemaBuilder({ plugins: this.config.plugins ?? [] });
    const schema = builder.build({
      manifest: ctx.manifest,
      fetcher: ctx.fetcher,
      asset: ctx.asset,
    });

    const yoga = createYoga({
      schema: createSchema({ typeDefs: schema }),
    });

    const result = yoga(request);

    return Promise.resolve(result);
  }
}
