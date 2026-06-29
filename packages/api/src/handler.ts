import type { Engine, Index, Model, Node, Resource } from "@cosmos/core";
import { parse, stringify } from "@cosmos/json";
import { ParentCodec } from "@cosmos/indexer";
import { parseToNode } from "@cosmos/parser";
import type { Summary } from "@cosmos/ui";
import type { Entry } from "./type.ts";

interface ParsedConfig {
  value: Engine;
  location: URL;
}

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
    const codec = new ParentCodec();
    const node = await codec.parse(structure, field.schema, {
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
      codec,
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
    const codec = new ParentCodec();

    const structure = await codec.serialize(node, field.schema, {
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
      codec,
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

    const codec = new ParentCodec();
    const fieldName = resource.model;
    const field = config.models[fieldName];

    if (!field) throw new Error();

    const structure = await codec.serialize(node, field.schema, {
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
      codec,
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

interface RouteDefinition {
  pattern: URLPatternInit;
  method?: string;
  handler: Handler;
}

interface Service {
  findResource(id: string): Promise<Resource | null>;

  findSummaries(option?: { resource?: string }): Promise<Summary[]>;

  updateContent(entry: Entry): Promise<boolean>;
  deleteContent(id: string): Promise<boolean>;
  findResources(): Promise<Resource[]>;
  createContent(resourceId: string, node: Node): Promise<{ id: string }>;
  findModel(id: string): Promise<Model | null>;
  findModels(): Promise<{ id: string; model: Model }[]>;
  findIndexies(option?: { resource?: string }): Promise<Index[]>;
  findContent(id: string): Promise<Entry | null>;
}

class CmsServie implements Service {
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

const definitions = [
  {
    pattern: {
      pathname: "./contents/:id",
    },
    method: "GET",
    handler: async (_, ctx) => {
      const id = ctx.result.pathname.groups.id!;
      const content = await ctx.service.findContent(id);

      if (!content) return new Response(null, { status: 404 });

      const body = stringify(content);
      return new Response(body, {
        headers: {
          "content-type": "application/json",
        },
      });
    },
  },
  {
    pattern: {
      pathname: "./contents/:id",
    },
    method: "PUT",
    handler: async (request, ctx) => {
      const json = await request.text();

      const content = parse(json);

      const result = await ctx.service.updateContent(content);

      if (result) {
        return new Response(null, { status: 204 });
      } else {
        return new Response(null, { status: 404 });
      }
    },
  },
  {
    pattern: {
      pathname: "./contents/:id",
    },
    method: "DELETE",
    handler: async (_, ctx) => {
      const id = ctx.result.pathname.groups["id"]!;

      const result = await ctx.service.deleteContent(id);

      if (result) {
        return new Response(null, { status: 204 });
      } else {
        return new Response(null, {
          status: 404,
        });
      }
    },
  },
  {
    pattern: {
      pathname: "./contents",
    },
    method: "GET",
    handler: async (request, ctx) => {
      const url = new URL(request.url);
      const resourceId = url.searchParams.get("resource");

      const contents = await ctx.service.findSummaries({
        resource: resourceId ?? undefined,
      });

      return new Response(JSON.stringify(contents), {
        headers: {
          "content-type": "application/json",
        },
      });
    },
  },
  {
    pattern: {
      pathname: "./contents",
    },
    method: "POST",
    handler: async (request, ctx) => {
      const json: { node: any; resource: string } = await request.json();
      const node = parseToNode(json.node);

      const result = await ctx.service.createContent(json.resource, node);

      return new Response(JSON.stringify(result), {
        headers: {
          "content-type": "application/json",
        },
        status: 201,
      });
    },
  },
  {
    pattern: {
      pathname: "./models/:id",
    },
    method: "GET",
    handler: async (_, ctx) => {
      const id = ctx.result.pathname.groups.id!;

      const model = await ctx.service.findModel(id);

      if (!model) {
        return new Response(null, { status: 404 });
      }

      const body = JSON.stringify({ model });

      return new Response(body, {
        headers: {
          "content-type": "application/json",
        },
      });
    },
  },
  {
    pattern: {
      pathname: "./models",
    },
    method: "GET",
    handler: async (_, ctx) => {
      const models = await ctx.service.findModels();

      console.log(models);
      const body = JSON.stringify(models);

      return new Response(body, {
        headers: {
          "content-type": "application/json",
        },
      });
    },
  },
  {
    pattern: {
      pathname: "./resources",
    },

    method: "GET",
    handler: async (_, ctx) => {
      const identifies = await ctx.service.findResources();

      return new Response(JSON.stringify(identifies), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      });
    },
  },
  {
    pattern: {
      pathname: "./resources/:id",
    },

    method: "GET",
    handler: async (_, ctx) => {
      const resourceId = ctx.result.pathname.groups.id!;

      const identifies = await ctx.service.findResource(resourceId);

      if (identifies) {
        return new Response(JSON.stringify(identifies), {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        });
      }

      return new Response(null, {
        status: 404,
      });
    },
  },
  {
    pattern: {
      pathname: "./indexies",
    },
    method: "GET",
    handler: async (request, ctx) => {
      const url = new URL(request.url);

      const resource = url.searchParams.get("resource") ?? undefined;
      const indexies = await ctx.service.findIndexies({ resource });

      const body = JSON.stringify(indexies);

      return new Response(body, {
        headers: {
          "content-type": "application/json",
        },
      });
    },
  },
] satisfies RouteDefinition[];

export interface Route {
  pattern: URLPattern;
  method?: string;
  handler: Handler;
}

export interface Handler {
  (request: Request, ctx: HandlerContext): Response | Promise<Response>;
}

export interface HandlerContext {
  result: URLPatternResult;
  service: Service;
}

export function createRestHandler(
  config: ParsedConfig,
  endpoint: URL,
): (request: Request) => Promise<Response> {
  const routes = definitions.map((def) => toRoute(def, endpoint));
  const service = new CmsServie(config);

  return async (request: Request) => {
    for (const route of routes) {
      if (route.method) {
        if (route.method !== request.method) continue;
      }

      const pattern = new URLPattern(route.pattern);

      const result = pattern.exec(request.url);

      if (!result) continue;

      return route.handler(request, { result, service });
    }

    return new Response(null, {
      status: 404,
    });
  };
}

function toRoute(definition: RouteDefinition, baseUrl: URL): Route {
  const { method, handler } = definition;
  return {
    method,
    handler,
    pattern: new URLPattern({
      ...definition.pattern,
      baseURL: baseUrl.toString(),
    }),
  };
}
