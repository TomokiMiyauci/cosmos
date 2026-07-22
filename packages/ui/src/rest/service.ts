import type {
  CmsService,
  Content,
  ContentsOption,
  Entry,
  Field,
  Identity,
  Summary,
  Template,
} from "../type.ts";
import {
  Client,
  type Contents,
  type Entry as EntryResponse,
  type Resource as ResourceDto,
} from "@cosmos/rest/client";
import { Result } from "@miyauci/util";
import type {
  AssetNode,
  BooleanNode,
  DatetimeNode,
  ListNode,
  MapNode,
  Model,
  Node,
  NumberNode,
  ReferenceNode,
  StringNode,
  UnionNode,
} from "@cosmos/core";
import { mapValues } from "@std/collections";

export class RestCmsService implements CmsService {
  #client: Client;
  constructor(endpoint: URL) {
    this.#client = new Client(endpoint);
  }

  async #findResource(resourceId: string): Promise<ResourceDto | null> {
    const [data, error] = await this.#client.getResource(resourceId);

    if (error) {
      switch (error.problem.status) {
        case 404: {
          return null;
        }
      }

      throw error;
    }

    return data;
  }

  async findModel(modelId: string): Promise<Model | null> {
    const [data, error] = await this.#client.getModel(modelId);

    if (error) {
      switch (error.problem.status) {
        case 404: {
          return null;
        }
      }

      throw error;
    }

    return data;
  }

  async findModels(): Promise<{
    id: string;
    model: Model;
  }[]> {
    const [data, error] = await this.#client.getModels();

    if (error) throw error;

    return data.map((model) => ({ id: model.id, model: model }));
  }

  async findTemplate(resourceId: string): Promise<Template | null> {
    const resource = await this.#findResource(resourceId);

    if (!resource) return null;

    const modelId = resource.model;
    const model = await this.findModel(modelId);

    if (!model) return null;

    const indexies = await this.#findIndeies();
    const resources = await this.findResources();

    const store = indexies.map(
      (index) => {
        const resource = resources.find((resource) => resource.id === index.id);

        if (!resource) return null;

        return {
          id: index.id,
          model: resource.model,
          name: index.id,
        };
      },
    ).filter((v) => !!v);

    const field = modelToField(model, (model) => {
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

  async #findContent(
    contentId: string,
  ): Promise<EntryResponse | null> {
    const [data, error] = await this.#client.getEntry(contentId);

    if (error) {
      switch (error.problem.status) {
        case 404: {
          return null;
        }
      }
    }

    return data;
  }

  async findContent(id: Content["id"]): Promise<Content | null> {
    const content = await this.#findContent(id);

    if (!content) return null;

    const modelId = content.model;
    const model = await this.findModel(modelId);

    if (!model) return null;

    const allModels = await this.findModels();

    const modelRecord = new Map(
      allModels.map(({ id, model }) => [id, model] as const),
    );

    const node = toNodeFromContents(content.contents, model, modelRecord);

    const indexies = await this.#findIndeies();
    const resources = await this.findResources();

    const store = indexies.map(
      (index) => {
        const resource = resources.find((resource) => resource.id === index.id);

        if (!resource) return null;

        return {
          id: index.id,
          model: resource.model,
          name: index.id,
        };
      },
    ).filter((v) => !!v);

    const field = modelToField(model, (model) => {
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
        model: modelId,
      },
      name: content.name,
    };
  }

  async #findIndeies(): Promise<ResourceDto[]> {
    const [data, error] = await this.#client.getResources();

    if (error) {
      throw error;
    }

    return data;
  }

  async findSummaries(option?: ContentsOption): Promise<Summary[]> {
    let model: string | undefined;

    if (option?.resource) {
      const resource = await this.#findResource(option.resource);

      if (!resource) return [];

      model = resource.model;
    }

    const result = await this.#client.getEntrySummaries({ model });

    return result;
  }

  async findResources(): Promise<ResourceDto[]> {
    const [data, error] = await this.#client.getResources();

    if (error) throw error;

    return data;
  }

  async saveEntry(entry: Entry, model: string): Promise<Result<Node, {}>> {
    await this.#client.putEntry({
      name: entry.summary.name,
      contents: toContents(entry.node),
      id: entry.id,
      model,
    });

    return Result.ok(entry.node);
  }

  async registerEntry(
    model: string,
    node: Node,
    summary: Summary,
  ): Promise<Result<Identity, {}>> {
    const [data, error] = await this.#client.postEntry({
      contents: toContents(node),
      model,
      name: summary.name,
    });

    if (error) {
      throw new Error();
    }

    return Result.ok({
      id: data.id,
    });
  }

  async eraseNodeById(id: string): Promise<void> {
    await this.#client.deleteEntry(id);
  }
}

