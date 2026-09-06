import type { JSX, ReactNode } from "react";
import type { Definition } from "../type.ts";

export interface FieldProps<T extends Definition = Definition> {
  name: string;
  definition: T;
  render(
    props: { name: string; definition: Definition; required?: boolean },
  ): JSX.Element;
  layout(props: FieldLayoutProps): JSX.Element;
  required?: boolean;
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
