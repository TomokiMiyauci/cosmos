import type { JSX } from "react";
import type { Node } from "@cosmos/core";
import FieldComponent from "./fields/field.tsx";
import type { FieldDefinition, Store } from "./fields/type.ts";
import type { OnChange } from "./fields/type.ts";

export interface FormProps {
  store: Store;
  update: (node: Node | null) => Promise<void>;
  field: FieldDefinition;
  onChange: OnChange;
  id: string;
}

export default function Form(props: FormProps): JSX.Element {
  const { store, update, field, onChange, id } = props;

  return (
    <form
      action={async () => {
        "use server";
        const node = toNode(store, id);
        await update(node);
      }}
    >
      <FieldComponent
        store={store}
        changeStore={onChange}
        definition={field}
        id={id}
      />

      <button type="submit">Save</button>

      {JSON.stringify(toNode(store, id))}
    </form>
  );
}

function toNode(store: Store, id: string): Node | null {
  const element = store[id];

  if (!element) {
    return null;
  }

  switch (element.type) {
    case "string": {
      return { type: "string", value: element.value };
    }

    case "number": {
      return { type: "number", value: element.value };
    }

    case "boolean": {
      return { type: "boolean", value: element.value };
    }

    case "datetime": {
      return { type: "datetime", value: element.value };
    }

    case "link": {
      const finalMapValue: Record<string, Node> = {};
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
      };
    }

    case "list": {
      const finalListValue: Node[] = element.value
        .map((childId) => toNode(store, childId))
        .filter((childNode): childNode is Node => childNode !== null);

      if (finalListValue.length === 0) {
        return null;
      }

      return {
        type: "list",
        value: finalListValue,
      };
    }

    case "union": {
      const childNode = toNode(store, element.value);

      if (!childNode) return null;

      return {
        type: "union",
        key: element.key,
        value: childNode,
      };
    }
    case "reference": {
      return {
        type: "reference",
        value: element.value,
      };
    }
  }
}