export function fromNode(node: Node): NodeJson {
  switch (node.type) {
    case "string":
    case "number":
    case "reference":
    case "asset":
    case "boolean": {
      return { ...node };
    }
    case "datetime": {
      return {
        type: "datetime",
        value: node.value.toString(),
      };
    }
    case "union": {
      return {
        ...node,
        value: fromNode(node.value),
      };
    }
    case "list": {
      return {
        type: "list",
        value: node.value.map(fromNode),
      };
    }
    case "markdown": {
      return {
        type: "string",
        value: "",
      };
    }
    case "map": {
      return {
        type: "map",
        value: mapValues(node.value, fromNode),
      };
    }
  }
}

export type NodeJson =
  | StringNodeJson
  | NumberNodeJson
  | BooleanNodeJson
  | DatetimeNodeJson
  | ReferenceNodeJson
  | AssetNodeJson
  | UnionNodeJson
  | ListNodeJson
  | MapNodeJson;

interface StringNodeJson extends StringNode, JsonObject {}

interface NumberNodeJson extends NumberNode, JsonObject {}

interface UnionNodeJson extends JsonObject {
  type: UnionNode["type"];
  key: UnionNode["key"];
  value: NodeJson;
}

interface BooleanNodeJson extends BooleanNode, JsonObject {}

interface ReferenceNodeJson extends ReferenceNode, JsonObject {}

interface AssetNodeJson extends AssetNode, JsonObject {}

interface DatetimeNodeJson extends JsonObject {
  type: DatetimeNode["type"];
  value: string;
}

interface ListNodeJson extends JsonObject {
  type: ListNode["type"];
  value: NodeJson[];
}

interface MapNodeJson extends JsonObject {
  type: MapNode["type"];
  value: Record<string, NodeJson>;
}

export type Json = JsonValue | JsonObject | Json[];

export type JsonObject = { readonly [k: string]: Json };

export type JsonValue =
  | string
  | number
  | boolean
  | null;

export function modelToField(
  model: Model,
  getIndexies: (modelId: string) => Summary[],
  getAssets: () => Summary[],
): Field {
  function to(
    model: Model,
    meta?: { required: boolean; description: string; title: string },
  ): Field {
    const required = meta?.required ?? false;
    const description = meta?.description ?? "";
    const title = meta?.title ?? "";

    switch (model.type) {
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
        const set = new Set(model.required);
        const fields = mapValues(model.props, (childModel, key) => {
          return to(childModel, {
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
          field: to(model.item),
          title,
          description,
          required,
        };
      }
      case "reference": {
        const candidates = getIndexies(model.model);

        return {
          type: "reference",
          candidates,
          description,
          title,
          required,
        };
      }
      case "union": {
        const variants = mapValues(
          model.variants,
          (model) => to(model),
        );
        return {
          type: "union",
          variants,
          title,
          description,
          required,
        };
      }
      case "asset": {
        const candidates = getAssets();

        return {
          type: "asset",
          title,
          description,
          required,
          candidates,
        };
      }
      case "markdown": {
        throw new Error();
      }
    }
  }

  return to(model);
}

function toNodeFromContents(
  contents: Contents,
  model: Model,
  store: Map<string, Model>,
): Node {
  switch (model.type) {
    case "string": {
      if (typeof contents === "string") {
        return {
          type: "string",
          value: contents,
        };
      }

      throw new Error();
    }
    case "number": {
      if (typeof contents === "number") {
        return {
          type: "number",
          value: contents,
        };
      }

      throw new Error();
    }
    case "boolean": {
      if (typeof contents === "boolean") {
        return {
          type: "boolean",
          value: contents,
        };
      }

      throw new Error();
    }
    case "datetime": {
      if (typeof contents === "string") {
        return {
          type: "datetime",
          value: new Date(contents),
        };
      }

      throw new Error();
    }
    case "map": {
      if (typeof contents === "object" && !Array.isArray(contents)) {
        const props = model.props;

        const value = mapValues(
          contents,
          (contents, key) => toNodeFromContents(contents, props[key]!, store),
        );
        return {
          type: "map",
          value,
        };
      }

      throw new Error();
    }
    case "list": {
      if (Array.isArray(contents)) {
        const value = contents.map((child) =>
          toNodeFromContents(child, model, store)
        );

        return {
          type: "list",
          value,
        };
      }

      throw new Error();
    }
    case "union": {
      if (Array.isArray(contents)) {
        const [first, second] = contents;

        if (typeof first === "string") {
          const variant = model.variants[first];

          if (variant) {
            return {
              type: "union",
              key: first,
              value: toNodeFromContents(second, variant, store),
            };
          }
        }
      }

      throw new Error();
    }

    case "reference": {
      if (typeof contents === "string") {
        return {
          type: "reference",
          value: contents,
        };
      }

      throw new Error();
    }
    case "asset":
    case "markdown": {
      throw new Error();
    }
  }
}

function toContents(node: Node): Contents {
  switch (node.type) {
    case "boolean":
    case "reference":
    case "number":
    case "asset":
    case "string": {
      return node.value;
    }
    case "datetime": {
      return node.value.toISOString();
    }
    case "union": {
      return [node.key, toContents(node.value)];
    }
    case "map": {
      return mapValues(node.value, toContents);
    }
    case "list": {
      return node.value.map(toContents);
    }
    case "markdown": {
      throw new Error();
    }
  }
}
