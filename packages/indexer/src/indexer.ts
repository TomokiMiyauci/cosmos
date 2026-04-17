import {
  type AssetEntry,
  type BaseSchema,
  type Config,
  type Datalayer,
  type Field,
  type IndexManager,
  type Manifest,
  type Node,
  type NodeEntry,
  resolveFormatter,
  type Resource,
  type Schema,
  type Store,
} from "@cosmos/core";
import { AssetRegistry } from "./registry.ts";
import { mapValues } from "@std/collections";

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
      formatters,
      resources,
      models,
      indexes,
      storage,
      resolver,
      assets = [],
      field: codec,
    } = config;
    const registry = new AssetRegistry();
    const nodeRegistry = new UrlSet();
    const formatterMap = formatters.reduce((acc, { type, formatter }) => {
      return {
        ...acc,
        [type]: formatter,
      };
    }, {});

    const assetPromise = assets.map(async (asset) => {
      const inderxer = resolveIndexer(indexes, asset.indexer.type);
      const iter = inderxer.search(asset.indexer.options);

      const urls = await Array.fromAsync(iter);

      return urls;
    });

    const assetUrls = (await Promise.all(assetPromise)).flat();

    for (const url of assetUrls) {
      registry.add(url);
    }
    const nodeEntries: NodeEntry[] = [];

    const entryPromises = resources.map(async (resource) => {
      const indexerType = resource.indexer.type;

      const indexer = resolveIndexer(indexes, indexerType);
      const iter = indexer.search(resource.indexer.options);

      const urls = await Array.fromAsync(iter);

      return urls.map((url) => {
        return {
          url,
          resource,
        } satisfies Entry;
      });
    });

    const entries = (await Promise.all(entryPromises)).flat();

    entries.forEach(({ url }) => {
      nodeRegistry.add(url);
    });

    const promise = entries.map(async ({ url, resource }) => {
      const { model: modelName } = resource;
      const model = models[modelName];
      if (!model) {
        throw new Error(`model is not defined. ${modelName}`);
      }
      const content = await storage.read(url);

      // const schemas = model.fields.map(fieldToSchema);
      const formatter = resolveFormatter(resource.format, formatterMap);
      const decoder = new TextDecoder();

      const buffer = await content.arrayBuffer();
      const text = decoder.decode(buffer);
      const structure = formatter.parse(text, {
        config,
        options: resource.format,
      });

      const node = await codec.parse(structure, model, {
        baseUrl: url,
        resolver,
        config,
        asset: {
          has(url): boolean {
            return registry.has(url);
          },
        },
        node: {
          has(url): boolean {
            return nodeRegistry.has(url);
          },
        },
      });

      nodeEntries.push({
        id: url.toString(),
        data: node,
        model: modelName,
        type: "node",
      });

      return model;
    });

    await Promise.all(promise);

    // const visitor = new Visitor({
    //   config: this.config,

    //   transformers: [
    //     // new ReferenceTransfomer(),
    //   ],
    // }, entries);

    const result = nodeEntries.map((entry) => {
      return {
        ...entry,
        data: entry.data,
      };
    });

    for (const source of result) {
      await store.save(source);
    }

    for (const url of registry.keys()) {
      const blob = await storage.read(url);
      const entry = {
        id: url.toString(),
        data: blob,
        type: "asset",
      } satisfies AssetEntry;
      await store.save(entry);
    }

    const datalayer = createDatalayer(store);
    const schemas = mapValues(models, fieldToSchema);

    return {
      manifest: {
        version: "1",
        schemas,
        resources: new Set(resources.map((resource) => resource.model)).values()
          .toArray(),
      },
      datalayer,
    };
  }
}

function resolveIndexer(
  indexers: IndexManager[],
  type: string,
): IndexManager {
  const indexer = indexers.find((indexer) => indexer.type === type);

  if (!indexer) throw new Error();

  return indexer;
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

      list(): Promise<string[]> {
        return store.list({ type: "asset" });
      },
    },
  };
}

interface Entry {
  url: URL;
  resource: Resource;
}

class UrlSet {
  #set = new Set<string>();

  add(value: URL): this {
    this.#set.add(value.toString());

    return this;
  }

  clear(): void {
    this.#set.clear();
  }

  delete(value: URL): boolean {
    return this.#set.delete(value.toString());
  }

  has(value: URL): boolean {
    return this.#set.has(value.toString());
  }

  get size(): number {
    return this.#set.size;
  }
}

function fieldToSchema(field: Field): Schema {
  const base = {
    description: field.description ?? "",
  } satisfies Omit<BaseSchema, "type">;

  switch (field.type) {
    case "string":
    case "markdown": {
      return {
        ...base,
        type: "string",
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
  }
}
