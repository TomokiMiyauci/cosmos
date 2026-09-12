import { Entry, Model } from "@cosmos/core";
import type {
  EntryQuery,
  EntryView as ServerEntryView,
} from "@cosmos/content-openapi/server";
import {
  Identifier,
  type MapValue,
  NumberValue,
  type SchemaValue,
  type SequenseValue,
} from "@cosmos/schema";
import { isIdentifier, isNumberValue } from "@cosmos/validator";
import { Result } from "@miyauci/util";
import { mapValues } from "@std/collections/map-values";

export class StoreEntryRepository implements Entry.Repositry {
  constructor(private store: Store) {}
  async findById(id: Entry.Id): Promise<Entry | null> {
    const view = await this.store.get(id.value);

    if (!view) return null;

    return this.#fromView(view);
  }
  async save(entry: Entry): Promise<void> {
    const view = this.#toView(entry);

    await this.store.set(entry.id.value, view);
  }
  async delete(id: Entry.Id): Promise<void> {
    await this.store.delete(id.value);
  }

  #toView(entry: Entry): EntryView {
    return {
      id: entry.id.value,
      modelId: entry.modelId.value,
      content: entry.content,
    };
  }

  #fromView(view: EntryView): Entry {
    const [entryId, entryIdError] = Entry.Id.of(view.id);

    if (entryIdError) throw new Error();
    const [modelId, modelIdError] = Model.Id.of(view.modelId);

    if (modelIdError) throw new Error();

    return Entry.of(entryId, modelId, view.content);
  }
}

export interface Store {
  get(id: string): Promise<EntryView | null>;
  set(id: string, view: EntryView): Promise<void>;
  delete(id: string): Promise<void>;
}

interface EntryView {
  id: string;
  modelId: string;
  content: SchemaValue;
}

export class DenoStore implements Store {
  constructor(private locator: Locator) {}
  async get(id: string): Promise<EntryView | null> {
    const url = this.locator.resolve(id);

    try {
      const text = await Deno.readTextFile(url);

      const parsed = parseText(text);

      return parsed;
    } catch (e) {
      if (e instanceof Deno.errors.NotFound) {
        return null;
      }

      throw e;
    }
  }

  async set(id: string, view: EntryView): Promise<void> {
    const url = this.locator.resolve(id);
    const text = stringify(view);

    await Deno.writeTextFile(url, text);
  }

  async delete(id: string): Promise<void> {
    const url = this.locator.resolve(id);

    await Deno.remove(url);
  }
}

function parseText(value: string): EntryView {
  const json = JSON.parse(value);

  const [content, error] = node2SchemaValue(json.content);

  if (error) throw new Error("invalid content");

  return {
    id: json.id,
    modelId: json.modelId,
    content,
  };
}

function stringify(view: EntryView): string {
  const json = {
    id: view.id,
    modelId: view.modelId,
    content: schemaValue2Node(view.content),
  };

  return JSON.stringify(json);
}

function node2SchemaValue(node: SchemaNode): Result<SchemaValue, Error> {
  switch (node.type) {
    case "string": {
      return Result.ok(node.value);
    }
    case "number": {
      return NumberValue.of(node.value);
    }
    case "boolean": {
      return Result.ok(node.value);
    }
    case "id": {
      return Identifier.of(node.value);
    }
    case "map": {
      const map: MapValue<SchemaValue> = {};

      for (const [key, value] of Object.entries(node.value)) {
        const [child, error] = node2SchemaValue(value);

        if (error) return Result.error(error);

        map[key] = child;
      }

      return Result.ok(map);
    }
    case "sequense": {
      const set: SequenseValue<SchemaValue> = [];
      for (const value of node.value) {
        const [child, error] = node2SchemaValue(value);

        if (error) return Result.error(error);

        set.push(child);
      }

      return Result.ok(set);
    }
  }
}

function schemaValue2Node(value: SchemaValue): SchemaNode {
  if (typeof value === "string") {
    return { type: "string", value };
  }

  if (isNumberValue(value)) {
    return { type: "number", value: value.value };
  }

  if (typeof value === "boolean") {
    return { type: "boolean", value };
  }

  if (isIdentifier(value)) {
    return { type: "id", value: value.value };
  }

  if (Array.isArray(value)) {
    return { type: "sequense", value: value.map(schemaValue2Node) };
  }

  return {
    type: "map",
    value: mapValues(value, schemaValue2Node),
  };
}

export type SchemaNode =
  | StringNode
  | NumberNode
  | BooleanNode
  | IdentifierNode
  | MapNode
  | SequenseNode;

export type StringNode = {
  type: "string";
  value: string;
};

export type NumberNode = {
  type: "number";
  value: number;
};

export type BooleanNode = {
  type: "boolean";
  value: boolean;
};

export type IdentifierNode = {
  type: "id";
  value: string;
};

export type MapNode = {
  type: "map";
  value: {
    [key: string]: SchemaNode;
  };
};

export type SequenseNode = {
  type: "sequense";
  value: Array<SchemaNode>;
};

export class ReaderEntryQuery implements EntryQuery {
  constructor(private reader: Reader) {}

  async findById(id: string): Promise<ServerEntryView | null> {
    const source = await this.reader.read(id);

    if (!source) return null;

    return toEntryView(source);
  }
  async findAll(): Promise<ServerEntryView[]> {
    const sources = await this.reader.readAll();

    return sources.map(toEntryView);
  }
}

export interface Reader {
  read(id: string): Promise<EntryView | null>;
  readAll(): Promise<EntryView[]>;
}

function toEntryView(source: EntryView): ServerEntryView {
  return {
    id: source.id,
    modelId: source.modelId,
    content: source.content,
  };
}

export class DenoReader implements Reader {
  constructor(private locator: Locator) {}
  async read(id: string): Promise<EntryView | null> {
    const url = this.locator.resolve(id);

    try {
      const result = await Deno.readTextFile(url);

      const parsed = parseText(result);

      return {
        id: parsed.id,
        modelId: parsed.modelId,
        content: parsed.content,
      };
    } catch (e) {
      if (e instanceof Deno.errors.NotFound) {
        return null;
      }

      throw e;
    }
  }
  async readAll(): Promise<EntryView[]> {
    const url = new URL(this.locator.locate());

    const iter = Deno.readDir(url);

    const dirEntries = await Array.fromAsync(iter);

    const urls = dirEntries.filter((entry) => entry.isFile).map((entry) => {
      const id = entry.name;

      const url = this.locator.resolve(id);

      return { url, id };
    });

    const texts = await Promise.all(urls.map(async (url) => {
      const text = await Deno.readTextFile(url.url);

      const { id, modelId, content } = parseText(text);

      return { id, modelId, content };
    }));

    return texts;
  }
}

export interface Locator {
  resolve(id: string): URL;
  locate(): URL;
}

export class BaseLocator implements Locator {
  constructor(private baseURL: URL) {}
  resolve(id: string): URL {
    return new URL(id, this.baseURL);
  }

  locate(): URL {
    return this.baseURL;
  }
}
