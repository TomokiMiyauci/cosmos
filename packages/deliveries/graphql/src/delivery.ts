import type { Delivery, DeliveryContext } from "@cosmos/core";
import { createSchemaFromManifest } from "./util.ts";
import { createSchema, createYoga } from "graphql-yoga";

export class GraphQLDelivery implements Delivery {
  handle(request: Request, ctx: DeliveryContext): Promise<Response> {
    const schema = createSchemaFromManifest(ctx.manifest, ctx.fetcher);

    const yoga = createYoga({
      schema: createSchema({ typeDefs: schema }),
    });

    const result = yoga(request);

    return Promise.resolve(result);
  }
}
