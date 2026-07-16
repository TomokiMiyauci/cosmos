import { initClient, type InitClientReturn } from "@ts-rest/core";
import { contract } from "../contract.ts";
import type { components } from "../schema.d.ts";

export class Client {
  #client: InitClientReturn<typeof contract, { baseUrl: string }>;

  constructor(baseUrl: URL) {
    this.#client = initClient(contract, { baseUrl: baseUrl.href });
  }

  async getEntrySummaries(
    optinos?: { model?: string },
  ): Promise<components["schemas"]["SummaryDto"][]> {
    const result = await this.#client.getSummaries({
      "query": { model: optinos?.model },
    });

    switch (result.status) {
      case 200: {
        return result.body;
      }
    }

    throw new ApiError();
  }

  async postEntry(
    params: components["schemas"]["NewEntryInputDto"],
  ): Promise<void> {
    const result = await this.#client.postEntry({ body: params });

    switch (result.status) {
      case 201: {
        return;
      }
    }

    throw new ApiError();
  }

  async getEntry(id: string): Promise<components["schemas"]["EntryDto"]> {
    const result = await this.#client.getEntry({ params: { id } });

    switch (result.status) {
      case 200: {
        return result.body;
      }
      case 404: {
        throw new ApiError({ status: 404 });
      }
    }

    throw new ApiError();
  }

  async putEntry(
    params: components["schemas"]["EntryInputDto"] & { id: string },
  ): Promise<void> {
    const result = await this.#client.putEntry({
      params: { id: params.id },
      body: { name: params.name, node: params.node },
    });

    switch (result.status) {
      case 204: {
        return;
      }
    }

    throw new ApiError();
  }

  async deleteEntry(id: string): Promise<void> {
    const result = await this.#client.deleteEntry({ params: { id } });

    switch (result.status) {
      case 204: {
        return;
      }
    }

    throw new ApiError();
  }

  async getResources() {
    const result = await this.#client.getResources();

    switch (result.status) {
      case 200: {
        return result.body;
      }
    }

    throw new ApiError();
  }

  async getResource(id: string) {
    const result = await this.#client.getResource({ params: { id } });

    switch (result.status) {
      case 200: {
        return result.body;
      }
    }

    throw new ApiError();
  }

  async getModels() {
    const result = await this.#client.getModels();

    switch (result.status) {
      case 200: {
        return result.body;
      }
    }

    throw new ApiError();
  }

  async getModel(id: string) {
    const result = await this.#client.getModel({ params: { id } });

    switch (result.status) {
      case 200: {
        return result.body;
      }
    }

    throw new ApiError();
  }
}

export class ApiError extends Error {
  constructor(problem?: Problem) {
    super();

    this.problem = problem ?? { status: 500 };
  }

  readonly problem: Problem;
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
