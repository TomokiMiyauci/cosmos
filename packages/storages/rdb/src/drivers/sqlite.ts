// deno-lint-ignore no-external-import
import { DatabaseSync } from "node:sqlite";
import type { Driver } from "../type.ts";

export class SqliteDriver implements Driver {
  #db: DatabaseSync;
  constructor(path: string) {
    this.#db = new DatabaseSync(path);
  }

  query(sql: string): Uint8Array {
    const result = this.#db.prepare(sql).get();

    if (!result) throw new Error();

    const content = result.content;

    if (content instanceof Uint8Array) return content;

    throw new Error();
  }
}
