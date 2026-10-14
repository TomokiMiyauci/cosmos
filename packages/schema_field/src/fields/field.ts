import { createContext, use } from "react";
import { useController, useFieldArray } from "react-hook-form";

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

  return list;
}

export interface List {
  [Symbol.iterator](): IterableIterator<Id>;
  append(): void;
  remove(id: Id): void;
}

type Id = string;

export function createUseList(name: string): List {
  const { fields, append, remove } = useFieldArray({ name });

  class ListImpl implements List {
    *[Symbol.iterator](): IterableIterator<string> {
      yield* fields.map((value) => value.id);
    }

    append(): void {
      append(null);
    }

    remove(id: string): void {
      const index = fields.findIndex((value) => value.id === id);

      if (0 <= index) {
        remove(index);
      }
    }
  }

  return new ListImpl();
}
