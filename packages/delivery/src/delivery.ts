import type {
  AssetMapping,
  Fetcher,
  Manifest,
  Protocol,
  Storage,
} from "@cosmos/core";
import type { Middleware, MiddlewareVariant } from "./type.ts";
import { compose, normalizeMiddleware } from "./util.ts";
import { mapKeys } from "@std/collections";

export interface DeliveryConfig {
  protocol: Protocol;
  manifest: Manifest;
  fetcher: Fetcher;
  registory: AssetMap;
  storage: Storage;
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
        fetcher: config.fetcher,
        manifest: config.manifest,
        asset,
        storage: config.storage,
      });
    }

    const componsed = compose(this.#middleware, handler, {
      fetcher: this.config.fetcher,
      asset,
      storage: this.config.storage,
    });

    return componsed(request);
  }
}
