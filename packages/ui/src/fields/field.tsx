"use client";

import type { JSX } from "react";
// import DatetimeField from "./datetime.tsx";
// import StringField from "./string.tsx";
// import NumberField from "./number.tsx";
// import BooleanField from "./boolean.tsx";
// import ListField from "./list.tsx";
// import AssetField from "./asset.tsx";
// import ReferenceField from "./reference.tsx";
// import UnionField from "./union.tsx";
// import MapField from "./map.tsx";
// import MarkdownField from "./markdown.tsx";
// import type { Node } from "@cosmos/core";
import type { Field } from "../type.ts";
import type { FieldDefinition, Store } from "./type.ts";

export default function Field(
  props: {
    store: Store;
    changeStore: (fn: (store: Store) => Store) => void;
    id: string;
    definition: FieldDefinition;
  },
): JSX.Element {
  const { store, changeStore, definition } = props;
  const id = props.id;
  const maybeNode = store[id];
  switch (definition.type) {
    case "string": {
      return (
        <input
          type="text"
          placeholder={definition.placeholder}
          value={maybeNode?.type === "string" ? maybeNode.value : ""}
          onChange={(ev) => {
            const value = ev.target.value;
            changeStore((prev) => ({
              ...prev,
              [id]: value ? { type: "string", value } : null,
            }));
          }}
        />
      );
    }
    case "number": {
      const currentValue = maybeNode?.type === "number" ? maybeNode.value : "";
      return (
        <input
          type="number"
          placeholder={definition.placeholder}
          value={currentValue}
          onChange={(ev) => {
            const rawValue = ev.target.value;
            changeStore((prev) => ({
              ...prev,
              [id]: rawValue !== ""
                ? { type: "number", value: Number(rawValue) }
                : null,
            }));
          }}
        />
      );
    }
    case "map": {
      const currentLink = maybeNode?.type === "link" ? maybeNode.value : {};
      return (
        <fieldset
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            margin: "10px 0",
          }}
        >
          <legend>Map Field</legend>
          {Object.entries(definition.properties).map(([key, propDef]) => {
            const childId = currentLink[key] ?? `${id}-${key}`;
            return (
              <div key={key} style={{ marginBottom: "10px" }}>
                <label style={{ marginRight: "8px", fontWeight: "bold" }}>
                  {key}:
                </label>
                <Field
                  store={store}
                  definition={propDef}
                  id={childId}
                  changeStore={(childFn) => {
                    changeStore((prev) => {
                      const updatedStore = childFn(prev);
                      const nextNodes = { ...updatedStore };
                      const myNode = nextNodes[id];
                      const baseLinkMap = myNode?.type === "link"
                        ? { ...myNode.value }
                        : {};
                      baseLinkMap[key] = childId;
                      nextNodes[id] = { type: "link", value: baseLinkMap };
                      return nextNodes;
                    });
                  }}
                />
              </div>
            );
          })}
        </fieldset>
      );
    }
    case "list": {
      const currentList = maybeNode?.type === "list" ? maybeNode.value : [];
      return (
        <fieldset
          style={{
            border: "1px solid #007acc",
            padding: "15px",
            margin: "10px 0",
          }}
        >
          <legend>List Field</legend>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {currentList.map((childId, index) => {
              return (
                <div
                  key={childId}
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span style={{ color: "#666" }}>[{index}]</span>{" "}
                  <div style={{ flex: 1 }}>
                    <Field
                      store={store}
                      definition={definition.item}
                      id={childId}
                      changeStore={(childFn) => {
                        changeStore((prev) => {
                          const updatedStore = childFn(prev);
                          return updatedStore;
                        });
                      }}
                    />
                  </div>{" "}
                  <button
                    type="button"
                    style={{ color: "red" }}
                    onClick={() => {
                      changeStore((prev) => {
                        const nextList = currentList.filter((tid) =>
                          tid !== childId
                        );
                        const nextValues = { ...prev };
                        delete nextValues[childId];
                        nextValues[id] = { type: "list", value: nextList };
                        return nextValues;
                      });
                    }}
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            style={{ marginTop: "10px", padding: "5px 10px" }}
            onClick={() => {
              changeStore((prev) => {
                const newChildId = crypto.randomUUID();
                const nextList = currentList.concat(newChildId);
                const nextValues = { ...prev };
                nextValues[newChildId] = null;
                nextValues[id] = { type: "list", value: nextList };
                return nextValues;
              });
            }}
          >
            + Add Item
          </button>
        </fieldset>
      );
    }
  }
}

// function Mismatch(
//   props: { onChange: (node: Node | null) => void },
// ): JSX.Element {
//   const { onChange } = props;

//   return (
//     <div>
//       This field is mismatch

//       <button
//         onClick={() => {
//           onChange(null);
//         }}
//         type="button"
//       >
//         Clear
//       </button>
//     </div>
//   );
// }
