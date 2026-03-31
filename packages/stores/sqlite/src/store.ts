import type { Entry, Store } from "@cosmos/core";
import { DatabaseSync } from "node:sqlite";

export class SqliteStore implements Store {
  constructor(private db: DatabaseSync) {
    db.exec(`
CREATE TABLE IF NOT EXISTS contents (
  id TEXT PRIMARY KEY,
  type TEXT,
  model TEXT,
  data BLOB
);`);
  }

  async save(entry: Entry): Promise<void> {
    const value = entry.type === "node"
      ? JSON.stringify(entry.data)
      : await entry.data.bytes();

    this.db.prepare(
      `INSERT INTO contents (id, type, model, data) VALUES (?, ?, ?,CAST(? AS BLOB))
ON CONFLICT(id)
DO UPDATE SET 
  type = excluded.type, 
  model = excluded.model, 
  data = excluded.data;`,
    ).run(
      entry.id,
      entry.type,
      "model" in entry ? entry.model : null,
      value,
    );

    return Promise.resolve();
  }

  load(id: string): Promise<Entry> {
    const result = this.db.prepare(
      `SELECT type, model, data from contents where id = ?;`,
    ).get(id);

    console.log(id, result);

    if (!result) throw new Error();

    const type = result.type;
    const data = result.data;
    const model = result.model;

    if (type !== "node" && type !== "asset") throw new Error();

    if (!(data instanceof Uint8Array)) throw new Error();

    switch (type) {
      case "node": {
        if (typeof model !== "string") throw new Error();

        const text = new TextDecoder().decode(data);

        const node = JSON.parse(text);

        return Promise.resolve({ data: node, id, type, model });
      }
      case "asset": {
        const node = new Blob([new Uint8Array(data)]);
        return Promise.resolve({ data: node, id, type, model });
      }
    }
  }
}
