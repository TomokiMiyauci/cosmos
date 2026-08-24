export interface ModelQuery {
  findById(id: string): Promise<ModelView | null>;
  findAll(): Promise<ModelView[]>;
}

export interface ModelView {
  id: string;
  schemaId: string;
  type: ModelViewType;
}

export type ModelViewType = "collection" | "singleton";
