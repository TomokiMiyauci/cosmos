import type { Node, NodeEntry, Store } from "@cosmos/core";
import { DatabaseSync } from "node:sqlite";

export class SqliteStore implements Store {
  constructor(private db: DatabaseSync) {}

  save(source: NodeEntry): Promise<void> {
    const value = JSON.stringify(source.data);

    this.db.prepare(
      `INSERT INTO structures (id, model, data) VALUES (?, ?,CAST(? AS BLOB))
ON CONFLICT(id)
DO UPDATE SET 
  model = excluded.model, 
  data = excluded.data;`,
    ).run(
      source.id,
      source.model,
      value,
    );

    return Promise.resolve();
  }

  get(id: string): Promise<Node> {
    const result = this.db.prepare(
      `SELECT data from structures where id = ?;`,
    ).get(id);

    if (!result) throw new Error();

    const data = result.data;

    if (!(data instanceof Uint8Array)) throw new Error();

    const text = new TextDecoder().decode(data);

    const node = JSON.parse(text);

    return Promise.resolve(node);
  }
}
