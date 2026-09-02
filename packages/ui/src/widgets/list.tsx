import type { JSX } from "react";
import type { WidgetProps } from "@cosmos/schema-field";

export default function ListControl(props: WidgetProps): JSX.Element {
  const { definition, render, api } = props;

  if (definition.type !== "sequence") throw new Error();

  const list = api.useList();

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          list.append();
        }}
      >
        Add
      </button>

      {[...list].map((id, index) => {
        return (
          <div key={id}>
            {render(definition.item, index.toString())}

            <button
              type="button"
              onClick={() => {
                list.remove(id);
              }}
            >
              Remove
            </button>
          </div>
        );
      })}
    </div>
  );
}
