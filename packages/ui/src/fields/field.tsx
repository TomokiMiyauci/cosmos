import type { JSX } from "react";
import DatetimeField from "./datetime.tsx";
import StringField from "./string.tsx";
import NumberField from "./number.tsx";
import BooleanField from "./boolean.tsx";
import ListField from "./list.tsx";
import AssetField from "./asset.tsx";
import ReferenceField from "./reference.tsx";
import UnionField from "./union.tsx";
import MapField from "./map.tsx";
import MarkdownField from "./markdown.tsx";
import type { Field, Node } from "@cosmos/core";

export default function Field(
  props: { node: Node | null; onChange: (node: Node) => void; field: Field },
): JSX.Element {
  const { onChange, field, node } = props;

  switch (field.type) {
    case "string": {
      return <StringField node={node} field={field} onChange={onChange} />;
    }
    case "map": {
      return (
        <MapField
          node={node}
          render={Field}
          onChange={onChange}
          field={field}
        />
      );
    }
    case "markdown":
      return <MarkdownField field={field} />;
    case "datetime": {
      return <DatetimeField field={field} onChange={onChange} />;
    }
    case "number": {
      return <NumberField field={field} onChange={onChange} />;
    }
    case "boolean": {
      return <BooleanField field={field} onChange={onChange} />;
    }
    case "reference": {
      return <ReferenceField field={field} />;
    }
    case "list": {
      return <ListField field={field} render={Field} onChange={onChange} />;
    }
    case "asset": {
      return <AssetField field={field} onChange={onChange} />;
    }
    case "union": {
      return <UnionField field={field} />;
    }
    case "instance": {
      return <></>;
    }
  }
}
