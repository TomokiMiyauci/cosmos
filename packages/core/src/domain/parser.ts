import type { Schema } from "./schema.ts";
import {
  BooleanNode,
  DatetimeNode,
  ListNode,
  MapNode,
  type Node,
  NumberNode,
  ReferenceNode,
  StringNode,
  UnionNode,
} from "./node.ts";
import { Result } from "@miyauci/util";

export function parse(
  content: Content,
  schema: Schema,
): Result<Node, ValidationError> {
  function internalParse(
    content: Content,
    schema: Schema,
    path: string[],
  ): Result<Node, ErrorDetail[]> {
    switch (schema.type) {
      case "string": {
        if (typeof content === "string") {
          return Result.ok(StringNode.of(content));
        }

        return Result.error(
          [{
            path,
            reason: {
              type: "invalid_type",
              expected: "string",
              actual: typeof content,
            },
          }],
        );
      }
      case "number": {
        if (typeof content === "number") {
          const [data, error] = NumberNode.of(content);

          if (error) {
            return Result.error([{
              path,
              reason: { type: "syntax_error" },
            }]);
          } else {
            return Result.ok(data);
          }
        }

        return Result.error(
          [{
            path,
            reason: {
              type: "invalid_type",
              expected: "number",
              actual: typeof content,
            },
          }],
        );
      }
      case "boolean": {
        if (typeof content === "boolean") {
          const node = BooleanNode.of(content);

          return Result.ok(node);
        }

        return Result.error(
          [{
            path,
            reason: {
              type: "invalid_type",
              expected: "boolean",
              actual: typeof content,
            },
          }],
        );
      }
      case "datetime": {
        if (typeof content === "string") {
          const num = Date.parse(content);
          const date = new Date(num);

          const [data, error] = DatetimeNode.of(date);

          if (error) {
            return Result.error([{
              path,
              reason: {
                type: "syntax_error",
              },
            }]);
          }

          return Result.ok(data);
        }

        return Result.error(
          [{
            path,
            reason: {
              type: "invalid_type",
              expected: "string",
              actual: typeof content,
            },
          }],
        );
      }
      case "map": {
        if (isPojo(content)) {
          const fields: Record<string, Node> = {};
          const errors: ErrorDetail[] = [];

          for (const [key, def] of Object.entries(schema.props)) {
            const currentPath = path.concat(key);
            const childContent = content[key];

            if (childContent === undefined) {
              if (def.required) {
                errors.push({
                  path: currentPath,
                  reason: { type: "missing_field" },
                });
              }
              continue;
            }

            const [childNode, childErrors] = internalParse(
              childContent,
              def.schema,
              currentPath,
            );

            if (childErrors) {
              errors.push(...childErrors);
            } else if (childNode) {
              fields[key] = childNode;
            }
          }

          if (errors.length > 0) {
            return Result.error(errors);
          }

          return Result.ok(new MapNode(fields));
        }

        return Result.error(
          [{
            path,
            reason: {
              type: "invalid_type",
              expected: "object",
              actual: typeof content,
            },
          }],
        );
      }
      case "list": {
        if (Array.isArray(content)) {
          const items: Node[] = [];
          const errors: ErrorDetail[] = [];

          content.forEach((childContent, i) => {
            const currentPath = path.concat(i.toString());

            const [childNode, childErrors] = internalParse(
              childContent,
              schema.item,
              currentPath,
            );

            if (childErrors) {
              errors.push(...childErrors);
            } else if (childNode) {
              items.push(childNode);
            }
          });

          if (errors.length > 0) {
            return Result.error(errors);
          }

          return Result.ok(new ListNode(items));
        }

        return Result.error(
          [{
            path,
            reason: {
              type: "invalid_type",
              expected: "object",
              actual: typeof content,
            },
          }],
        );
      }
      case "union": {
        if (!Array.isArray(content) || content.length !== 2) {
          return Result.error([{
            path,
            reason: {
              type: "invalid_type",
              expected: "object",
              actual: typeof content,
            },
          }]);
        }

        const [key, contentValue] = content;

        const withKey = path.concat("0");

        if (typeof key !== "string") {
          return Result.error([{
            path: withKey,
            reason: {
              type: "invalid_type",
              expected: "string",
              actual: typeof content,
            },
          }]);
        }

        const childSchema = schema.variants[key];

        if (!childSchema) {
          return Result.error([{
            path: withKey,
            reason: { type: "syntax_error" },
          }]);
        }

        const [childNode, childErrors] = internalParse(
          contentValue,
          childSchema,
          path.concat("1"),
        );

        if (childErrors) {
          return Result.error(childErrors);
        }

        return Result.ok(new UnionNode(key, childNode));
      }
      case "reference": {
        if (typeof content === "string") {
          const [data, error] = ReferenceNode.of(content);

          if (error) {
            return Result.error([
              { path, reason: { type: "syntax_error" } satisfies ErrorReason },
            ]);
          }

          return Result.ok(data);
        }

        return Result.error(
          [{
            path,
            reason: {
              type: "invalid_type",
              expected: "string",
              actual: typeof content,
            },
          }],
        );
      }
    }
  }

  const [data, errors] = internalParse(content, schema, []);

  if (errors) {
    return Result.error(new ValidationError(errors));
  }

  return Result.ok(data);
}

export type Content =
  | string
  | number
  | boolean
  | {
    [k: string]: Content;
  }
  | Content[]
  | [key: string, value: Content];

type DataType =
  | "string"
  | "number"
  | "bigint"
  | "boolean"
  | "symbol"
  | "undefined"
  | "object"
  | "function";

export type ErrorReason =
  | { type: "invalid_type"; expected: DataType; actual: DataType }
  | { type: "syntax_error" }
  | { type: "missing_field" };

export interface ErrorDetail {
  path: string[];
  reason: ErrorReason;
}

export class ValidationError extends Error {
  readonly details: ErrorDetail[];

  constructor(details: ErrorDetail[]) {
    super(`Validation failed with ${details.length} errors.`);
    this.details = details;
  }
}

type Pojo = Record<PropertyKey, unknown>;

function isPojo(value: unknown): value is Pojo {
  return typeof value === "object" && !!value &&
    Reflect.getPrototypeOf(value) === Object.prototype;
}
