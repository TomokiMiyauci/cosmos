import {
  E as Entry,
  type EntryId,
  EntryName,
  type EntryRepositry,
  ModelId,
  type Node,
} from "@cosmos/core";
import { Option } from "@miyauci/util";

export interface Data {
  name: string;
  node: Node;
  model: string;
}

export interface Store {
  get(url: URL): Promise<Data | null>;
  delete(url: URL): Promise<void>;
  put(url: URL, data: Data): Promise<void>;
}

export interface Indexer {
  resolve(id: string): URL;
}

export class StoreEntryRespoistry implements EntryRepositry {
  constructor(private store: Store, private indexer: Indexer) {}
  async findById(id: EntryId): Promise<Option<Entry>> {
    const url = this.indexer.resolve(id.value);
    const data = await this.store.get(url);

    if (!data) return Option.none;

    const [name, nameError] = EntryName.of(data.name);

    if (nameError) return Option.none;

    const [model, modelError] = ModelId.of(data.model);

    if (modelError) return Option.none;

    const entry = Entry.of(id, name, model, data.node);

    return Option.some(entry);
  }

  save(entry: Entry): Promise<void> {
    const url = this.indexer.resolve(entry.id.value);

    return this.store.put(url, {
      name: entry.name.value,
      node: entry.node,
      model: entry.modelId.value,
    });
  }

  delete(id: EntryId): Promise<void> {
    const url = this.indexer.resolve(id.value);

    return this.store.delete(url);
  }
}
