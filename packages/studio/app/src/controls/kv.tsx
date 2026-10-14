import type { JSX } from "react";
import type { ControlProps } from "@cosmos/schema-field";

export default function MapControl(props: ControlProps): JSX.Element {
  const { definition, render } = props;

  if (definition.type !== "map") throw new Error();

  return (
    <>
      {Object.entries(definition.properties).map(([prop, childDefinition]) => {
        return (
          <div key={prop}>
            {render(childDefinition, prop)}
          </div>
        );
      })}
    </>
  );
}
