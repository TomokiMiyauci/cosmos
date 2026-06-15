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
import type { Node } from "@cosmos/core";

export default function Field(
  props: { node: Node; onChange: (node: Node) => void },
): JSX.Element {
  const { node, onChange } = props;

  switch (node.type) {
    case "string": {
      return <StringField node={node} onChange={onChange} />;
    }
    case "map": {
      return (
        <MapField
          render={Field}
          node={node}
          onChange={onChange}
        />
      );
    }
    case "markdown":
      return <MarkdownField node={node} />;
    case "datetime": {
      return <DatetimeField node={node} onChange={onChange} />;
    }
    case "number": {
      return <NumberField node={node} onChange={onChange} />;
    }
    case "boolean": {
      return <BooleanField node={node} onChange={onChange} />;
    }
    case "reference": {
      return <ReferenceField node={node} />;
    }
    case "list": {
      return <ListField node={node} render={Field} onChange={onChange} />;
    }
    case "asset": {
      return <AssetField node={node} onChange={onChange} />;
    }
    case "union": {
      return <UnionField node={node} />;
    }
  }
}
