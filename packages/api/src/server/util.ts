import { mapValues } from "@std/collections/map-values";
import type { Contents, Entry } from "../generated/types.gen.ts";
import type { EntryDto, NodeJson } from "./application/dto.ts";

export function toEntry(dto: EntryDto): Entry {
  const contents = toContents(dto.node);

  return {
    id: dto.id,
    name: dto.name,
    model: dto.model,
    contents,
  };
}

function toContents(node: NodeJson): Contents {
  switch (node.type) {
    case "string":
    case "number":
    case "boolean":
    case "datetime": {
      return node.value;
    }
    case "map": {
      return mapValues(node.value, toContents);
    }
    case "list": {
      return node.value.map(toContents);
    }
    case "union": {
      return [node.key, toContents(node.value)];
    }
    case "reference":
    case "asset": {
      throw new Error();
    }
  }
}
