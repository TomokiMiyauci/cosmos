import type {
  AssetMapping,
  Datalayer,
  Manifest,
  Node,
  Protocol,
  ProtocolContext,
} from "@cosmos/core";
import type { Middleware, MiddlewareVariant } from "./type.ts";
import { compose, normalizeMiddleware } from "./util.ts";
import { walk } from "@cosmos/indexer";

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
    const assetMap = Object.fromEntries(assetEntries);
    const asset = createAssetMapping(assetMap);

    const ctx: ProtocolContext = {
      datalayer: config.datalayer,
      manifest: config.manifest,
      asset,
    };

    const proxy = createDatalayerProxy(
      config.datalayer,
      [mappedUrlPlugin],
      ctx,
    );

    function handler(request: Request): Promise<Response> | Response {
      return config.protocol.handle(request, { ...ctx, datalayer: proxy });
    }

    const componsed = compose(this.#middleware, handler, {
      datalayer: proxy,
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

function createAssetMapping(map: AssetMap): AssetMapping {
  const asset = {
    lookup(publicUrl: URL): URL | undefined {
      for (const [internalId, publicId] of Object.entries(map)) {
        if (publicUrl.href === publicId) {
          return new URL(internalId);
        }
      }
    },
    resolve(internalUrl: URL): URL | undefined {
      const value = map[internalUrl.href];

      if (value) {
        return new URL(value);
      }
    },
  } satisfies AssetMapping;

  return asset;
}

interface DataLayerPlugin {
  name: string;
  fetched: (node: Node, ctx: ProtocolContext) => Node;
}

const mappedUrlPlugin = {
  name: "mappedUrl",
  fetched: (node, ctx) => {
    switch (node.type) {
      case "asset": {
        const url = new URL(node.value);
        const resolved = ctx.asset.resolve(url);

        if (!resolved) throw new Error();

        return {
          ...node,
          value: resolved,
        };
      }
    }

    return node;
  },
} satisfies DataLayerPlugin;

function createDatalayerProxy(
  datalayer: Datalayer,
  plugins: DataLayerPlugin[],
  ctx: ProtocolContext,
): Datalayer {
  return {
    ...datalayer,
    node: {
      ...datalayer.node,
      async fetch(id: string): Promise<Node> {
        const node = await datalayer.node.fetch(id);
        return walk(node, (n) => {
          return plugins.reduce((acc, plugin) => plugin.fetched(acc, ctx), n);
        });
      },
    },
  };
}
