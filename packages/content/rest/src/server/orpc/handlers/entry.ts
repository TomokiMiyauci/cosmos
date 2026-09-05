import { os } from "../contract.ts";
// import { onError, ORPCError, ValidationError } from "@orpc/server";
// import z from "zod";
import location from "../middleware/location.ts";
import type {
  EntryInput,
  EntryResponse,
  EntrySummaryResponse,
  ValidationError as EntryValicationError,
} from "../../../generated/types.gen.ts";
import type { EntryView } from "../../application/query.ts";
import type { ContentViolation, Violation } from "@cosmos/content";

// const e = onError((error) => {
//   if (
//     error instanceof ORPCError &&
//     error.code === "BAD_REQUEST" &&
//     error.cause instanceof ValidationError
//   ) {
//     const zodError = new z.ZodError(error.cause.issues as z.core.$ZodIssue[]);

//     if (zodError.issues.some((issue) => issue.code === "invalid_type")) {
//       throw new ORPCError("BAD_REQUEST", {
//         data: {},
//       });
//     }

//     throw new ORPCError("UNPROCESSABLE_CONTENT", {
//       data: {
//         status: 422,
//         detail: "",
//         instance: "/",
//         type: "about:blank",
//         title: "Validation Failure",
//         errors: [],
//       },
//     });
//   }
// });

export const postEntry = os.postEntry.handler(async (options) => {
  const { context, input, errors } = options;
  const { body } = input;
  const { model, contents } = body as EntryInput;

  const [id, error] = await context.usecases.entry.register.execute({
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

      case "INVALID_MODEL":
      case "INVALID_ID": {
        throw errors.BAD_REQUEST({
          data: {
            status: 400,
            detail: "",
            instance: "/",
            type: "about:blank",
            title: "",
          },
        });
      }
      case "INVALID_CONTENT": {
        const e = error.violations.map(violation2ValidationError);

        throw errors.UNPROCESSABLE_CONTENT({
          data: {
            status: 422,
            detail: "",
            instance: "/",
            type: "about:blank",
            title: "Validation failure",
            errors: e,
          },
        });
      }
    }
  }

  return { id };
}).use(location);

function violation2ValidationError(
  violation: Violation,
): EntryValicationError {
  const rootPath: (string | number)[] = ["", "contents"];

  const pointer = rootPath.concat(violation.path).join("/");

  return { pointer, ...getErrorMessage(violation.kind) };
}

function getErrorMessage(kind: ContentViolation): {
  code: ErrorCode;
  detail: string;
} {
  switch (kind) {
    case "INVALID_TYPE": {
      return { code: ErrorCode.InvalidType, detail: "Invalid type" };
    }
    case "REQUIRED": {
      return { code: ErrorCode.Required, detail: "Required" };
    }
    case "REFERENCE_NOT_FOUND": {
      return {
        code: ErrorCode.ReferenceNotFound,
        detail: "Referene not found",
      };
    }
    case "INVALID_VALUE": {
      return {
        code: ErrorCode.InvalidValue,
        detail: "Invalid value",
      };
    }
  }
}

enum ErrorCode {
  InvalidType = "1",
  Required = "2",
  ReferenceNotFound = "3",
  InvalidValue = "4",
}

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

export const getEntry = os.getEntry.handler(
  async (options): Promise<EntryResponse> => {
    const { input, context, errors } = options;
    const { params } = input;
    const { id } = params;

    const entry = await context.queries.entry.findById(id);

    if (!entry) {
      throw errors.NOT_FOUND({
        data: {
          status: 404,
          detail: "",
          instance: "/",
          type: "about:blank",
          title: "Not Found",
        },
      });
    }

    return toEntryResponse(entry);
  },
);

function toEntryResponse(view: EntryView): EntryResponse {
  return {
    id: view.id,
    model: {
      id: view.modelId,
    },
    contents: view.content,
  };
}

export const putEntry = os.putEntry.handler(async (options) => {
  const { input, context, errors } = options;
  const { params, body } = input;
  const { contents, model } = body as EntryInput;
  const { id } = params;

  const [_, error] = await context.usecases.entry.register.execute({
    id,
    contents,
    model,
  });

  if (error) {
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

        case "INVALID_MODEL":
        case "INVALID_ID": {
          throw errors.BAD_REQUEST({
            data: {
              status: 400,
              detail: "",
              instance: "/",
              type: "about:blank",
              title: "",
            },
          });
        }
        case "INVALID_CONTENT": {
          const e = error.violations.map(violation2ValidationError);

          throw errors.UNPROCESSABLE_CONTENT({
            data: {
              status: 422,
              detail: "",
              instance: "/",
              type: "about:blank",
              title: "Validation failure",
              errors: e,
            },
          });
        }
      }
    }
  }
});

export const getSummaries = os.getSummaries.handler(async (options) => {
  const { input, context } = options;

  const model = input?.query?.model;
  const dto = await context.queries.entry.findAll({ model });

  return dto.map(toSummaryResponse);
});

function toSummaryResponse(view: EntryView): EntrySummaryResponse {
  return {
    id: view.id,
    model: { id: view.modelId },
  };
}
