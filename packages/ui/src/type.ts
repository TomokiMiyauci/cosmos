import type { Model, Node } from "@cosmos/core";

export interface Content {
  id: string;
  model: Model;
  node: Node | null;
}

export interface Service {
  content: ContentService;
}

export interface Entry {
  id: string;
  node: Node | null;
}

export interface ContentService {
  get(id: Content["id"]): Promise<Content | null>;
  update(entry: Entry): Promise<boolean>;
}
