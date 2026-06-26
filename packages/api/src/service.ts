import { parseToNode } from "@cosmos/parser";
import type {
  CmsService,
  Content,
  ContentsOption,
  Entry,
  Field,
  Identity,
  Template,
} from "@cosmos/ui";
import { assertContent } from "@cosmos/json";
import type { Model, Node, Resource, Schema } from "@cosmos/core";
import { mapValues } from "@std/collections/map-values";
import type { Resource as C } from "./type.ts";

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
  ): Promise<{ id: string; resource: string }[]> {
    const resourceId = option?.resource;
    const url = new URL(`./contents`, this.entpoint);

    if (resourceId) {
      url.searchParams.set("resource", resourceId);
    }

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

  async findContent(contentId: string): Promise<C | null> {
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

    const contents = await this.#client.findContents();
    const resources = await this.#client.findResources();

    const store = contents.map((index) => {
      const resource = resources.find((resource) =>
        resource.id === index.resource
      );

      if (!resource) return null;

      return {
        id: index.id,
        model: resource.model,
        resource: index.resource,
      };
    }).filter((v) => !!v);

    const field = modelToField(model, (id) => {
      const value = modelRecord.get(id);

      if (!value) throw new Error();

      return value;
    }, (model) => {
      const values = store.filter((value) => value.model === model).map((
        value,
      ) => value.id);

      return values;
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

    const contents = await this.#client.findContents();
    const resources = await this.#client.findResources();

    const store = contents.map((index) => {
      const resource = resources.find((resource) =>
        resource.id === index.resource
      );

      if (!resource) return null;

      return {
        id: index.id,
        model: resource.model,
        resource: index.resource,
      };
    }).filter((v) => !!v);

    const field = modelToField(model, (id) => {
      const value = modelRecord.get(id);

      if (!value) throw new Error();

      return value;
    }, (model) => {
      const values = store.filter((value) => value.model === model).map((
        value,
      ) => value.id);

      return values;
    });

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

  findContents(option?: ContentsOption): Promise<Identity[]> {
    return this.#client.findContents({ resource: option?.resource });
  }

  findResources(): Promise<Identity[]> {
    return this.#client.findResources();
  }

  async saveEntry(entry: Entry): Promise<void> {
    if (entry.node) {
      await this.#client.updateContent({ id: entry.id, node: entry.node });
    } else {
      await this.#client.deleteContent(entry.id);
    }
  }

  async saveNode(resourceId: string, node: Node): Promise<Identity> {
    const url = new URL(`./contents`, this.#baseUrl);
    const data = { node, resource: resourceId };
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
        id: json.id,
      };
    }

    throw new Error();
  }

  async eraseNodeById(id: string): Promise<void> {
    await this.#client.deleteContent(id);
  }
}

function modelToField(
  model: Model,
  getModel: (modelId: string) => Model,
  getIndexies: (modelId: string) => string[],
): Field {
  function to(
    schema: Schema,
    meta?: { required: boolean; description: string; title: string },
  ): Field {
    const required = meta?.required ?? false;
    const description = meta?.description ?? "";
    const title = meta?.title ?? "";

    switch (schema.type) {
      case "string": {
        return {
          type: "string",
          description,
          required,
          title,
        };
      }
      case "number": {
        return {
          type: "number",
          description,
          required,
          title,
        };
      }
      case "boolean": {
        return {
          type: "boolean",
          description,
          required,
          title,
        };
      }
      case "datetime": {
        return {
          type: "datetime",
          description,
          required,
          title,
        };
      }
      case "map": {
        const set = new Set(schema.required);
        const fields = mapValues(schema.props, (childModel, key) => {
          return to(childModel.schema, {
            required: set.has(key),
            description: childModel.description,
            title: childModel.title,
          });
        });
        return {
          type: "map",
          fields,
          title,
          description,
          required,
        };
      }
      case "list": {
        return {
          type: "list",
          field: to(schema.item),
          title,
          description,
          required,
        };
      }
      case "reference": {
        const candidates = getIndexies(schema.model);

        return {
          type: "reference",
          candidates,
          description,
          title,
          required,
        };
      }
      case "instance": {
        const childModel = getModel(schema.model);

        return to(childModel.schema, {
          description: childModel.description,
          title: childModel.title,
          required: false,
        });
      }
      case "union": {
        const variants = mapValues(
          schema.variants,
          (model) => to(model.schema),
        );
        return {
          type: "union",
          variants,
          title,
          description,
          required,
        };
      }
      case "asset":
      case "markdown": {
        throw new Error();
      }
    }
  }

  return to(model.schema);
}
