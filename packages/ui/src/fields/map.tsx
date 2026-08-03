import type { JSX } from "react";
import type { ErrorMap, MapFieldDefinition, OnChange, Store } from "./type.ts";
import Field from "./field.tsx";

export interface MapFieldProps {
  // render: RenderField;
  onChange: OnChange;
  field: MapFieldDefinition;
  store: Store;
  id: string;
  errors: ErrorMap;
}

export default function MapField(props: MapFieldProps): JSX.Element {
  const { field, onChange, store, id, errors } = props;
  const maybeNode = store[id];
  const error = errors[id];
  const currentLink = maybeNode?.type === "link" ? maybeNode.value : {};

  return (
    <>
      <fieldset>
        <legend>Map Field</legend>

        {Object.entries(field.properties).map(([key, propDef]) => {
          const childId = currentLink[key] ?? `${id}-${key}`;
          return (
            <div key={key}>
              <Field
                store={store}
                definition={propDef}
                id={childId}
                changeStore={(childFn) => {
                  onChange((prev) => {
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
                errors={errors}
              />
            </div>
          );
        })}
      </fieldset>

      {error && <p>{error}</p>}
    </>
  );
}
