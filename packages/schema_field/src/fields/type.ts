import type { JSX, ReactNode } from "react";
import type { Definition } from "../type.ts";

export interface FieldProps {
  name: string;
  definition: Definition;
  render(props: { name: string; definition: Definition }): JSX.Element;
  layout(props: FieldLayoutProps): JSX.Element;
}

export interface PrimitiveFieldValue {
  [k: string]: Primitive | undefined;
}

export type Primitive = string | number | boolean;

export interface FieldLayoutProps {
  title: string;
  control: ReactNode;
  error: string | null;
}
