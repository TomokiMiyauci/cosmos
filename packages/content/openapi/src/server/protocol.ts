import type { Protocol, ProtocolArgs } from "@cosmos/content";
import { router } from "./orpc/router.ts";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { ResponseHeadersPlugin } from "@orpc/server/plugins";
import type { Queries } from "./application/query.ts";

export interface OpenapiProtocolPorts {
  queries: Queries;
  prefix?: `/${string}`;
}

export class OpenapiProtocol implements Protocol {
  constructor(private ports: OpenapiProtocolPorts) {}
  #handler = new OpenAPIHandler(router, {
    plugins: [new ResponseHeadersPlugin()],
  });

  async handle(args: ProtocolArgs): Promise<Response> {
    const result = await this.#handler.handle(args.request, {
      context: { queries: this.ports.queries, usecases: args.usecases },
      prefix: this.ports.prefix,
    });

    return result.response ?? new Response();
  }
}
