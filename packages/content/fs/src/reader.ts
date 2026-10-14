import type {
  EntryReader,
  EntryReaderOptions,
  EntryView as ServerEntryView,
} from "@cosmos/content";
import { type EntryView, type Locator, parseText } from "./shared.ts";

export interface Reader {
  read(id: string): Promise<EntryView | null>;
  readAll(options?: ReaderOptions): Promise<EntryView[]>;
}

interface ReaderOptions {
  model?: string;
}

export class ReaderEntryQuery implements EntryReader {
  constructor(private reader: Reader) {}

  async findById(id: string): Promise<ServerEntryView | null> {
    const source = await this.reader.read(id);

    if (!source) return null;

    return toEntryView(source);
  }
  async findAll(options?: EntryReaderOptions): Promise<ServerEntryView[]> {
    const sources = await this.reader.readAll(options);

    return sources.map(toEntryView);
  }
}

function toEntryView(source: EntryView): ServerEntryView {
  return {
    id: source.id,
    modelId: source.modelId,
    content: source.content,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
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
        createdAt: parsed.createdAt,
        updatedAt: parsed.updatedAt,
      };
    } catch (e) {
      if (e instanceof Deno.errors.NotFound) {
        return null;
      }

      throw e;
    }
  }
  async readAll(options?: ReaderOptions): Promise<EntryView[]> {
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

      const { id, modelId, content, createdAt, updatedAt } = parseText(text);

      return { id, modelId, content, createdAt, updatedAt };
    }));

    if (options?.model) {
      return texts.filter(({ modelId }) => {
        return options.model === modelId;
      });
    } else {
      return texts;
    }
  }
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
