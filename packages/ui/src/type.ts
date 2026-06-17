import type { Field, Node } from "@cosmos/core";

export interface Content {
  id: string;
  field: Field;
  node: Node | null;
}

export interface Service {
  content: ContentService;
}

export interface Entry {
  id: string;
  node: Node;
}

export interface ContentService {
  get(id: Content["id"]): Promise<Content | null>;
  update(entry: Entry): Promise<Entry | null>;
}
