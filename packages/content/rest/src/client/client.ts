import { contract } from "../server/orpc/contract.ts";
import type {
  EntryInput,
  EntryResponse,
  EntrySummaryResponse,
  Identitiy,
  ModelResponse,
  PostEntryResponse,
  SchemaResponse,
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

export type PostEntryError = ValidationError;

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
  ): Promise<EntrySummaryResponse[]> {
    const [error, data] = await this.#client.getSummaries({
      query: { model: optinos?.model },
    });

    if (error) throw error;

    return data;
  }

  /**
   * @throws
   */
  async postEntry(
    params: EntryInput,
  ): Promise<Result<PostEntryResponse, PostEntryError>> {
    const [error, data] = await this.#client.postEntry({ body: params });

    if (error) {
      if (!isDefinedError(error)) throw error;

      switch (error.code) {
        case "CONFLICT": {
          throw new Error();
        }
        case "UNPROCESSABLE_CONTENT": {
          const errors = error.data.errors;

          return Result.error({ type: "VALIDATION", errors });
        }
        case "BAD_REQUEST": {
          throw new Error();
        }
      }
    }

    return Result.ok(data);
  }

  async getEntry(
    id: string,
  ): Promise<Result<EntryResponse, ApiError<NotFoundProblem>>> {
    const [error, data] = await this.#client.getEntry({ params: { id } });

    if (error) throw error;

    return Result.ok(data as EntryResponse);
  }

  /**
   * @throws
   */
  async putEntry(
    params: EntryInput & Identitiy,
  ): Promise<Result<null, PostEntryError>> {
    const [error] = await this.#client.putEntry({
      params: { id: params.id },
      body: {
        model: params.model,
        contents: params.contents,
      },
    });

    if (error) {
      if (!isDefinedError(error)) throw error;

      switch (error.code) {
        case "CONFLICT": {
          throw new Error();
        }
        case "UNPROCESSABLE_CONTENT": {
          const errors = error.data.errors;

          return Result.error({ type: "VALIDATION", errors });
        }
        case "BAD_REQUEST": {
          throw new Error();
        }
      }
    }

    return Result.ok(null);
  }

  async deleteEntry(id: string): Promise<Result<null, ApiError<Problem>>> {
    const [error, data, is] = await this.#client.deleteEntry({
      params: { id },
    });

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

  async getSchemas(): Promise<SchemaResponse[]> {
    const [error, data] = await this.#client.getSchemas();

    if (error) throw error;

    return data;
  }

  /**
   * @throws {Error}
   */
  async getSchema(
    id: string,
  ): Promise<Result<SchemaResponse, ApiError<NotFoundProblem>>> {
    const [error, data] = await this.#client.getSchema({ params: { id } });

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
    ModelResponse[]
  > {
    const [error, data] = await this.#client.getModels();

    if (error) throw error;

    return data;
  }

  async getModel(
    id: string,
  ): Promise<Result<ModelResponse, ApiError<Problem>>> {
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
  | ConflictProblem
  | InternalServerErrorProblem;

interface InvalidArgumentProblem {
  status: 400;
}

interface NotFoundProblem {
  status: 404;
}

interface ConflictProblem {
  status: 409;
}

interface ValidationErrorProblem {
  status: 422;
  errors: unknown;
}

interface InternalServerErrorProblem {
  status: 500;
}

interface ValidationError {
  type: "VALIDATION";
  errors: ValidationFailure[];
}

interface ValidationFailure {
  pointer: string;
  code: string;
  detail: string;
}
