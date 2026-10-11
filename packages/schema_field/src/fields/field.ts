import { createContext, use } from "react";
import { useController } from "react-hook-form";
import type { List } from "../type.ts";
import { createUseList } from "./util.ts";

export interface Field {
  id: string;
  label: Field.Label;
  description: Field.Description;
  error: Field.Error;
}

// deno-lint-ignore no-namespace
export namespace Field {
  export interface Label {
    id: string;
  }
  export interface Description {
    id: string;
  }

  export interface Error {
    id: string;
  }
}

export const FieldContext = createContext<Field | null>(null);

export function useField(): Field {
  const context = use(FieldContext);

  if (!context) throw new Error("wrap by <FieldContext>");

  return context;
}

export const NameContext = createContext<string | null>(null);

export function useValidity(): Validity {
  const context = use(NameContext);

  if (!context) throw new Error("wrap by <NameContext>");

  const { fieldState } = useController({ name: context });

  return {
    valid: !fieldState.invalid,
    error: fieldState.error?.message ?? null,
  };
}

export interface Validity {
  valid: boolean;
  error: string | null;
}

export function useValue(): [
  value: string | null,
  setValue: (value: string | null) => void,
] {
  const name = use(NameContext);

  if (!name) throw new Error("wrap by <NameContext>");

  const { field } = useController<Record<string, string | undefined>>({ name });

  return [field.value ?? null, field.onChange];
}

export function useList(): List {
  const name = use(NameContext);

  if (!name) throw new Error("wrap by <NameContext>");

  const list = createUseList(name);

  return list();
}
