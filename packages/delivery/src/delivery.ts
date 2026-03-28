import type { AssetMapping, Fetcher, Manifest, Protocol } from "@cosmos/core";
import type { Handler, MiddlewareVariant } from "./type.ts";
import { compose, normalizeMiddleware } from "./util.ts";

export interface DeliveryConfig {
  protocol: Protocol;
  manifest: Manifest;
  fetcher: Fetcher;
  registory: AssetMap;
  middleware?: MiddlewareVariant[];
}

export interface AssetMap {
  [k: string]: string;
}

export class Delivery {
  handler: Handler;
  constructor(
    config: DeliveryConfig,
  ) {
    const middleware = config.middleware?.map(normalizeMiddleware) ?? [];
    const asset = {
      lookup(publicUrl: URL): URL | undefined {
        const value = config.registory[publicUrl.href];

        if (value) {
          return new URL(value);
        }
      },
      resolve(id: URL): URL | undefined {
        for (const [publicId, internalId] of Object.entries(config.registory)) {
          if (id.href === internalId) {
            return new URL(publicId);
          }
        }
      },
    } satisfies AssetMapping;

    function handler(request: Request): Promise<Response> | Response {
      return config.protocol.handle(request, {
        fetcher: config.fetcher,
        manifest: config.manifest,
        asset,
      });
    }

    this.handler = compose(middleware, handler, {
      fetcher: config.fetcher,
      asset,
    });
  }

  handle(request: Request): Promise<Response> | Response {
    return this.handler(request);
  }
}
