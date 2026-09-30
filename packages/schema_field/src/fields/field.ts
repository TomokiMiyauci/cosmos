import { createContext, use } from "react";
import { useController } from "react-hook-form";

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

  return { valid: !fieldState.invalid };
}

export interface Validity {
  valid: boolean;
}
