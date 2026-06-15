"use client";

import type { AssetNode, Node } from "@cosmos/core";
import type { JSX } from "react";

export interface AssetFieldProps {
  node: AssetNode;
  onChange: (node: Node) => void;
}

export default function AssetField(
  props: AssetFieldProps,
): JSX.Element {
  return <input type="file" />;
}
