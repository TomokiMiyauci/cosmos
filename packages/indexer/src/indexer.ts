import {
  type AssetEntry,
  type Config,
  type Datalayer,
  type Definition,
  type Field,
  type IndexManager,
  type Manifest,
  type Node,
  type NodeEntry,
  Parser,
  resolveFormatter,
  type Schema,
  type Store,
} from "@cosmos/core";
import { Visitor } from "./util.ts";
import { AssetRegistry } from "./registry.ts";

export class Indexer {
  constructor(private config: Config) {}

  async index(store: Store): Promise<
    {
      manifest: Manifest;
      registry: AssetRegistry;
      datalayer: Datalayer;
    }
  > {
    const { formatters, resources, indexes, storage, assets = [] } =
      this.config;
    const registry = new AssetRegistry();
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
    const entries: NodeEntry[] = [];
    const promise = resources.map(async (resource) => {
      const { model } = resource;

      const indexerType = resource.indexer.type;

      const indexer = resolveIndexer(indexes, indexerType);
      const iter = indexer.search(resource.indexer.options);

      const urls = await Array.fromAsync(iter);

      const contents = await Promise.all(urls.map(async (url) => {
        const content = await storage.read(url);

        return {
          url,
          content,
          type: model.name,
        };
      }));

      const schemas = model.fields.map(fieldToSchema);
      const formatter = resolveFormatter(model.format, formatterMap);
      const decoder = new TextDecoder();

      const jsons = await Promise.all(
        contents.map(async ({ content, url, type }) => {
          const buffer = await content.arrayBuffer();

          const text = decoder.decode(buffer);

          return {
            key: url,
            value: formatter.parse(text, {
              config: this.config,
              options: model.format,
            }),
            type,
          };
        }),
      );

      const members = jsons.map(({ key }) => key.toString());
      jsons.forEach(({ key, value, type }) => {
        const node = new Parser().parse(value, model, {
          config: this.config,
          url: key,
        });

        entries.push({
          id: key.toString(),
          data: node,
          model: type,
          type: "node",
        });
      });

      const definition = {
        name: model.name,
        description: model.description ?? "",
        schemas,
        members,
      } satisfies Definition;

      return definition;
    });

    const definitions = await Promise.all(promise);

    const visitor = new Visitor({
      config: this.config,

      transformers: [
        // new ReferenceTransfomer(),
      ],
    }, entries);

    const result = entries.map((entry) => {
      return {
        ...entry,
        data: visitor.visit(entry.data),
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

    return {
      manifest: {
        version: "1",
        definitions,
      },
      registry,
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

function fieldToSchema(field: Field): Schema {
  const { name, type, required = false, description = "" } = field;

  switch (type) {
    case "reference": {
      return {
        name,
        required,
        type: "id",
        description,
        to: field.to,
      };
    }
  }

  return {
    name,
    required,
    type,
    description,
  };
}

function createDatalayer(store: Store): Datalayer {
  return {
    node: {
      async fetch(id): Promise<Node> {
        const result = await store.load(id);

        if (result.type !== "node") throw new Error();

        return result.data;
      },
    },
    asset: {
      async fetch(id): Promise<Blob> {
        const entry = await store.load(id);

        if (entry.type !== "asset") throw new Error();

        return entry.data;
      },
    },
  };
}
