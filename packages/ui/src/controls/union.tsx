import type { JSX } from "react";
import type { ControlProps } from "@cosmos/schema-field";

export default function UnionControl(props: ControlProps): JSX.Element {
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
