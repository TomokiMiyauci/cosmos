import type { Node } from "@cosmos/core";

export interface Client {
  content: CongtentClient;
}

export interface CongtentClient {
  get(id: Content["id"]): Promise<Content>;
  update(content: Content): Promise<boolean>;
}

export interface Content {
  id: string;
  node: Node;
}
