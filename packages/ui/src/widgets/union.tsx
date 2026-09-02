import type { JSX } from "react";
import type { WidgetProps } from "@cosmos/schema-field";

export default function UnionControl(props: WidgetProps): JSX.Element {
  const { definition, render } = props;

  if (definition.type !== "union") throw new Error();

  return (
    <div>
      <select>
        <option></option>
      </select>

      {definition.members.map((definition, index) => {
        return <div key={index}>{render(definition)}</div>;
      })}

      {/* {render(definition.item, index.toString())} */}
    </div>
  );
}
