"use client";

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
import type { Field } from "../type.ts";
import type { FieldProps } from "./type.ts";

export default function Field(props: FieldProps): JSX.Element {
  const { onChange, field, node } = props;

  switch (field.type) {
    case "string": {
      if (node && node.type !== "string") {
        return <Mismatch onChange={onChange} />;
      }

      return <StringField node={node} field={field} onChange={onChange} />;
    }
    case "map": {
      if (node && node.type !== "map") {
        return <Mismatch onChange={onChange} />;
      }

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
      if (node && node.type !== "markdown") {
        return <Mismatch onChange={onChange} />;
      }

      return <MarkdownField field={field} node={node} onChange={onChange} />;
    case "datetime": {
      if (node && node.type !== "datetime") {
        return <Mismatch onChange={onChange} />;
      }

      return <DatetimeField node={node} field={field} onChange={onChange} />;
    }
    case "number": {
      if (node && node.type !== "number") {
        return <Mismatch onChange={onChange} />;
      }

      return <NumberField node={node} field={field} onChange={onChange} />;
    }
    case "boolean": {
      if (node && node.type !== "boolean") {
        return <Mismatch onChange={onChange} />;
      }

      return <BooleanField node={node} field={field} onChange={onChange} />;
    }
    case "reference": {
      if (node && node.type !== "reference") {
        return <Mismatch onChange={onChange} />;
      }

      return <ReferenceField node={node} field={field} onChange={onChange} />;
    }
    case "list": {
      if (node && node.type !== "list") {
        return <Mismatch onChange={onChange} />;
      }

      return (
        <ListField
          field={field}
          node={node}
          render={Field}
          onChange={onChange}
        />
      );
    }
    case "asset": {
      return <AssetField field={field} onChange={onChange} />;
    }
    case "union": {
      if (node && node.type !== "union") {
        return <Mismatch onChange={onChange} />;
      }

      return (
        <UnionField
          field={field}
          node={node}
          render={Field}
          onChange={onChange}
        />
      );
    }
  }
}

function Mismatch(
  props: { onChange: (node: Node | null) => void },
): JSX.Element {
  const { onChange } = props;

  return (
    <div>
      This field is mismatch

      <button
        onClick={() => {
          onChange(null);
        }}
        type="button"
      >
        Clear
      </button>
    </div>
  );
}
