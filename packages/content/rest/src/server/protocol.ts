import type { Protocol, ProtocolArgs } from "@cosmos/content";
import { router } from "./orpc/router.ts";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { ResponseHeadersPlugin } from "@orpc/server/plugins";

export class RestProtocol implements Protocol {
  #handler = new OpenAPIHandler(router, {
    plugins: [new ResponseHeadersPlugin()],
  });

  async handle(args: ProtocolArgs): Promise<Response> {
    const result = await this.#handler.handle(args.request, {
      context: {
        queries: args.queries,
        usecases: args.usecases,
      },
    });

    return result.response ?? new Response();
  }
}
