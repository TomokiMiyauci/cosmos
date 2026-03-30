import type { AssetMapping, Datalayer, Manifest, Protocol } from "@cosmos/core";
import type { Middleware, MiddlewareVariant } from "./type.ts";
import { compose, normalizeMiddleware } from "./util.ts";
import { mapKeys } from "@std/collections";

export interface DeliveryConfig {
  protocol: Protocol;
  manifest: Manifest;
  datalayer: Datalayer;
  registory: AssetMap;
  middleware?: MiddlewareVariant[];
}

export interface AssetMap {
  [k: string]: string;
}

export class Delivery {
  #middleware: Middleware[];
  constructor(
    private config: DeliveryConfig,
  ) {
    this.#middleware = config.middleware?.map(normalizeMiddleware) ?? [];
  }

  handle(request: Request): Promise<Response> | Response {
    const url = new URL(request.url);
    const baseUrl = url.origin + "/assets/";
    const config = this.config;
    const registory = mapKeys(this.config.registory, (key) => baseUrl + key);

    const asset = {
      lookup(publicUrl: URL): URL | undefined {
        const value = registory[publicUrl.href];

        if (value) {
          return new URL(value);
        }
      },
      resolve(id: URL): URL | undefined {
        for (const [publicId, internalId] of Object.entries(registory)) {
          if (id.href === internalId) {
            return new URL(publicId);
          }
        }
      },
    } satisfies AssetMapping;

    function handler(request: Request): Promise<Response> | Response {
      return config.protocol.handle(request, {
        datalayer: config.datalayer,
        manifest: config.manifest,
        asset,
      });
    }

    const componsed = compose(this.#middleware, handler, {
      datalayer: this.config.datalayer,
      asset,
    });

    return componsed(request);
  }
}
