"use client";

import type { AssetField, Node } from "@cosmos/core";
import type { JSX } from "react";

export interface AssetFieldProps {
  field: AssetField;
  onChange: (node: Node) => void;
}

export default function AssetField(
  props: AssetFieldProps,
): JSX.Element {
  return <input type="file" />;
}
