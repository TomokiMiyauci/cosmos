import type { Engine, Model, Resource } from "@cosmos/core";
import { CmsServie } from "./services/core.ts";
import { EntryDeleteUseCase } from "./application/usecases/entry/deletion.ts";
import { EntryCreateUseCase } from "./application/usecases/entry/creation.ts";
import { EntryRetrievalUseCase } from "./application/usecases/entry/retrieval.ts";
import { EntryUpdateUseCase } from "./application/usecases/entry/updation.ts";
import { EntryQueryService } from "./application/queries/enty.ts";
import { contract } from "./contract.ts";
import { fetchRequestHandler, tsr } from "@ts-rest/serverless/fetch";

const router = tsr.platformContext<
  { usecases: Usecases; service: CoreService }
>().router(contract, {
  postEntry: async (params, ctx) => {
    const { body } = params;

    const result = await ctx.usecases.entryCreate.execute(
      body.name,
      body.model,
      body.node,
    );

    if (!result.ok) {
      return { status: 400, body: {} };
    }

    const dto = result.value;

    return { status: 201, body: dto };
  },
  deleteEntry: async (args, ctx) => {
    const result = await ctx.usecases.entryDelete.execute(args.params.id);

    if (!result.ok) {
      return { status: 400, body: {} };
    }

    return {
      status: 204,
      body: null,
    };
  },
  putEntry: async (args, ctx) => {
    const { body, params } = args;

    const result = await ctx.usecases.entryUpdate.execute(
      params.id,
      body.name,
      body.node,
    );

    if (!result.ok) {
      return {
        status: 400,
        body: {},
      };
    }

    const queryResult = await ctx.usecases.entryRetrival.execute(params.id);

    if (!queryResult.ok) {
      return {
        status: 400,
        body: {},
      };
    }

    const option = queryResult.value;

    if (!option.ok) {
      return {
        status: 404,
        body: {},
      };
    }

    const dto = option.value;

    return { status: 200, body: dto };
  },

  getEntry: async (args, ctx) => {
    const { params } = args;

    const maybeEntry = await ctx.usecases.entryRetrival.execute(params.id);

    if (!maybeEntry.ok) {
      return {
        status: 400,
        body: {},
      };
    }

    const option = maybeEntry.value;

    if (!option.ok) {
      return {
        status: 404,
        body: {},
      };
    }

    const dto = option.value;

    return { status: 200, body: dto };
  },
  getSummaries: async (args, ctx) => {
    const model = args.query.model;
    const dto = await ctx.usecases.query.findAll({ model });

    return { status: 200, body: dto };
  },
  getResources: async (_, ctx) => {
    const identifies = await ctx.service.findResources();

    return {
      status: 200,
      body: identifies,
    };
  },
  getResource: async (args, ctx) => {
    const { params } = args;
    const resourceId = params.id;

    const identifies = await ctx.service.findResource(resourceId);

    if (identifies) {
      return {
        status: 200,
        body: identifies,
      };
    }

    return { status: 404, body: {} };
  },
  getModel: async (args, ctx) => {
    const { params } = args;
    const id = params.id;

    const model = await ctx.service.findModel(id);

    if (!model) {
      return {
        status: 404,
        body: {},
      };
    }

    return {
      status: 200,
      body: { model },
    };
  },
  getModels: async (_, ctx) => {
    const models = await ctx.service.findModels();

    return {
      status: 200,
      body: models,
    };
  },
});

export interface ParsedConfig {
  value: Engine;
  location: URL;
}

export interface CoreService {
  findResource(id: string): Promise<Resource | null>;

  findResources(): Promise<Resource[]>;
  findModel(id: string): Promise<Model | null>;
  findModels(): Promise<{ id: string; model: Model }[]>;
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
    const result = await fetchRequestHandler({
      contract,
      options: {
        basePath: endpoint.pathname,
      },
      platformContext: {
        service,
        usecases,
      },
      request,
      router,
    });

    return result;
  };
}
