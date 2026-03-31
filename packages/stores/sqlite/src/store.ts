import type { Entry, Store } from "@cosmos/core";
import { DatabaseSync } from "node:sqlite";

export class SqliteStore implements Store {
  constructor(private db: DatabaseSync) {
    db.exec(`
CREATE TABLE IF NOT EXISTS entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  data BLOB NOT NULL
);

CREATE TABLE IF NOT EXISTS node_entries (
  entry_id INTEGER PRIMARY KEY REFERENCES entries(id) ON DELETE CASCADE,
  model TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS asset_entries (
  entry_id INTEGER PRIMARY KEY REFERENCES entries(id) ON DELETE CASCADE,
  asset_type TEXT
);
`);
  }

  async save(entry: Entry): Promise<void> {
    const assetType = entry.data.type;
    const encodedData = entry.type === "node"
    const isNode = entry.type === "node";
    const encodedData = isNode
      ? new TextEncoder().encode(JSON.stringify(entry.data))
      : new Uint8Array(await entry.data.arrayBuffer());

    const stme = this.db.prepare(
      `INSERT INTO entries (key, type, data) VALUES (?, ?, CAST(? AS BLOB))
    this.db.exec("BEGIN TRANSACTION");
    try {
      const stme = this.db.prepare(
        `INSERT INTO entries (key, type, data) VALUES (?, ?, CAST(? AS BLOB))
ON CONFLICT(key)
DO UPDATE SET
  key = excluded.key,
  type = excluded.type,
  data = excluded.data;`,
    ).run(entry.id, entry.type, encodedData);
      ).run(entry.id, entry.type, encodedData);

    const entryId = stme.lastInsertRowid;
    if (entry.type === "node") {
      this.db.prepare(
        `INSERT INTO node_entries (entry_id, model) VALUES (?, ?)
      const entryId = stme.lastInsertRowid;
      if (isNode) {
        this.db.prepare(
          `INSERT INTO node_entries (entry_id, model) VALUES (?, ?)
ON CONFLICT(entry_id)
DO UPDATE SET
  model = excluded.model;`,
      ).run(entryId, entry.model);
    } else {
      this.db.prepare(
        `INSERT INTO asset_entries (entry_id, asset_type) VALUES (?, ?)
        ).run(entryId, entry.model);
      } else {
        this.db.prepare(
          `INSERT INTO asset_entries (entry_id, asset_type) VALUES (?, ?)
ON CONFLICT(entry_id)
DO UPDATE SET
  asset_type = excluded.asset_type;`,
      ).run(entryId, assetType);
        ).run(entryId, (entry.data as Blob).type);
      }
      this.db.exec("COMMIT");
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    }
  }

  async load(id: string): Promise<Entry> {
    const meta = this.db.prepare(
      `SELECT id, type, data FROM entries WHERE key = ?;`,
    ).get(id);
    const row = this.db.prepare(`
      WITH entry_record AS (
        SELECT id, type, data FROM entries WHERE key = ?
      )
      SELECT 
        e.type, 
        e.data, 
        n.model, 
        a.asset_type
      FROM entry_record e
      LEFT JOIN node_entries n ON e.id = n.entry_id
      LEFT JOIN asset_entries a ON e.id = a.entry_id;
    `).get(id) as {
      type: string;
      data: Uint8Array;
      model: string | null;
      asset_type: string | null;
    } | undefined;

    if (!meta) throw new Error(`Entry not found: ${id}`);
    if (!row) throw new Error(`Entry not found: ${id}`);
    const { type, data, model, asset_type } = row;

    const { id: entryId, type, data } = meta;

    if (type !== "node" && type !== "asset") {
      throw new Error(`Invalid entry type: ${type}`);
    }
    if (!(data instanceof Uint8Array)) {
      throw new Error(`Invalid data for entry ${id}`);
    }

    if (type === "node") {
      const row = this.db.prepare(
        `SELECT model FROM node_entries WHERE entry_id = ?;`,
      ).get(entryId);

      if (!row || typeof row.model !== "string") {
      if (typeof model !== "string") {
        throw new Error(`Missing node metadata for ${id}`);
      }

      const text = new TextDecoder().decode(data);
      const node = JSON.parse(text);

      return { id, type, data: node, model: row.model };
      return { id, type, data: node, model };
    }

    const assetRow = this.db.prepare(
      `SELECT asset_type FROM asset_entries WHERE entry_id = ?;`,
    ).get(entryId);
    const assetType = assetRow?.asset_type ?? "";

    return { id, type, data: new Blob([data], { type: assetType }) };
    return { id, type, data: new Blob([data], { type: asset_type ?? "" }) };
  }
}
