import { os } from "../contract.ts";
import { onError, ORPCError, ValidationError } from "@orpc/server";
import z from "zod";
import location from "../middleware/location.ts";
import type {
  Entry,
  EntryInput,
  UpdateEntryInput,
} from "../../../generated/types.gen.ts";

export const postEntry = os.use(
  onError((error) => {
    if (
      error instanceof ORPCError &&
      error.code === "BAD_REQUEST" &&
      error.cause instanceof ValidationError
    ) {
      const zodError = new z.ZodError(error.cause.issues as z.core.$ZodIssue[]);

      if (zodError.issues.some((issue) => issue.code === "invalid_type")) {
        throw new ORPCError("BAD_REQUEST", {
          data: {},
        });
      }

      throw new ORPCError("UNPROCESSABLE_CONTENT", {
        data: {
          status: 422,
          detail: "",
          instance: "/",
          type: "about:blank",
          title: "Validation Failure",
          errors: [],
        },
      });
    }
  }),
).postEntry.handler(async (options) => {
  const { context, input, errors } = options;
  const { body } = input;
  const { model, contents: raw } = body as EntryInput;
  const contents = raw;

  const [id, error] = await context.usecases.entry.create.execute({
    model,
    contents,
  });

  if (error) {
    switch (error.type) {
      case "MODEL_NOT_FOUND":
      case "SCHEMA_NOT_FOUND": {
        throw errors.CONFLICT({
          data: {
            status: 409,
            detail: "Model not found",
            instance: "/",
            type: "about:blank",
            title: "Model not found",
          },
        });
      }

      case "INVALID_NAME":
      case "INVALID_MODEL": {
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            status: 500,
            detail: "",
            instance: "/",
            type: "about:blank",
            title: "",
          },
        });
      }
      case "INVALID_CONTENT": {
        throw errors.UNPROCESSABLE_CONTENT({
          data: {
            status: 422,
            detail: "",
            instance: "/",
            type: "about:blank",
            title: "Validation failure",
            errors: [],
          },
        });
      }
    }
  }

  return { id };
}).use(location);

export const deleteEntry = os.deleteEntry.handler(async (options) => {
  const { context, input } = options;
  const { params } = input;
  const { id } = params;

  const [_, error] = await context.usecases.entry.delete.execute(id);

  if (error) {
    throw new Error();
    // return { status: 400, body: null };
  }
});

export const getEntry = os.getEntry.handler(async (options): Promise<Entry> => {
  const { input, context } = options;
  const { params } = input;
  const { id } = params;

  const maybeDto = await context.queries.entry.findById(id);

  if (!maybeDto) {
    throw new Error();
  }

  const entry = toEntry(maybeDto);

  return entry;
});

export const putEntry = os.putEntry.handler(async (options) => {
  const { input, context } = options;
  const { params, body } = input;
  const { contents } = body as UpdateEntryInput;
  const { id } = params;

  const [dto] = await context.usecases.entry.update.execute({ id, contents });

  if (!dto) {
    throw new Error();
  }
});

export const getSummaries = os.getSummaries.handler(async (options) => {
  const { input, context } = options;

  const model = input?.query?.model;
  const dto = await context.queries.findSummaries({ model });

  return dto;
});
