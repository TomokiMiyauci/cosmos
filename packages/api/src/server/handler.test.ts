import { postEntry } from "./handler.ts";
import { call } from "@orpc/server";
import { expect } from "@std/expect";
import { EntryCreateUseCase } from "./application/usecases/entry/creation.ts";
import {
  type E,
  type EntryId,
  type EntryRepositry,
  M,
  type ModelId,
  type ModelRepositry,
} from "@cosmos/core";
import type { SchemaJson } from "../../../core/src/domain/model/schema.ts";

class RecordEntryRepositry implements EntryRepositry {
  #record: Record<string, E>;
  constructor(record?: Record<string, E>) {
    this.#record = record ?? {};
  }
  async delete(id: EntryId): Promise<void> {
  }

  findById(id: EntryId): Promise<E | null> {
    return Promise.resolve(null);
  }

  save(entry: E): Promise<void> {
    this.#record[entry.id.value] = entry;

    return Promise.resolve();
  }
}

class RecordModelRepositry implements ModelRepositry {
  constructor(private record: Record<string, SchemaJson>) {}

  findById(id: ModelId): Promise<M | null> {
    const value = this.record[id.value];

    if (!value) return Promise.resolve(null);

    return Promise.resolve(M.of(id, value));
  }
}

Deno.test("postEntry", async (t) => {
  await t.step("should throw error if model is invalid", async () => {
    const body = { contents: {}, model: "", name: "" };

    await expect(call(postEntry, { body }, {
      context: {
        usecase: new EntryCreateUseCase(
          new RecordEntryRepositry(),
          new RecordModelRepositry({}),
        ),
      },
    })).rejects.toThrow("Unprocessable Content");
  });

  await t.step("should throw error if name is invalid", async () => {
    const body = { contents: {}, model: "post", name: "" };

    await expect(call(postEntry, { body }, {
      context: {
        usecase: new EntryCreateUseCase(
          new RecordEntryRepositry(),
          new RecordModelRepositry({}),
        ),
      },
    })).rejects.toThrow("Unprocessable Content");
  });

  await t.step("should throw error if model is not found", async () => {
    const body = { contents: {}, model: "post", name: "test" };

    await expect(call(postEntry, { body }, {
      context: {
        usecase: new EntryCreateUseCase(
          new RecordEntryRepositry(),
          new RecordModelRepositry({}),
        ),
      },
    })).rejects.toThrow("Conflict");
  });

  await t.step("should throw error if the contents is invalid", async () => {
    const body = { contents: {}, model: "post", name: "test" };

    await expect(call(postEntry, { body }, {
      context: {
        usecase: new EntryCreateUseCase(
          new RecordEntryRepositry(),
          new RecordModelRepositry({ post: { type: "string" } }),
        ),
      },
    })).rejects.toThrow("Unprocessable Content");
  });

  await t.step("should return id", async () => {
    const body = { contents: "test", model: "post", name: "test" };

    await expect(call(postEntry, { body }, {
      context: {
        usecase: new EntryCreateUseCase(
          new RecordEntryRepositry(),
          new RecordModelRepositry({ post: { type: "string" } }),
        ),
      },
    })).resolves.toEqual({ id: expect.any(String) });
  });
});
