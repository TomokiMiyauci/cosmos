import type { Node } from "../../types/node.ts";
import type { EntryId } from "./id.ts";
import type { EntryName } from "./name.ts";
import type { EntryModel } from "./model.ts";

export class Entry {
  private constructor(
    id: EntryId,
    name: EntryName,
    model: EntryModel,
    node: Node,
  ) {
    this.#id = id;
    this.#node = node;
    this.#name = name;
    this.#model = model;
  }
  readonly #id: EntryId;
  readonly #node: Node;
  readonly #name: EntryName;
  readonly #model: EntryModel;

  static of(
    id: EntryId,
    name: EntryName,
    model: EntryModel,
    node: Node,
  ): Entry {
    return new Entry(id, name, model, node);
  }

  get id(): EntryId {
    return this.#id;
  }

  get name(): EntryName {
    return this.#name;
  }

  get node(): Node {
    return this.#node;
  }

  get model(): EntryModel {
    return this.#model;
  }
}
