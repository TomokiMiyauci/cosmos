import {
  type Engine,
  EntryId,
  type Index,
  type Model,
  type Node,
  type Resource,
} from "@cosmos/core";
import { parse, stringify } from "@cosmos/json";
import { parseToNode } from "@cosmos/parser";
import type { Summary } from "@cosmos/ui";
import type { Entry } from "./type.ts";
import { CmsServie } from "./services/core.ts";
import { EntryDeleteUseCase } from "./application/usecases/entry/deletion.ts";

export interface ParsedConfig {
  value: Engine;
  location: URL;
}

interface RouteDefinition {
  pattern: URLPatternInit;
  method?: string;
  handler: Handler;
}

export interface CoreService {
  findResource(id: string): Promise<Resource | null>;

  findSummaries(option?: { resource?: string }): Promise<Summary[]>;

  updateContent(entry: Entry): Promise<boolean>;
  deleteContent(id: string): Promise<boolean>;
  findResources(): Promise<Resource[]>;
  createContent(
    resourceId: string,
    node: Node,
    summary: Summary,
  ): Promise<{ id: string }>;
  findModel(id: string): Promise<Model | null>;
  findModels(): Promise<{ id: string; model: Model }[]>;
  findIndexies(option?: { resource?: string }): Promise<Index[]>;
  findContent(id: string): Promise<Entry | null>;
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
      const json: { node: any; resource: string; name: string } = await request
        .json();
      const node = parseToNode(json.node);

      const result = await ctx.service.createContent(json.resource, node, {
        name: json.name,
      });

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
  {
    pattern: {
      pathname: "./entries/:id",
    },
    method: "DELETE",
    async handler(_, ctx): Promise<Response> {
      const id = ctx.result.pathname.groups.id;

      if (!id) return new Response(null, { status: 404 });

      const result = EntryId.from(id);

      if (!result.ok) return new Response(null, { status: 400 });

      await ctx.usecase.execute(result.value);

      return new Response(null, { status: 204 });
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
  service: CoreService;
  usecase: EntryDeleteUseCase;
}

export function createRestHandler(
  config: ParsedConfig,
  endpoint: URL,
): (request: Request) => Promise<Response> {
  const routes = definitions.map((def) => toRoute(def, endpoint));
  const service = new CmsServie(config);
  const repositry = config.value.repositry;
  const usecase = new EntryDeleteUseCase(repositry);

  return async (request: Request) => {
    for (const route of routes) {
      if (route.method) {
        if (route.method !== request.method) continue;
      }

      const pattern = new URLPattern(route.pattern);

      const result = pattern.exec(request.url);

      if (!result) continue;

      return route.handler(request, { result, service, usecase });
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
