import type { Schema } from "./entity.ts";
import type { SchemaId } from "./id.ts";

export interface SchemaRepository {
  findById(id: SchemaId): Promise<Schema | null>;
}
