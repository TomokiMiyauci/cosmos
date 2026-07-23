import { contract } from "../patch.ts";
import type {
  Entry,
  EntryInput,
  EntrySummary,
  Identitiy,
  Model,
  Resource,
} from "../generated/types.gen.ts";
import type { JsonifiedClient } from "@orpc/openapi-client";
import type { ContractRouterClient } from "@orpc/contract";
import {
  createORPCClient,
  createSafeClient,
  isDefinedError,
  type SafeClient,
} from "@orpc/client";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { Result } from "@miyauci/util";

export class Client {
  #client: SafeClient<JsonifiedClient<ContractRouterClient<typeof contract>>>;

  constructor(baseUrl: URL) {
    const link = new OpenAPILink(contract, {
      url: baseUrl,
    });
    const client: JsonifiedClient<ContractRouterClient<typeof contract>> =
      createORPCClient(link);

    this.#client = createSafeClient(client);
  }

  async getEntrySummaries(
    optinos?: { model?: string },
  ): Promise<EntrySummary[]> {
    const [error, data] = await this.#client.getSummaries({
      query: { model: optinos?.model },
    });

    if (error) throw error;

    return data;
  }

  async postEntry(
    params: EntryInput,
  ): Promise<Result<Identitiy, ApiError<Problem>>> {
    const [error, data] = await this.#client.postEntry({ body: params });

    if (error) {
      throw error;
    }

    return Result.ok(data);
  }

  async getEntry(
    id: string,
  ): Promise<Result<Entry, ApiError<NotFoundProblem>>> {
    const [error, data] = await this.#client.getEntry({ params: { id } });

    if (error) throw error;

    return Result.ok(data as Entry);
  }

  async putEntry(
    params: EntryInput & Identitiy,
  ): Promise<Result<null, ApiError<Problem>>> {
    const result = await this.#client.putEntry({
      params: { id: params.id },
      body: {
        name: params.name,
        contents: params.contents,
        model: params.name,
      },
    });

    return Result.ok(null);
    // switch (result.status) {
    //   case 204: {
    //   }
    // }

    // throw new Error("Unknon status");
  }

  async deleteEntry(id: string): Promise<Result<null, ApiError<Problem>>> {
    const [error, data, is] = await this.#client.deleteEntry({
      params: { id },
    });

    if (isDefinedError(error)) {
      switch (error.code) {
        case "BAD_GATEWAY": {
          error.data.id;
        }
      }
    }

    if (error) {
      error;
    }

    return Result.ok(null);
    // switch (result.status) {
    //   case 204: {
    //   }
    // }

    // throw new Error("Unknon status");
  }

  async getResources(): Promise<
    Result<Resource[], ApiError<Problem>>
  > {
    const [error, data] = await this.#client.getResources();

    if (error) throw error;

    return Result.ok(data);
  }

  /**
   * @throws {Error}
   */
  async getResource(
    id: string,
  ): Promise<Result<Resource, ApiError<NotFoundProblem>>> {
    const [error, data] = await this.#client.getResource({ params: { id } });

    if (isDefinedError(error)) {
      switch (error.code) {
        case "NOT_FOUND": {
          return Result.error(new ApiError({ status: 404 }));
        }
      }
    }

    if (error) throw error;

    return Result.ok(data);
  }

  async getModels(): Promise<
    Result<Model[], ApiError<Problem>>
  > {
    const [error, data] = await this.#client.getModels();

    if (error) throw error;

    return Result.ok(data);
  }

  async getModel(
    id: string,
  ): Promise<Result<Model, ApiError<Problem>>> {
    const [error, data] = await this.#client.getModel({ params: { id } });

    if (error) throw error;

    return Result.ok(data);
  }
}

export class ApiError<T extends Problem> extends Error {
  constructor(problem: T) {
    super();

    this.problem = problem;
  }

  readonly problem: T;
}

type Problem =
  | InvalidArgumentProblem
  | ValidationErrorProblem
  | NotFoundProblem
  | InternalServerErrorProblem;

interface InvalidArgumentProblem {
  status: 400;
}

interface NotFoundProblem {
  status: 404;
}

interface ValidationErrorProblem {
  status: 422;
  errors: unknown;
}

interface InternalServerErrorProblem {
  status: 500;
}
