import type { Model, Node, Resource } from "@cosmos/core";
import type { Summary } from "@cosmos/ui";
import type { Entry } from "../type.ts";
import type { CoreService, ParsedConfig } from "../handler.ts";

class Collector {
  constructor(private config: ParsedConfig) {}

  async get(id: string): Promise<Entry | null> {
    const config = this.config.value;

    const index = await config.indexer.resolve(id);

    if (index.type !== "model") throw new Error();

    const url = index.url;
    const resourceKey = index.resource;

    const source = config.sources.find((source) =>
      source.resource === resourceKey
    );

    if (!source) return null;

    const format = source.format;
    const resource = config.resources[resourceKey];

    if (!resource) return null;

    const model = resource.model;
    const field = config.models[resource.model];

    if (!field) return null;

    const formatter = config.formats[format.type];

    if (!formatter) {
      return null;
    }

    const storage = config.storages["file"]!;
    const blob = await storage.read(url);
    const text = await blob.text();
    const structure = formatter.parse(text, {
      engine: config,
      option: format.option,
      resource,
    });
    const node = await config.codec.parse(structure, field.schema, {
      baseUrl: url,
      base: this.config.location,
      engine: config,
      asset: {
        has(): boolean {
          return false;
        },
      },
      node: {
        has(): boolean {
          return false;
        },
      },
    });

    return {
      id,
      model,
      node,
    };
  }

  async gets(
    option?: { id?: string },
  ): Promise<{ id: string; resource: string; name: string }[]> {
    const config = this.config.value;
    const entries = await config.indexer.search({
      type: "model",
      resource: option?.id,
    });

    return entries.map(([id, index]) => ({ id, ...index }));
  }

  async update(id: string, node: Node): Promise<boolean> {
    const config = this.config.value;

    const index = await config.indexer.resolve(id);

    if (index.type !== "model") throw new Error();

    const url = index.url;
    const resourceKey = index.resource;

    const source = config.sources.find((source) =>
      source.resource === resourceKey
    );

    if (!source) return false;

    const format = source.format;

    const resource = config.resources[resourceKey];

    if (!resource) return false;

    const field = config.models[resource.model];

    if (!field) return false;

    const formatter = config.formats[format.type];

    if (!formatter) {
      return false;
    }

    const storage = config.storages["file"]!;

    const structure = await config.codec.serialize(node, field.schema, {
      baseUrl: url,
      base: this.config.location,
      engine: config,
      asset: {
        has(): boolean {
          return false;
        },
      },
      node: {
        has(): boolean {
          return false;
        },
      },
    });

    const content = formatter.serialize(structure, {
      engine: config,
      option: format.option,
      resource,
    });

    try {
      await storage.write(url, new Blob([content], {}));

      return true;
    } catch {
      return false;
    }
  }

  async create(resourceId: string, node: Node): Promise<{ id: string }> {
    const config = this.config.value;

    const id = crypto.randomUUID();
    const url = new URL(
      `file:/workspaces/cosmos/examples/studio/contents/posts/${id}.md`,
    );
    const resourceKey = resourceId;

    const source = config.sources.find((source) =>
      source.resource === resourceKey
    );

    if (!source) throw new Error();

    const format = source.format;

    const formatter = config.formats[format.type];

    if (!formatter) {
      throw new Error();
    }

    const resource = config.resources[resourceKey];

    if (!resource) {
      throw new Error();
    }

    const fieldName = resource.model;
    const field = config.models[fieldName];

    if (!field) throw new Error();

    const structure = await config.codec.serialize(node, field.schema, {
      baseUrl: url,
      base: this.config.location,
      engine: this.config.value,
      asset: {
        has(): boolean {
          return false;
        },
      },
      node: {
        has(): boolean {
          return false;
        },
      },
    });

    const content = formatter.serialize(structure, {
      engine: this.config.value,
      option: format.option,
      resource,
    });

    const storage = config.storages["file"]!;

    await storage.write(url, new Blob([content]));
    await config.indexer.register(id, {
      url,
      resource: resourceKey,
      type: "model",
      name: "x",
    });

    return {
      id,
    };
  }

  async delete(id: string): Promise<void> {
    const config = this.config.value;

    const index = await config.indexer.resolve(id);

    if (index.type !== "model") throw new Error();

    const storage = config.storages["file"];

    if (!storage) throw new Error();

    await storage.delete(index.url);
    await config.indexer.unregister(id);
  }
}

export class CmsServie implements CoreService {
  collector: Collector;
  constructor(private config: ParsedConfig) {
    this.collector = new Collector(config);
  }

  findContent(id: string): Promise<Entry | null> {
    return this.collector.get(id);
  }

  async findResource(id: string): Promise<Resource | null> {
    const resource = this.config.value.resources[id];

    if (!resource) return null;

    return resource;
  }

  updateContent(entry: Entry): Promise<boolean> {
    return this.collector.update(entry.id, entry.node);
  }

  async deleteContent(id: string): Promise<boolean> {
    try {
      await this.collector.delete(id);
      return true;
    } catch {
      return false;
    }
  }

  findSummaries(option?: { resource?: string }): Promise<Summary[]> {
    return this.collector.gets({ id: option?.resource });
  }

  async findResources(): Promise<Resource[]> {
    return Object.entries(this.config.value.resources).map(
      ([id, resource]) => {
        return { id, ...resource };
      },
    );
  }
  createContent(resourceId: string, node: Node): Promise<{ id: string }> {
    return this.collector.create(resourceId, node);
  }

  async findModels(): Promise<{
    id: string;
    model: Model;
  }[]> {
    return Object.entries(this.config.value.models).map(([id, model]) => {
      return {
        id,
        model,
      };
    });
  }

  findModel(id: string): Promise<Model | null> {
    const model = this.config.value.models[id];

    if (!model) return Promise.resolve(null);

    return Promise.resolve(model);
  }

  async findIndexies(option?: { resource?: string }) {
    const resource = option?.resource;
    const indexEntries = await this.config.value.indexer.search({
      resource,
      type: "model",
    });

    const values = indexEntries.map(([id, index]) => {
      return {
        id,
        ...index,
      };
    });

    return values;
  }
}
