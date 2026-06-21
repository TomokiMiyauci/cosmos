import type { Model, Node } from "@cosmos/core";

export interface Content {
  id: string;
  model: Model;
  node: Node | null;
}

export interface Usecase {
  findTemplateByModelId(modelId: string): Promise<Template>;
  findContentById(id: Content["id"]): Promise<Content>;
  queryContents(): Promise<Identity[]>;
  saveEntry(entry: Entry): Promise<void>;
  saveNode(node: Node): Promise<Identity>;
}

export interface Entry {
  id: string;
  node: Node | null;
}

export interface Template {
  node: Node | null;
  model: Model;
}

export interface Identity {
  id: string;
}
