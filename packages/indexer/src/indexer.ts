import {
  type Config,
  type Definition,
  type Field,
  type IndexManager,
  type Manifest,
  type NodeObject,
  Parser,
  resolveFormatter,
  type Schema,
  type Storage,
  type StorageService,
} from "@cosmos/core";
import { Visitor, walk } from "./util.ts";
import { AssetRegistry } from "./registry.ts";

export class Indexer {
  constructor(private config: Config) {}

  async index(
    storage: Storage,
  ): Promise<{ manifest: Manifest; registry: AssetRegistry }> {
    const { formatters, resouces, indexes, storages } = this.config;
    const registry = new AssetRegistry();
    const formatterMap = formatters.reduce((acc, { type, formatter }) => {
      return {
        ...acc,
        [type]: formatter,
      };
    }, {});
    const resources: NodeObject[] = [];
    const promise = resouces.map(async (resource) => {
      const { model } = resource;

      const indexerType = resource.indexer.type;

      const indexer = resolveIndexer(indexes, indexerType);
      const iter = indexer.search(resource.indexer.options);

      const urls = await Array.fromAsync(iter);

      const contents = await Promise.all(urls.map(async (url) => {
        const storage = resolveStorage(storages, url);
        const content = await storage.read(url);

        return {
          url,
          content,
        };
      }));

      const schemas = model.fields.map(fieldToSchema);
      const formatter = resolveFormatter(model.format, formatterMap);
      const decoder = new TextDecoder();

      const jsons = contents.map(({ content, url }) => {
        const text = decoder.decode(content);

        return {
          key: url,
          value: formatter.parse(text, {
            config: this.config,
            options: model.format,
          }),
        };
      });

      const members = jsons.map(({ key }) => key.toString());
      jsons.forEach(({ key, value }) => {
        const node = new Parser().parse(value, model, {
          config: this.config,
          url: key,
        });

        resources.push({ id: key.toString(), node });
        walk(node, (node) => {
          if (node.type === "asset") {
            registry.add(node.value, key);
          }
          return node;
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
    }, resources);

    const result = resources.map((resource) => {
      return {
        id: resource.id,
        node: visitor.visit(resource.node),
      };
    });

    for (const source of result) {
      const value = JSON.stringify(source.node);
      const encoded = new TextEncoder().encode(value);
      storage.write(new URL(source.id), encoded);
    }

    return {
      manifest: {
        version: "1",
        definitions,
      },
      registry,
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

function resolveStorage(storages: StorageService[], url: URL): Storage {
  for (const storage of storages) {
    if (storage.supports(url)) return storage;
  }

  throw new Error();
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
