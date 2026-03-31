import type { AssetMapping, Datalayer, Manifest, Protocol } from "@cosmos/core";
import type { Middleware, MiddlewareVariant } from "./type.ts";
import { compose, normalizeMiddleware } from "./util.ts";

export interface DeliveryConfig {
  protocol: Protocol;
  manifest: Manifest;
  datalayer: Datalayer;
  assetMapping?: AssetMappingRule;
  middleware?: MiddlewareVariant[];
}

interface AssetMappingRule {
  (url: URL, ctx: AssetMappingContext): URL | Promise<URL>;
}

interface AssetMappingContext {
  request: Request;
}

export interface AssetMap {
  [original: string]: string;
}

export class Delivery {
  #middleware: Middleware[];
  constructor(
    private config: DeliveryConfig,
  ) {
    this.#middleware = config.middleware?.map(normalizeMiddleware) ?? [];
  }

  async handle(request: Request): Promise<Response> {
    const config = this.config;
    const urls = await config.datalayer.asset.list();
    const mapper = config.assetMapping ?? baseMapping;
    const assetEntries = await Promise.all(
      urls.map(async (id: string) =>
        [id, (await mapper(new URL(id), { request })).href] as [string, string]
      ),
    );
    const assetMap = new Map<string, string>(assetEntries);

    const asset = {
      lookup(publicUrl: URL): URL | undefined {
        for (const [internalId, publicId] of assetMap) {
          if (publicUrl.href === publicId) {
            return new URL(internalId);
          }
        }
      },
      resolve(internalUrl: URL): URL | undefined {
        const value = assetMap.get(internalUrl.href);

        if (value) {
          return new URL(value);
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

const baseMapping = async (url: URL, ctx: AssetMappingContext) => {
  const href = url.href;
  const hasshed = await hash(href);
  const baseUrl = "/assets/" + hasshed;

  return new URL(baseUrl, ctx.request.url);
};

async function hash(key: string): Promise<string> {
  const u8 = new TextEncoder().encode(key);
  const digest = await crypto.subtle.digest("sha-256", u8);
  const hashArray = Array.from(new Uint8Array(digest));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
  return hashHex;
}
