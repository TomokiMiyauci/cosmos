import type { Node } from "../../types/node.ts";
import type { EntryId } from "./id.ts";
import type { EntryName } from "./name.ts";
import { Result } from "@miyauci/util";

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

export class EntryModel {
  readonly #value: string;
  private constructor(value: string) {
    this.#value = value;
  }

  static of(model: string): Result<EntryModel, Error> {
    if (!model) {
      return Result.error(new Error("invalid model"));
    }

    return Result.ok(new EntryModel(model));
  }

  get value(): string {
    return this.#value;
  }
}
