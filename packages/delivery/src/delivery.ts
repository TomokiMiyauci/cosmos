import type { Fetcher, Manifest, Protocol } from "@cosmos/core";
import type { Handler, MiddlewareVariant } from "./type.ts";
import { compose, normalizeMiddleware } from "./util.ts";

export interface DeliveryConfig {
  protocol: Protocol;
  manifest: Manifest;
  fetcher: Fetcher;
  middleware?: MiddlewareVariant[];
}

export class Delivery {
  handler: Handler;
  constructor(
    config: DeliveryConfig,
  ) {
    const middleware = config.middleware?.map(normalizeMiddleware) ?? [];

    function handler(request: Request): Promise<Response> | Response {
      return config.protocol.handle(request, {
        fetcher: config.fetcher,
        manifest: config.manifest,
      });
    }

    this.handler = compose(middleware, handler);
  }

  handle(request: Request): Promise<Response> | Response {
    return this.handler(request);
  }
}
