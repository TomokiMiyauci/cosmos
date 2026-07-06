import { parseToNode } from "@cosmos/parser";
import type {
  CmsService,
  Content,
  ContentsOption,
  Identity,
  Result,
  Summary,
  Template,
} from "@cosmos/ui";
import type { Index, Model, Node, Resource } from "@cosmos/core";
import { Option } from "@miyauci/util";
import type { Entry } from "../type.ts";
import { modelToField } from "../util.ts";
import { contract } from "../contract.ts";
import { initClient, type InitClientReturn } from "@ts-rest/core";
import { fromNode, toNode } from "../dto.ts";

class RestClient {
  #client: InitClientReturn<typeof contract, { baseUrl: string }>;
  constructor(private entpoint: URL) {
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

  async findContents(
    option?: { resource?: string },
  ): Promise<Summary[]> {
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

  async findContent(contentId: string): Promise<Entry | null> {
    const result = await this.#client.getEntry({ params: { id: contentId } });

    switch (result.status) {
      case 200: {
        const dto = result.body;

        return {
          id: dto.id,
          model: BBBBBBBBB,
          // name: dto.name,
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

  async updateContent(content: { id: string; node: Node }): Promise<void> {
    const result = await this.#client.putEntry({
      body: { name: AAAAAAAA, node: fromNode(content.node) },
      params: { id: content.id },
    });
  }

  async deleteContent(contentId: string): Promise<void> {
    await this.#client.deleteEntry({ params: { id: contentId } });
  }
}

const AAAAAAAA = "ff";
const BBBBBBBBB = "post";

export class RestCmsService implements CmsService {
  #baseUrl: URL;
  #client: RestClient;
  constructor(endpoint: URL) {
    this.#baseUrl = endpoint;

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
      },
    });
  }

  findSummaries(option?: ContentsOption): Promise<Summary[]> {
    return this.#client.findContents({ resource: option?.resource });
  }

  findResources(): Promise<Identity[]> {
    return this.#client.findResources();
  }

  async saveEntry(entry: Entry): Promise<Result<Node, {}>> {
    await this.#client.updateContent({ id: entry.id, node: entry.node });

    return {
      ok: true,
      data: entry.node,
    };
  }

  async registerEntry(
    resourceId: string,
    node: Node,
    summary: Summary,
  ): Promise<Result<Identity, {}>> {
    const url = new URL(`./entries`, this.#baseUrl);
    const data = { node, resource: resourceId, name: summary.name };
    const body = JSON.stringify(data);
    const request = new Request(url, {
      body,
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
    });
    const response = await fetch(request);

    if (response.ok) {
      const json: { id: string } = await response.json();

      return {
        ok: true,
        data: {
          id: json.id,
        },
      };
    }

    throw new Error();
  }

  async eraseNodeById(id: string): Promise<void> {
    await this.#client.deleteContent(id);
  }
}
