import {
  type BaseSchema,
  type Config,
  type Datalayer,
  type Entry,
  type Field,
  type Manifest,
  type Node,
  resolveFormatter,
  resolveIndexer,
  type Schema,
  type Store,
} from "@cosmos/core";
import { mapValues } from "@std/collections";
import { HashMap } from "./util.ts";
import { ParentCodec } from "./codec.ts";

export class Indexer {
  constructor(private config: Config) {}

  async index(store: Store): Promise<
    {
      manifest: Manifest;
      datalayer: Datalayer;
    }
  > {
    const config = this.config;
    const {
      formats,
      resources,
      models,
      storage,
      sources,
      assets = [],
      indexers,
    } = config;

    const registry = {
      document: new Map<number, URL[]>(),
      asset: new Map<string, URL[]>(),
    };
    const contentMap = new HashMap<URL, Blob>((url) => url.href);

    await Promise.all(
      sources.map(async (source, i) => {
        const indexer = resolveIndexer(source.indexer, indexers);

        const urls = await Array.fromAsync(
          indexer.search({ options: source.indexer }),
        );

        registry.document.set(i, urls);
      }),
    );

    await Promise.all(
      Object.entries(assets).map(async ([key, asset]) => {
        const indexer = resolveIndexer(asset.indexer, indexers);
        const urls = await Array.fromAsync(indexer.search({
          options: asset.indexer,
        }));

        registry.asset.set(key, urls);
      }),
    );

    for (
      const urls of [...registry.document.values(), ...registry.asset.values()]
    ) {
      await Promise.all(urls.map(async (url) => {
        const blob = await storage.read(url);

        contentMap.set(url, blob);
      }));
    }

    const assetMap = new Map<string, AssetResourceEntry[]>();
    const resourceMap = new Map<string, DocumentResourceEntry[]>();

    for (const [i, urls] of registry.document.entries()) {
      const source = sources[i];
      if (!source) throw new Error();

      const key = source.resource;
      const resource = resources[key];

      if (!resource) throw new Error();

      const format = source.format;

      const contents = urls.map((url) => [url, contentMap.get(url)] as const)
        .filter(([_, data]) => !!data) as [URL, Blob][];

      const field = models[resource.model];

      if (!field) {
        throw new Error(`model is not defined. ${resource.model}`);
      }

      const formatter = resolveFormatter(format, formats);
      const decoder = new TextDecoder();

      const promises = contents.map(async ([url, content]) => {
        const buffer = await content.arrayBuffer();
        const text = decoder.decode(buffer);
        const structure = formatter.parse(text, {
          config,
          options: format,
          resource,
        });

        const codec = new ParentCodec();
        const node = await codec.parse(structure, field, {
          baseUrl: url,
          config,
          asset: {
            has(url): boolean {
              for (const entries of assetMap.values()) {
                for (const entry of entries) {
                  if (
                    entry.type === "asset" && entry.url.href === url.href
                  ) {
                    return true;
                  }
                }
              }

              return false;
            },
          },
          node: {
            has(url): boolean {
              for (const entries of resourceMap.values()) {
                for (const entry of entries) {
                  if (
                    entry.type === "document" && entry.url.href === url.href
                  ) {
                    return true;
                  }
                }
              }

              return false;
            },
          },
          codec,
        });

        return {
          url,
          type: "document",
          data: node,
        } satisfies DocumentResourceEntry;
      });

      const entries = await Promise.all(promises);

      resourceMap.set(key, entries);
    }

    for (const [key, urls] of registry.asset) {
      const contents = urls.map((url) => [url, contentMap.get(url)] as const)
        .filter(([_, data]) => !!data) as [URL, Blob][];

      const enties = contents.map(([url, blob]) => {
        return {
          url,
          type: "asset",
          data: blob,
        } satisfies AssetResourceEntry;
      });

      assetMap.set(key, enties);
    }

    for (const [key, entries] of [...resourceMap, ...assetMap]) {
      for (const resourceEntry of entries) {
        const entry = toEntry(key, resourceEntry);
        await store.save(entry);
      }
    }

    const datalayer = createDatalayer(store);
    const schemas = mapValues(models, fieldToSchema);

    return {
      manifest: {
        version: "1",
        schemas,
        resources,
      },
      datalayer,
    };
  }
}

function toEntry(key: string, resourceEntry: ResourceEntry): Entry {
  switch (resourceEntry.type) {
    case "document": {
      return {
        type: "node",
        id: resourceEntry.url.toString(),
        model: key,
        data: resourceEntry.data,
      };
    }
    case "asset": {
      return {
        type: "asset",
        id: resourceEntry.url.toString(),
        data: resourceEntry.data,
      };
    }
  }
}

type ResourceEntry = DocumentResourceEntry | AssetResourceEntry;

interface BaseResourceEntry {
  url: URL;
}

interface DocumentResourceEntry extends BaseResourceEntry {
  type: "document";
  data: Node;
}

interface AssetResourceEntry extends BaseResourceEntry {
  type: "asset";
  data: Blob;
}

export function createDatalayer(store: Store): Datalayer {
  return {
    node: {
      async fetch(id): Promise<Node> {
        const result = await store.load(id);

        if (result.type !== "node") throw new Error("not a node entry");

        return result.data;
      },
      async list(model): Promise<string[]> {
        return await store.list({ type: "node", model });
      },
    },
    asset: {
      async fetch(id): Promise<Blob> {
        const entry = await store.load(id);

        if (entry.type !== "asset") throw new Error("not an asset entry");

        return entry.data;
      },

      list(): Promise<string[]> | string[] {
        return store.list({ type: "asset" });
      },
    },
  };
}

function fieldToSchema(field: Field): Schema {
  const base = {
    description: field.description ?? "",
  } satisfies Omit<BaseSchema, "type">;

  switch (field.type) {
    case "string": {
      return {
        ...base,
        type: "string",
      };
    }
    case "markdown": {
      return {
        ...base,
        type: "markdown",
      };
    }
    case "number": {
      return {
        ...base,
        type: "number",
      };
    }
    case "boolean": {
      return {
        ...base,
        type: "boolean",
      };
    }
    case "map": {
      return {
        ...base,
        type: "map",
        props: mapValues(field.fields, fieldToSchema),
        required: field.required ?? [],
      };
    }
    case "asset": {
      return {
        ...base,
        type: "asset",
      };
    }
    case "datetime": {
      return {
        ...base,
        type: "datetime",
      };
    }
    case "instance": {
      return {
        ...base,
        type: "instance",
        model: field.model,
      };
    }
    case "reference": {
      return {
        ...base,
        type: "reference",
        model: field.model,
      };
    }
    case "list": {
      return {
        ...base,
        type: "list",
        item: fieldToSchema(field.field),
      };
    }
    case "union": {
      return {
        ...base,
        type: "union",
        props: mapValues(field.fields, fieldToSchema),
      };
    }
  }
}
