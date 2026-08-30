import type { JSX } from "react/jsx-runtime";
import type { Definition } from "../type.ts";

export interface FieldProps {
  name: string;
  definition: Definition;
  render(props: { name: string; definition: Definition }): JSX.Element;
}

export interface PrimitiveFieldValue {
  [k: string]: Primitive | undefined;
}

export type Primitive = string | number | boolean;
