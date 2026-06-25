import type { Config, Model, Node, Resource as R } from "@cosmos/core";
import { parse, stringify } from "@cosmos/json";
import { ParentCodec } from "@cosmos/indexer";
import { parseToNode } from "@cosmos/parser";

interface ParsedConfig {
  value: Config;
  location: URL;
}

class ServerClient {
  constructor(private config: ParsedConfig) {
    const collector = new Collector(config);

    this.content = new ContentClient(collector);
    this.contents = new ContentsClient(collector);
    this.model = new ModelClient(config.value.models);
  }
  content: ContentClient;

  contents: ContentsClient;

  model: ModelClient;

  async findResources(): Promise<{ id: string; model: string }[]> {
    return Object.entries(this.config.value.resources).map(
      ([id, { model }]) => {
        return { id, model };
      },
    );
  }

  findResource(resourceId: string): Promise<R | null> {
    const resource = this.config.value.resources[resourceId];

    return Promise.resolve(resource ?? null);
  }

  findModels() {
    return Object.entries(this.config.value.models).map(([id, model]) => {
      return {
        id,
        model,
      };
    });
  }
}

interface Data {
  node: Node;
  model: string;
}

export interface Resource extends Data {
  id: string;
}

class Collector {
  constructor(private config: ParsedConfig) {}

  async get(id: string): Promise<Resource | null> {
    const config = this.config.value;

    const index = await config.indexers.resolve(id);

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
      config,
      option: format.option,
      resource,
    });
    const codec = new ParentCodec();
    const node = await codec.parse(structure, field, {
      baseUrl: url,
      base: this.config.location,
      config,
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
  ): Promise<{ id: string; resource: string }[]> {
    const config = this.config.value;
    const entries = await config.indexers.search({ resource: option?.id });

    return entries.map(([id, index]) => ({ id, resource: index.resource }));
  }

  async update(id: string, node: Node): Promise<boolean> {
    const config = this.config.value;

    const index = await config.indexers.resolve(id);
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

    const structure = await codec.serialize(node, field, {
      baseUrl: url,
      base: this.config.location,
      config,
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
      config: this.config.value,
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

    const structure = await codec.serialize(node, field, {
      baseUrl: url,
      base: this.config.location,
      config: this.config.value,
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
      config: this.config.value,
      option: format.option,
      resource,
    });

    const storage = config.storages["file"]!;

    await storage.write(url, new Blob([content]));
    await config.indexers.register(id, { url, resource: resourceKey });

    return {
      id,
    };
  }

  async delete(id: string): Promise<void> {
    const config = this.config.value;

    const index = await config.indexers.resolve(id);

    const storage = config.storages["file"];

    if (!storage) throw new Error();

    await storage.delete(index.url);
    await config.indexers.unregister(id);
  }
}

class ContentClient {
  constructor(private collector: Collector) {}
  async get(id: string): Promise<Resource | null> {
    const data = await this.collector.get(id);
    if (!data) return null;

    return {
      id,
      node: data.node,
      model: data.model,
    };
  }
  update(content: Content): Promise<boolean> {
    return this.collector.update(content.id, content.node);
  }

  create(resourceId: string, node: Node): Promise<{ id: string }> {
    return this.collector.create(resourceId, node);
  }

  delete(id: string) {
    return this.collector.delete(id);
  }
}

class ContentsClient {
  constructor(private collector: Collector) {}
  get(
    option?: { resource: string | undefined },
  ): Promise<{ id: string; resource: string }[]> {
    return this.collector.gets({ id: option?.resource });
  }
}

class ModelClient {
  constructor(private models: Record<string, Model>) {}
  get(id: string): Promise<Model | null> {
    const model = this.models[id];

    if (!model) return Promise.resolve(null);

    return Promise.resolve(model);
  }
}

interface Content {
  id: string;
  node: Node;
}

interface RouteDefinition {
  pattern: URLPatternInit;
  method?: string;
  handler: Handler;
}

const definitions = [
  {
    pattern: {
      pathname: "./contents/:id",
    },
    method: "GET",
    handler: async (request, ctx) => {
      const id = ctx.result.pathname.groups.id!;
      const content = await ctx.client.content.get(id);

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

      const result = await ctx.client.content.update(content);

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
    handler: async (request, ctx) => {
      const id = ctx.result.pathname.groups["id"]!;

      try {
        await ctx.client.content.delete(id);

        return new Response(null, { status: 204 });
      } catch {
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

      const contents = await ctx.client.contents.get({
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

      const result = await ctx.client.content.create(json.resource, node);

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

      const model = await ctx.client.model.get(id);

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
      const models = ctx.client.findModels();

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
      const identifies = await ctx.client.findResources();

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

      const identifies = await ctx.client.findResource(resourceId);

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
] satisfies RouteDefinition[];

interface Route {
  pattern: URLPattern;
  method?: string;
  handler: Handler;
}

interface Handler {
  (request: Request, ctx: HandlerContext): Response | Promise<Response>;
}

interface HandlerContext {
  result: URLPatternResult;
  client: ServerClient;
}

export function createHandler(
  config: ParsedConfig,
  endpoint: URL,
): (request: Request) => Promise<Response> {
  const routes = definitions.map((def) => toRoute(def, endpoint));
  const client = new ServerClient(config);

  return async (request: Request) => {
    for (const route of routes) {
      if (route.method) {
        if (route.method !== request.method) continue;
      }

      const pattern = new URLPattern(route.pattern);

      const result = pattern.exec(request.url);

      if (!result) continue;

      return route.handler(request, { result, client });
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

export { RestCmsService } from "./service.ts";
