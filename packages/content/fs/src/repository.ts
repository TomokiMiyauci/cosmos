import { Entry, Model } from "@cosmos/content";
import type { SchemaValue } from "@cosmos/schema";
import { isIdentifier, isNumberValue } from "@cosmos/validator";
import { mapValues } from "@std/collections/map-values";
import {
  type EntryView,
  type Locator,
  parseText,
  type SchemaNode,
} from "./shared.ts";

export interface Store {
  get(id: string): Promise<EntryView | null>;
  set(id: string, view: EntryView): Promise<void>;
  delete(id: string): Promise<void>;
}

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
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  }

  #fromView(view: EntryView): Entry {
    const [entryId, entryIdError] = Entry.Id.of(view.id);

    if (entryIdError) throw new Error();
    const [modelId, modelIdError] = Model.Id.of(view.modelId);

    if (modelIdError) throw new Error();

    return Entry.of(
      entryId,
      modelId,
      view.content,
      view.createdAt,
      view.updatedAt,
    );
  }
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

function stringify(view: EntryView): string {
  const json = {
    id: view.id,
    modelId: view.modelId,
    content: schemaValue2Node(view.content),
    createdAt: view.createdAt.toJSON(),
    updatedAt: view.updatedAt.toJSON(),
  };

  return JSON.stringify(json);
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
    return { type: "sequence", value: value.map(schemaValue2Node) };
  }

  return {
    type: "map",
    value: mapValues(value, schemaValue2Node),
  };
}
