import { type Engine, EntryId, type Model, type Resource } from "@cosmos/core";
import { parse, stringify } from "@cosmos/json";
import { parseToNode } from "@cosmos/parser";
import { CmsServie } from "./services/core.ts";
import { EntryDeleteUseCase } from "./application/usecases/entry/deletion.ts";
import { EntryCreateUseCase } from "./application/usecases/entry/creation.ts";
import { EntryRetrievalUseCase } from "./application/usecases/entry/retrieval.ts";
import { EntryUpdateUseCase } from "./application/usecases/entry/updation.ts";
import { EntryQueryService } from "./application/queries/enty.ts";

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

  findResources(): Promise<Resource[]>;
  findModel(id: string): Promise<Model | null>;
  findModels(): Promise<{ id: string; model: Model }[]>;
}

const definitions = [
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
      pathname: "./entries/:id",
    },
    method: "DELETE",
    async handler(_, ctx): Promise<Response> {
      const id = ctx.result.pathname.groups.id;

      if (!id) return new Response(null, { status: 404 });

      const result = EntryId.from(id);

      if (!result.ok) return new Response(null, { status: 400 });

      await ctx.usecases.entryDelete.execute(result.value);

      return new Response(null, { status: 204 });
    },
  },
  {
    pattern: {
      pathname: "./entries/:id",
    },
    method: "GET",
    async handler(_, ctx): Promise<Response> {
      const id = ctx.result.pathname.groups.id;

      if (!id) return new Response(null, { status: 404 });

      const result = EntryId.from(id);

      if (!result.ok) return new Response(null, { status: 400 });

      const maybeEntry = await ctx.usecases.entryRetrival.execute(result.value);

      if (!maybeEntry.ok) return new Response(null, { status: 404 });

      const content = {
        id: maybeEntry.value.id.value,
        node: maybeEntry.value.node,
        model: "post",
      };

      console.log(maybeEntry.value);

      const body = stringify(content);

      return new Response(body, {
        headers: { "content-type": "application/json" },
      });
    },
  },
  {
    pattern: {
      pathname: "./entries",
    },
    method: "GET",
    async handler(request, ctx): Promise<Response> {
      const result = await ctx.usecases.query.findAll();
      const dto = result.map((entry) => ({
        id: entry.id.value,
        name: entry.name.value,
        node: entry.node,
      }));
      const body = JSON.stringify(dto);

      return new Response(body, {
        headers: {
          "content-type": "application/json",
        },
      });
    },
  },
  {
    pattern: {
      pathname: "./entries",
    },
    method: "POST",
    async handler(request, ctx): Promise<Response> {
      const json: { node: any; resource: string; name: string } = await request
        .json();
      const node = parseToNode(json.node);

      const result = await ctx.usecases.entryCreate.execute(json.name, node);

      if (!result.ok) return new Response(null, { status: 400 });

      return new Response(JSON.stringify(result.value), {
        headers: {
          "content-type": "application/json",
        },
        status: 201,
      });
    },
  },
  {
    pattern: {
      pathname: "./entries/:id",
    },
    method: "PUT",
    async handler(request, ctx): Promise<Response> {
      const id = ctx.result.pathname.groups.id!;

      const text = await request
        .text();
      const x = parse(text);

      const result = await ctx.usecases.entryUpdate.execute(
        id,
        "hoge",
        x.node,
      );

      if (!result.ok) return new Response(null, { status: 400 });

      return new Response(JSON.stringify(result.value), {
        headers: {
          "content-type": "application/json",
        },
        status: 204,
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
  service: CoreService;
  usecases: Usecases;
}

interface Usecases {
  entryDelete: EntryDeleteUseCase;
  entryCreate: EntryCreateUseCase;
  entryRetrival: EntryRetrievalUseCase;
  entryUpdate: EntryUpdateUseCase;
  query: EntryQueryService;
}

export function createRestHandler(
  config: ParsedConfig,
  endpoint: URL,
): (request: Request) => Promise<Response> {
  const routes = definitions.map((def) => toRoute(def, endpoint));
  const service = new CmsServie(config);
  const repositry = config.value.repositry;

  const usecases = {
    entryCreate: new EntryCreateUseCase(repositry),
    entryDelete: new EntryDeleteUseCase(repositry),
    entryRetrival: new EntryRetrievalUseCase(repositry),
    query: new EntryQueryService(config.value.reader),
    entryUpdate: new EntryUpdateUseCase(repositry),
  } satisfies Usecases;

  return async (request: Request) => {
    for (const route of routes) {
      if (route.method) {
        if (route.method !== request.method) continue;
      }

      const pattern = new URLPattern(route.pattern);

      const result = pattern.exec(request.url);

      if (!result) continue;

      return route.handler(request, { result, service, usecases });
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
