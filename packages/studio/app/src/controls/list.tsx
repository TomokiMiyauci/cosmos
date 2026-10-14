import type { JSX } from "react";
import { type ControlProps, useList } from "@cosmos/schema-field";

export default function ListControl(props: ControlProps): JSX.Element {
  const { definition, render } = props;

  if (definition.type !== "sequence") throw new Error();

  const list = useList();

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
