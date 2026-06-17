import type { Field, Node } from "@cosmos/core";

export interface Client {
  content: ContentService;
  contents: ContentsClient;
}

export interface ContentsClient {
  get(): Promise<Content[]>;
}

export interface Content {
  id: string;
  field: Field;
  node: Node | null;
}

export interface Service {
  content: ContentService;
}

interface Entry {
  id: string;
  node: Node;
}

export interface ContentService {
  get(id: Content["id"]): Promise<Content | null>;
  update(entry: Entry): Promise<Entry | null>;
}
