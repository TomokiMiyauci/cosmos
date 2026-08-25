export interface SchemaQuery {
  findById(id: string): Promise<SchemaView | null>;
  findAll(): Promise<SchemaView[]>;
}

export interface SchemaView {
  id: string;
}
