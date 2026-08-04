import { mapValues } from "@std/collections/map-values";
import type { FieldDefinition, Store, StoreElement } from "../fields/type.ts";
import type { Field, NodeWithId } from "../type.ts";

export function node2Store(node: NodeWithId): Store {
  switch (node.type) {
    case "number":
    case "string": {
      return {
        [node.id]: toStoreElement(node),
      };
    }
    case "map": {
      const store = Object.values(node.value).map(node2Store).reduce(
        (acc, cur) => {
          return {
            ...acc,
            ...cur,
          };
        },
        {},
      );

      return {
        [node.id]: toStoreElement(node),
        ...store,
      };
    }
    case "list": {
      const store = node.value.map(node2Store).reduce(
        (acc, cur) => {
          return {
            ...acc,
            ...cur,
          };
        },
        {},
      );

      return {
        [node.id]: toStoreElement(node),
        ...store,
      };
    }
    case "boolean": {
      return { [node.id]: toStoreElement(node) };
    }
    case "datetime": {
      return {
        [node.id]: toStoreElement(node),
      };
    }

    case "reference":
    case "union":
    case "asset": {
      return {
        [node.id]: toStoreElement(node),
      };
    }
  }
}

function toStoreElement(node: NodeWithId): StoreElement {
  switch (node.type) {
    case "string": {
      return { type: "string", value: node.value };
    }
    case "number": {
      return {
        type: "number",
        value: node.value,
      };
    }
    case "map": {
      const value = mapValues(node.value, (node) => node.id);

      return {
        type: "link",
        value,
      };
    }
    case "list": {
      const value = node.value.map((node) => node.id);

      return {
        type: "list",
        value,
      };
    }
    case "boolean": {
      return {
        type: "boolean",
        value: node.value,
      };
    }
    case "datetime": {
      return {
        type: "datetime",
        value: node.value,
      };
    }
    case "union": {
      return {
        type: "union",
        key: node.key,
        value: node.value.id,
      };
    }
    case "reference": {
      return {
        type: "reference",
        value: node.value,
      };
    }
    case "asset": {
      return {
        type: "string",
        value: "unklwon",
      };
    }
  }
}

export function toFieldDefinition(field: Field): FieldDefinition {
  switch (field.type) {
    case "string": {
      return {
        type: "string",
        title: field.title,
      };
    }
    case "number": {
      return {
        type: "number",
        title: field.title,
      };
    }
    case "map": {
      const properties = mapValues(field.fields, toFieldDefinition);

      return {
        type: "map",
        properties,
      };
    }
    case "list": {
      return {
        type: "list",
        item: toFieldDefinition(field.field),
      };
    }
    case "boolean": {
      return {
        type: "boolean",
        title: field.title,
      };
    }
    case "datetime": {
      return {
        type: "datetime",
        title: field.title,
      };
    }
    case "union": {
      const variants = mapValues(field.variants, toFieldDefinition);

      return {
        type: "union",
        variants,
      };
    }
    case "reference": {
      const options = field.candidates.map((summary) => {
        return {
          id: summary.id,
          name: summary.name,
        };
      });
      return {
        type: "reference",
        options,
      };
    }
    case "asset": {
      return {
        type: "string",
        title: field.title,
      };
    }
  }
}

export function toNode(store: Store, id: string): NodeWithId | null {
  const element = store[id];

  if (!element) {
    return null;
  }

  switch (element.type) {
    case "string": {
      return { type: "string", value: element.value, id };
    }

    case "number": {
      return { type: "number", value: element.value, id };
    }

    case "boolean": {
      return { type: "boolean", value: element.value, id };
    }

    case "datetime": {
      return { type: "datetime", value: element.value, id };
    }

    case "link": {
      const finalMapValue: Record<string, NodeWithId> = {};
      let hasAnyValue = false;

      for (const [prop, childId] of Object.entries(element.value)) {
        const childNode = toNode(store, childId);

        if (childNode) {
          finalMapValue[prop] = childNode;
          hasAnyValue = true;
        }
      }

      if (!hasAnyValue) {
        return null;
      }

      return {
        type: "map",
        value: finalMapValue,
        id,
      };
    }

    case "list": {
      const finalListValue: NodeWithId[] = element.value
        .map((childId) => toNode(store, childId))
        .filter((childNode): childNode is NodeWithId => childNode !== null);

      if (finalListValue.length === 0) {
        return null;
      }

      return {
        type: "list",
        value: finalListValue,
        id,
      };
    }

    case "union": {
      const childNode = toNode(store, element.value);

      if (!childNode) return null;

      return {
        type: "union",
        key: element.key,
        value: childNode,
        id,
      };
    }
    case "reference": {
      return {
        type: "reference",
        value: element.value,
        id,
      };
    }
  }
}
