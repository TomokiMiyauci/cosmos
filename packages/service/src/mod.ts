import { parseToNode } from "@cosmos/parser";
import type {
  CmsService,
  Content,
  Entry,
  Field,
  Identity,
  Template,
} from "@cosmos/ui";
import { assertContent } from "@cosmos/json";
import type { Model, Node } from "@cosmos/core";
import { mapValues } from "@std/collections/map-values";

export class RestCmsService implements CmsService {
  #baseUrl: URL;
  constructor(endpoint: URL) {
    this.#baseUrl = endpoint;
  }

  async findTemplateByFieldId(model: string): Promise<Template | null> {
    const url = new URL(`./models/${model}`, this.#baseUrl);
    const modelResponse = await fetch(url);

    const result: { model: Model } = await modelResponse.json();
    const field = modelToField(result.model);

    return {
      field,
      node: null,
    };
  }

  async findContentById(id: Content["id"]): Promise<Content> {
    const url = new URL(`./contents/${id}`, this.#baseUrl);

    const response = await fetch(url);

    if (response.ok) {
      const json: unknown = await response.json();

      assertContent(json);

      const modelId = json.model;

      const url = new URL(`./models/${modelId}`, this.#baseUrl);

      const modelResponse = await fetch(url);

      if (!response.ok) {
        return null;
      }

      const model: { model: Model } = await modelResponse.json();

      const node = parseToNode(json.node);
      const field = modelToField(model.model);

      return {
        id: json.id,
        field,
        node,
      };
    }
  }

  async queryContents(): Promise<Identity[]> {
    const url = new URL(`./contents`, this.#baseUrl);

    const response = await fetch(url);

    if (response.ok) {
      const json: unknown = await response.json();

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

  async saveNode(node: Node): Promise<Identity> {
    const url = new URL(`./contents`, this.#baseUrl);
    const data = { node };
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

function modelToField(model: Model): Field {
  function to(model: Model, meta?: { required: boolean }): Field {
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
        const fields = mapValues(model.fields, (childModel, key) => {
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
          field: to(model.field),
        };
      }
      case "reference":
      case "asset":
      case "union":
      case "markdown":
      case "instance": {
        throw new Error();
      }
    }
  }

  return to(model);
}
