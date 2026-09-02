import type { JSX } from "react";
import type { WidgetProps } from "@cosmos/schema-field";

export default function MapControl(props: WidgetProps): JSX.Element {
  const { definition, render } = props;

  if (definition.type !== "map") throw new Error();

  return (
    <div>
      {Object.entries(definition.properties).map(([prop, childDefinition]) => {
        return (
          <div key={prop}>
            <h2>{prop}</h2>

            {render(childDefinition, prop)}
          </div>
        );
      })}
    </div>
  );
}
