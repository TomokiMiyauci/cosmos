import type { List } from "../type.ts";
import { useFieldArray } from "react-hook-form";

export function createUseList(name: string): () => List {
  return () => {
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
  };
}
