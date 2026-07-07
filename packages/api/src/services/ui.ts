import { parseToNode } from "@cosmos/parser";
import type {
  CmsService,
  Content,
  ContentsOption,
  Entry,
  Identity,
  Summary,
  Template,
} from "@cosmos/ui";
import type { Index, Model, Node, Resource } from "@cosmos/core";
import { Option, Result } from "@miyauci/util";
import { modelToField } from "../util.ts";
import { contract } from "../contract.ts";
import { initClient, type InitClientReturn } from "@ts-rest/core";
import { fromNode, toNode } from "../application/dto.ts";

class RestClient {
  #client: InitClientReturn<typeof contract, { baseUrl: string }>;
  constructor(entpoint: URL) {
    this.#client = initClient(contract, { baseUrl: entpoint.href });
  }

  async findResource(resourceId: string): Promise<Resource | null> {
    const result = await this.#client.getResource({
      params: { id: resourceId },
    });

    switch (result.status) {
      case 200: {
        return result.body;
      }
      case 404: {
        return null;
      }
      default: {
        throw new Error();
      }
    }
  }

  async findModel(modelId: string): Promise<Model | null> {
    const result = await this.#client.getModel({ params: { id: modelId } });

    switch (result.status) {
      case 200: {
        return result.body.model;
      }
      case 404: {
        return null;
      }
      default: {
        throw new Error();
      }
    }
  }

  async findModels(): Promise<{
    id: string;
    model: Model;
  }[]> {
    const result = await this.#client.getModels();

    switch (result.status) {
      case 200: {
        return result.body;
      }

      default: {
        throw new Error();
      }
    }
  }

  async createContent(
    name: string,
    model: string,
    node: Node,
  ): Promise<Result<Identity, Error>> {
    const result = await this.#client.postEntry({
      body: {
        node: fromNode(node),
        model,
        name,
      },
    });

    switch (result.status) {
      case 201: {
        return Result.ok({
          id: result.body.id,
        });
      }
    }

    return Result.error(new Error());
  }

  async findContents(
    option?: { resource?: string },
  ): Promise<Summary[]> {
    let model: string | undefined;

    if (option?.resource) {
      const resource = await this.findResource(option.resource);

      if (!resource) return [];

      model = resource.model;
    }

    const result = await this.#client.getSummaries({ query: { model } });

    switch (result.status) {
      case 200: {
        return result.body;
      }
      default: {
        throw new Error();
      }
    }
  }

  async findIndeies(): Promise<(Index & { id: string })[]> {
    const result = await this.#client.getSummaries();

    switch (result.status) {
      case 200: {
        return result.body;
      }
      default: {
        throw new Error();
      }
    }
  }

  async findResources(): Promise<{ id: string; model: string }[]> {
    const result = await this.#client.getResources();

    switch (result.status) {
      case 200: {
        return result.body;
      }
      default: {
        throw new Error();
      }
    }
  }

  async findContent(
    contentId: string,
  ): Promise<{ id: string; model: string; name: string; node: Node } | null> {
    const result = await this.#client.getEntry({ params: { id: contentId } });

    switch (result.status) {
      case 200: {
        const dto = result.body;

        return {
          id: dto.id,
          model: dto.model,
          name: dto.name,
          node: toNode(dto.node),
        };
      }
      case 400: {
        throw new Error();
      }
      case 404: {
        return null;
      }
      default: {
        throw new Error();
      }
    }
  }

  async updateContent(
    content: { id: string; node: Node; name: string },
  ): Promise<void> {
    const result = await this.#client.putEntry({
      body: { name: content.name, node: fromNode(content.node) },
      params: { id: content.id },
    });
  }

  async deleteContent(contentId: string): Promise<void> {
    await this.#client.deleteEntry({ params: { id: contentId } });
  }
}

export class RestCmsService implements CmsService {
  #client: RestClient;
  constructor(endpoint: URL) {
    this.#client = new RestClient(endpoint);
  }

  async findTemplate(resourceId: string): Promise<Template | null> {
    const resource = await this.#client.findResource(resourceId);

    if (!resource) return null;

    const modelId = resource.model;
    const model = await this.#client.findModel(modelId);

    if (!model) return null;

    const allModels = await this.#client.findModels();

    const modelRecord = new Map(
      allModels.map(({ id, model }) => [id, model] as const),
    );

    const indexies = await this.#client.findIndeies();
    const resources = await this.#client.findResources();

    const store = indexies.filter((index) => index.type === "model").map(
      (index) => {
        const resource = resources.find((resource) =>
          resource.id === index.resource
        );

        if (!resource) return null;

        return {
          id: index.id,
          model: resource.model,
          resource: index.resource,
          name: index.name,
        };
      },
    ).filter((v) => !!v);

    const field = modelToField(model, (id) => {
      const value = modelRecord.get(id);

      if (!value) throw new Error();

      return value;
    }, (model) => {
      const values = store.filter((value) => value.model === model);

      return values;
    }, () => {
      return [];
    });

    return {
      field,
      node: null,
      meta: {
        title: model.title,
        description: model.description,
        model: modelId,
      },
    };
  }

  async findContent(id: Content["id"]): Promise<Option<Content>> {
    const content = await this.#client.findContent(id);

    if (!content) return Option.none;

    const modelId = content.model;
    const model = await this.#client.findModel(modelId);

    if (!model) return Option.none;

    const allModels = await this.#client.findModels();

    const modelRecord = new Map(
      allModels.map(({ id, model }) => [id, model] as const),
    );

    const node = parseToNode(content.node);

    const indexies = await this.#client.findIndeies();
    const resources = await this.#client.findResources();

    const store = indexies.filter((index) => index.type === "model").map(
      (index) => {
        const resource = resources.find((resource) =>
          resource.id === index.resource
        );

        if (!resource) return null;

        return {
          id: index.id,
          model: resource.model,
          resource: index.resource,
          name: index.name,
        };
      },
    ).filter((v) => !!v);

    const field = modelToField(model, (id) => {
      const value = modelRecord.get(id);

      if (!value) throw new Error();

      return value;
    }, (model) => {
      const values = store.filter((value) => value.model === model);

      return values;
    }, () => []);

    return Option.some({
      id: content.id,
      field,
      node,
      meta: {
        title: model.title,
        description: model.description,
        model: modelId,
      },
      name: content.name,
    });
  }

  findSummaries(option?: ContentsOption): Promise<Summary[]> {
    return this.#client.findContents({ resource: option?.resource });
  }

  findResources(): Promise<Identity[]> {
    return this.#client.findResources();
  }

  async saveEntry(entry: Entry): Promise<Result<Node, {}>> {
    await this.#client.updateContent({
      id: entry.id,
      node: entry.node,
      name: entry.summary.name,
    });

    return {
      ok: true,
      value: entry.node,
    };
  }

  async registerEntry(
    model: string,
    node: Node,
    summary: Summary,
  ): Promise<Result<Identity, {}>> {
    const result = await this.#client.createContent(summary.name, model, node);

    if (result.ok) {
      return Result.ok({ id: result.value.id });
    }

    return Result.error(new Error());
  }

  async eraseNodeById(id: string): Promise<void> {
    await this.#client.deleteContent(id);
  }
}
