import type { AssetField } from "@cosmos/core";
import type { JSX } from "react";

export interface AssetFieldProps {
  field: AssetField;
}

export default function AssetField(
  _: AssetFieldProps,
): JSX.Element {
  return <input />;
}
