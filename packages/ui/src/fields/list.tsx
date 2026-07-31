import type { JSX } from "react";
import type { ListFieldDefinition, OnChange, Store } from "./type.ts";
import Field from "./field.tsx";

export interface ListFieldProps {
  // render: RenderField;
  onChange: OnChange;
  field: ListFieldDefinition;
  store: Store;
  id: string;
}

export default function ListField(props: ListFieldProps): JSX.Element {
  const { onChange, field, store, id } = props;

  const maybeNode = store[id];
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
              <span style={{ color: "#666" }}>[{index}]</span>
              <div style={{ flex: 1 }}>
                <Field
                  store={store}
                  definition={field.item}
                  id={childId}
                  changeStore={(childFn) => {
                    onChange((prev) => {
                      const updatedStore = childFn(prev);
                      return updatedStore;
                    });
                  }}
                />
              </div>
              <button
                type="button"
                style={{ color: "red" }}
                onClick={() => {
                  onChange((prev) => {
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
          onChange((prev) => {
            const newChildId = crypto.randomUUID();
            const nextList = currentList.concat(newChildId);
            const nextValues = { ...prev };
            delete nextValues[newChildId];
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
