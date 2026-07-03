import {
  E as Entry,
  type EntryContext,
  type EntryId,
  type EntryRepositry,
} from "@cosmos/core";
import { Option } from "@miyauci/util";

export interface Store {
  get(url: URL): Promise<Blob | null>;
  delete(url: URL): Promise<void>;
  put(url: URL, blob: Blob): Promise<void>;
}

export interface Indexer {
  resolve(id: string): URL;
}

export class StoreEntryRespoistry implements EntryRepositry {
  constructor(private store: Store, private indexer: Indexer) {}
  async findById(
    id: EntryId,
    ctx: EntryContext,
  ): Promise<Option<Entry>> {
    const url = this.indexer.resolve(id.value);
    const blob = await this.store.get(url);

    if (!blob) return Option.none;

    const node = ctx.converter.fromBlog(blob);

    return Option.some(Entry.of(id, node));
  }

  save(entry: Entry, ctx: EntryContext): Promise<void> {
    const url = this.indexer.resolve(entry.id.value);
    const blob = ctx.converter.toBlob(entry.node);

    return this.store.put(url, blob);
  }

  delete(id: EntryId): Promise<void> {
    const url = this.indexer.resolve(id.value);

    return this.store.delete(url);
  }
}
