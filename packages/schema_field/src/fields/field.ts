import { createContext, use } from "react";

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

export const ValidityContext = createContext<Validity | null>(null);

export function useValidity(): Validity {
  const context = use(ValidityContext);

  if (!context) throw new Error("wrap by <ValidityContext>");

  return context;
}

export interface Validity {
  valid: boolean;
}
