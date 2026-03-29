import {
  type Config,
  createIO,
  type Definition,
  type Field,
  type IndexManager,
  type IO,
  type Manifest,
  type NodeObject,
  Parser,
  resolveFormatter,
  type Schema,
  type Storage,
} from "@cosmos/core";
import { Visitor } from "./util.ts";
import { AssetRegistry } from "./registry.ts";

export class Indexer {
  constructor(private config: Config) {}

  async index(
    storage: Storage,
  ): Promise<{ manifest: Manifest; registry: AssetRegistry; io: IO }> {
    const { formatters, resouces, indexes, resolvers, assets = [] } =
      this.config;
    const registry = new AssetRegistry();
    const formatterMap = formatters.reduce((acc, { type, formatter }) => {
      return {
        ...acc,
        [type]: formatter,
      };
    }, {});

    const io = createIO(resolvers);

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
    const resources: NodeObject[] = [];
    const promise = resouces.map(async (resource) => {
      const { model } = resource;

      const indexerType = resource.indexer.type;

      const indexer = resolveIndexer(indexes, indexerType);
      const iter = indexer.search(resource.indexer.options);

      const urls = await Array.fromAsync(iter);

      const contents = await Promise.all(urls.map(async (url) => {
        const content = await io.storage.read(url);

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
      io,
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
