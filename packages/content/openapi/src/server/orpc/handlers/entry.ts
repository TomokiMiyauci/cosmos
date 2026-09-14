import { os } from "../contract.ts";
// import { onError, ORPCError, ValidationError } from "@orpc/server";
// import z from "zod";
import location from "../middleware/location.ts";
import type {
  Contents,
  EntryInput,
  EntryResponse,
  EntrySummaryResponse,
  ValidationError as EntryValicationError,
} from "../../../generated/types.gen.ts";
import type { EntryView } from "../../application/query.ts";
import type { ContentViolation, Violation } from "@cosmos/content";
import { Result } from "@miyauci/util";
import {
  Identifier,
  type MapValue,
  NumberValue,
  type SchemaValue,
  type SequenseValue,
} from "@cosmos/schema";
import { isIdentifier, isNumberValue } from "@cosmos/validator";
import { mapValues } from "@std/collections/map-values";

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

  const [node, contentError] = node2SchemaValue(contents);

  if (contentError) {
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

  const [id, error] = await context.usecases.entry.register.execute({
    model,
    contents: node,
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
    contents: schemaValue2Node(view.content),
  };
}

export const putEntry = os.putEntry.handler(async (options) => {
  const { input, context, errors } = options;
  const { params, body } = input;
  const { contents, model } = body as EntryInput;
  const { id } = params;
  const [node, contentError] = node2SchemaValue(contents);

  if (contentError) {
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

  const [_, error] = await context.usecases.entry.register.execute({
    id,
    contents: node,
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

function node2SchemaValue(node: Contents): Result<SchemaValue, Error> {
  switch (node.type) {
    case "string": {
      return Result.ok(node.value);
    }
    case "number": {
      return NumberValue.of(node.value);
    }
    case "boolean": {
      return Result.ok(node.value);
    }
    case "id": {
      return Identifier.of(node.value);
    }
    case "map": {
      const map: MapValue<SchemaValue> = {};

      for (const [key, value] of Object.entries(node.value)) {
        const [child, error] = node2SchemaValue(value);

        if (error) return Result.error(error);

        map[key] = child;
      }

      return Result.ok(map);
    }
    case "sequense": {
      const set: SequenseValue<SchemaValue> = [];
      for (const value of node.value) {
        const [child, error] = node2SchemaValue(value);

        if (error) return Result.error(error);

        set.push(child);
      }

      return Result.ok(set);
    }
  }
}

function schemaValue2Node(value: SchemaValue): Contents {
  if (typeof value === "string") {
    return { type: "string", value };
  }

  if (isNumberValue(value)) {
    return { type: "number", value: value.value };
  }

  if (typeof value === "boolean") {
    return { type: "boolean", value };
  }

  if (isIdentifier(value)) {
    return { type: "id", value: value.value };
  }

  if (Array.isArray(value)) {
    return { type: "sequense", value: value.map(schemaValue2Node) };
  }

  return {
    type: "map",
    value: mapValues(value, schemaValue2Node),
  };
}
