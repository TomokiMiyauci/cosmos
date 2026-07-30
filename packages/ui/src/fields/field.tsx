"use client";

import type { JSX } from "react";
import DatetimeField from "./datetime.tsx";
import StringField from "./string.tsx";
import NumberField from "./number.tsx";
import BooleanField from "./boolean.tsx";
import ListField from "./list.tsx";
// import AssetField from "./asset.tsx";
// import ReferenceField from "./reference.tsx";
// import UnionField from "./union.tsx";
import MapField from "./map.tsx";
// import MarkdownField from "./markdown.tsx";
// import type { Node } from "@cosmos/core";
import type { FieldDefinition, Store } from "./type.ts";

export interface FieldProps {
  store: Store;
  changeStore: (fn: (store: Store) => Store) => void;
  id: string;
  definition: FieldDefinition;
}

export default function Field(
  props: FieldProps,
): JSX.Element {
  const { store, changeStore, definition } = props;
  const id = props.id;

  switch (definition.type) {
    case "string": {
      return (
        <StringField
          store={store}
          onChange={changeStore}
          field={definition}
          id={id}
        />
      );
    }
    case "number": {
      return (
        <NumberField
          store={store}
          onChange={changeStore}
          field={definition}
          id={id}
        />
      );
    }
    case "boolean": {
      return (
        <BooleanField
          store={store}
          onChange={changeStore}
          field={definition}
          id={id}
        />
      );
    }
    case "datetime": {
      return (
        <DatetimeField
          store={store}
          onChange={changeStore}
          field={definition}
          id={id}
        />
      );
    }
    case "map": {
      return (
        <MapField
          store={store}
          onChange={changeStore}
          field={definition}
          id={id}
        />
      );
    }
    case "list": {
      return (
        <ListField
          store={store}
          onChange={changeStore}
          field={definition}
          id={id}
        />
      );
    }
  }
}

// function Mismatch(
//   props: { onChange: (node: Node | null) => void },
// ): JSX.Element {
//   const { onChange } = props;

//   return (
//     <div>
//       This field is mismatch

//       <button
//         onClick={() => {
//           onChange(null);
//         }}
//         type="button"
//       >
//         Clear
//       </button>
//     </div>
//   );
// }
