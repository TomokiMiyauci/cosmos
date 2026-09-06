import { Entry, Model } from "@cosmos/core";
import type {
  EntryQuery,
  EntryView as ServerEntryView,
} from "@cosmos/content-openapi/server";
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
    const content = to(entry.content);

    return { id: entry.id.value, modelId: entry.modelId.value, content };
  }

  #fromView(view: EntryView): Entry {
    const [entryId, entryIdError] = Entry.Id.of(view.id);

    if (entryIdError) throw new Error();
    const [modelId, modelIdError] = Model.Id.of(view.modelId);

    if (modelIdError) throw new Error();

    const content = Entry.Content.of(view.content);

    return Entry.of(entryId, modelId, content);
  }
}

function to(
  content: Entry.Content,
): EntryViewContent {
  if (Array.isArray(content)) {
    return content.map(to);
  }

  if (typeof content === "string") return content;
  if (typeof content === "boolean") return content;

  if (content instanceof Entry.Content.FiniteNumber) {
    return content.value;
  }

  return mapValues(content, to);
}

export interface Store {
  get(id: string): Promise<EntryView | null>;
  set(id: string, view: EntryView): Promise<void>;
  delete(id: string): Promise<void>;
}

interface EntryView {
  id: string;
  modelId: string;
  content: EntryViewContent;
}

export type EntryViewContent =
  | string
  | number
  | boolean
  | EntryViewContent[]
  | {
    [k: string]: EntryViewContent;
  };

export class DenoStore implements Store {
  constructor(private locator: Locator) {}
  async get(id: string): Promise<EntryView | null> {
    const url = this.locator.resolve(id);

    try {
      const text = await Deno.readTextFile(url);

      return this.#parse(text);
    } catch (e) {
      if (e instanceof Deno.errors.NotFound) {
        return null;
      }

      throw e;
    }
  }

  async set(id: string, view: EntryView): Promise<void> {
    const url = this.locator.resolve(id);
    const text = this.#stringify(view);

    await Deno.writeTextFile(url, text);
  }

  async delete(id: string): Promise<void> {
    const url = this.locator.resolve(id);

    await Deno.remove(url);
  }

  #parse(text: string): EntryView {
    return JSON.parse(text);
  }

  #stringify(view: EntryView): string {
    return JSON.stringify(view);
  }
}

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

      const parsed = this.#parse(result);

      return {
        id,
        modelId: parsed.model,
        content: parsed.contents,
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

      const { model, contents } = this.#parse(text);

      return {
        id: url.id,
        modelId: model,
        content: contents,
      };
    }));

    return texts;
  }

  #parse(value: string): { model: string; contents: any } {
    const result = JSON.parse(value);

    return {
      model: result.modelId,
      contents: result.content,
    };
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
