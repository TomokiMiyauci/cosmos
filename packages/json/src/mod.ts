import { parseToNode } from "@cosmos/parser";
import type { Resource } from "@cosmos/api";

export function assertContent(value: unknown): asserts value is Resource {
}

export function stringify(resource: Resource): string {
  return JSON.stringify(resource);
}

export function parse(value: string): Resource {
  const json = JSON.parse(value);
  assertContent(json);

  const node = parseToNode(json.node);

  return {
    id: json.id,
    node,
    model: json.model,
  };
}
