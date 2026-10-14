import type { Protocol, ProtocolArgs } from "@cosmos/content";
import { router } from "./orpc/router.ts";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { ResponseHeadersPlugin } from "@orpc/server/plugins";

export interface OpenapiProtocolPorts {
  prefix?: `/${string}`;
}

export class OpenapiProtocol implements Protocol {
  constructor(private ports: OpenapiProtocolPorts) {}
  #handler = new OpenAPIHandler(router, {
    plugins: [new ResponseHeadersPlugin()],
  });

  async handle(args: ProtocolArgs): Promise<Response> {
    const result = await this.#handler.handle(args.request, {
      context: { queries: args.readers, usecases: args.commands },
      prefix: this.ports.prefix,
    });

    return result.response ?? new Response();
  }
}
