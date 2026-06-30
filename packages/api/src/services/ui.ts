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
import { assertContent } from "@cosmos/json";
import type { Index, Model, Node, Resource } from "@cosmos/core";
import type { Entry } from "../type.ts";
import { modelToField } from "../util.ts";

class RestClient {
  constructor(private entpoint: URL) {}

  async findResource(resourceId: string): Promise<Resource | null> {
    const url = new URL(`./resources/${resourceId}`, this.entpoint);
    const response = await fetch(url);

    const resource: Resource = await response.json();

    return resource;
  }

  async findModel(modelId: string): Promise<Model | null> {
    const url = new URL(`./models/${modelId}`, this.entpoint);
    const modelResponse = await fetch(url);

    const result: { model: Model } = await modelResponse.json();

    return result.model;
  }

  async findModels(): Promise<{
    id: string;
    model: Model;
  }[]> {
    const url = new URL(`./models`, this.entpoint);
    const modelResponse = await fetch(url);
    const result: { id: string; model: Model }[] = await modelResponse.json();

    return result;
  }

  async findContents(
    option?: { resource?: string },
  ): Promise<Summary[]> {
    const resourceId = option?.resource;
    const url = new URL(`./indexies`, this.entpoint);

    if (resourceId) {
      url.searchParams.set("resource", resourceId);
    }

    const response = await fetch(url);

    const json = await response.json();

    return json;
  }

  async findIndeies(): Promise<(Index & { id: string })[]> {
    const url = new URL(`./indexies`, this.entpoint);

    const response = await fetch(url);

    const json = await response.json();

    return json;
  }

  async findResources(): Promise<{ id: string; model: string }[]> {
    const url = new URL(`./resources`, this.entpoint);

    const response = await fetch(url);

    const json = await response.json();

    return json;
  }

  async findContent(contentId: string): Promise<Entry | null> {
    const url = new URL(`./contents/${contentId}`, this.entpoint);

    const response = await fetch(url);

    const json: unknown = await response.json();

    assertContent(json);

    return json;
  }

  async updateContent(content: { id: string; node: Node }): Promise<void> {
    const url = new URL(`./contents/${content.id}`, this.entpoint);

    const body = JSON.stringify(content);

    await fetch(url, {
      body,
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
    });
  }

  async deleteContent(contentId: string): Promise<void> {
    const url = new URL(`./contents/${contentId}`, this.entpoint);
    const request = new Request(url, { method: "DELETE" });

    await fetch(request);
  }
}

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

  async findContent(id: Content["id"]): Promise<Content> {
    const content = await this.#client.findContent(id);

    if (!content) throw new Error();

    const modelId = content.model;
    const model = await this.#client.findModel(modelId);

    if (!model) throw new Error();

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

    return {
      id: content.id,
      field,
      node,
      meta: {
        title: model.title,
        description: model.description,
      },
    };
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
    const url = new URL(`./contents`, this.#baseUrl);
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
