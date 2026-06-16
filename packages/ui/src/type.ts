import type { Node } from "@cosmos/core";

export interface Client {
  content: ContentClient;
  contents: ContentsClient;
}

export interface ContentClient {
  get(id: Content["id"]): Promise<Content | null>;
  update(content: Content): Promise<Content | null>;
}

export interface ContentsClient {
  get(): Promise<Content[]>;
}

export interface Content {
  id: string;
  node: Node;
}
