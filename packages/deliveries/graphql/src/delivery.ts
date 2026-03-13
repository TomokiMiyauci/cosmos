import type { Delivery, DeliveryContext } from "@cosmos/core";
import { SchemaBuilder } from "./builder.ts";
import { createSchema, createYoga } from "graphql-yoga";
import type { SchemaPlugin } from "./type.ts";

export interface GraphQLDeliveryConfig {
  plugins: SchemaPlugin[];
}

export class GraphQLDelivery implements Delivery {
  constructor(private config: GraphQLDeliveryConfig) {}
  handle(request: Request, ctx: DeliveryContext): Promise<Response> {
    const builder = new SchemaBuilder({ plugins: this.config.plugins });
    const schema = builder.build({
      manifest: ctx.manifest,
      fetcher: ctx.fetcher,
    });

    const yoga = createYoga({
      schema: createSchema({ typeDefs: schema }),
    });

    const result = yoga(request);

    return Promise.resolve(result);
  }
}
