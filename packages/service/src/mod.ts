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
import type { Model, Node, Resource } from "@cosmos/core";
import { mapValues } from "@std/collections/map-values";

export class RestCmsService implements CmsService {
  #baseUrl: URL;
  constructor(endpoint: URL) {
    this.#baseUrl = endpoint;
  }

  async findTemplate(resourceId: string): Promise<Template | null> {
    const baseUrl = this.#baseUrl;
    const response = await fetch(
      new URL(`./resources/${resourceId}`, this.#baseUrl),
    );

    const resource: Resource = await response.json();
    const modelId = resource.model;
    const url = new URL(`./models/${modelId}`, this.#baseUrl);
    const modelResponse = await fetch(url);

    const result: { model: Model } = await modelResponse.json();
    const allModels = await findModels(baseUrl);

    const modelRecord = new Map(
      allModels.map(({ id, model }) => [id, model] as const),
    );

    const contents = await findContents(baseUrl);
    const resources = await findResources(baseUrl);

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

    const field = modelToField(result.model, (id) => {
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
    };
  }

  async findContent(id: Content["id"]): Promise<Content> {
    const url = new URL(`./contents/${id}`, this.#baseUrl);
    const baseUrl = this.#baseUrl;

    const response = await fetch(url);

    if (response.ok) {
      const json: unknown = await response.json();

      assertContent(json);

      const modelId = json.model;
      const model = await findModel(modelId, baseUrl);

      const allModels = await findModels(baseUrl);

      const modelRecord = new Map(
        allModels.map(({ id, model }) => [id, model] as const),
      );

      const node = parseToNode(json.node);

      const contents = await findContents(baseUrl);
      const resources = await findResources(baseUrl);

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
        id: json.id,
        field,
        node,
      };
    }
  }

  async findContents(option?: ContentsOption): Promise<Identity[]> {
    const url = new URL(`./contents`, this.#baseUrl);

    const resourceId = option?.resource;

    if (resourceId) {
      url.searchParams.set("resource", resourceId);
    }

    const response = await fetch(url);

    if (response.ok) {
      const json: unknown = await response.json();

      return json;
    }

    throw new Error();
  }

  async findResources(): Promise<Identity[]> {
    const url = new URL("./resources", this.#baseUrl);

    const response = await fetch(url);

    if (response.ok) {
      const json = await response.json();

      return json;
    }

    throw new Error();
  }

  async saveEntry(entry: Entry): Promise<void> {
    const url = new URL(`./contents/${entry.id}`, this.#baseUrl);

    const body = JSON.stringify(entry);

    const response = await fetch(url, {
      body,
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
    });

    return response.ok;
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
    const url = new URL(`./contents/${id}`, this.#baseUrl);
    const request = new Request(url, { method: "DELETE" });
    const response = await fetch(request);
  }
}

async function findModels(baseUrl: URL): Promise<{
  id: string;
  model: Model;
}[]> {
  const url = new URL(`./models`, baseUrl);
  const modelResponse = await fetch(url);
  const result: {
    id: string;
    model: Model;
  }[] = await modelResponse.json();

  return result;
}

async function findModel(modelId: string, baseUrl: URL): Promise<Model> {
  const url = new URL(`./models/${modelId}`, baseUrl);

  const modelResponse = await fetch(url);
  const model: { model: Model } = await modelResponse.json();

  return model.model;
}

async function findContents(
  baseUrl: URL,
): Promise<{ id: string; resource: string }[]> {
  const url = new URL(`./contents`, baseUrl);

  const response = await fetch(url);

  const json = await response.json();

  return json;
}

async function findResources(
  baseUrl: URL,
): Promise<{ id: string; model: string }[]> {
  const url = new URL(`./resources`, baseUrl);

  const response = await fetch(url);

  const json = await response.json();

  return json;
}

function modelToField(
  model: Model,
  getModel: (modelId: string) => Model,
  getIndexies: (modelId: string) => string[],
): Field {
  function to(
    model: Model,
    meta?: { required: boolean },
  ): Field {
    const required = meta?.required ?? false;
    const description = model.description ?? "";

    switch (model.type) {
      case "string": {
        return {
          type: "string",
          description,
          required,
        };
      }
      case "number": {
        return {
          type: "number",
          description,
          required,
        };
      }
      case "boolean": {
        return {
          type: "boolean",
          description,
          required,
        };
      }
      case "datetime": {
        return {
          type: "datetime",
          description,
          required,
        };
      }
      case "map": {
        const set = new Set(model.required);
        const fields = mapValues(model.props, (childModel, key) => {
          return to(childModel, { required: set.has(key) });
        });
        return {
          type: "map",
          fields,
        };
      }
      case "list": {
        return {
          type: "list",
          field: to(model.item),
        };
      }
      case "reference": {
        const candidates = getIndexies(model.model);

        return {
          type: "reference",
          candidates,
        };
      }
      case "instance": {
        const childModel = getModel(model.model);

        return to(childModel);
      }
      case "asset":
      case "union":
      case "markdown": {
        throw new Error();
      }
    }
  }

  return to(model);
}
