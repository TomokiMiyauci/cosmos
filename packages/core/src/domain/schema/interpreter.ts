import type { Schema } from "./entity.ts";
import {
  BooleanNode,
  EntryId,
  ListNode,
  MapNode,
  type Node,
  NumberNode,
  ReferenceNode,
  StringNode,
  TemporalNode,
  UnionNode,
} from "@cosmos/core/entry";
import { Result } from "@miyauci/util";

export class SchemaInterpreter {
  interpret(
    content: unknown,
    schema: Schema,
  ): Result<Node, ValidationError> {
    const [data, error] = this.#parse(content, schema, []);

    if (error) {
      return Result.error(new ValidationError(error));
    }

    return Result.ok(data);
  }

  #parse(
    content: unknown,
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
      case "temporal": {
        if (typeof content === "string") {
          const num = Date.parse(content);
          const date = new Date(num);

          const [data, error] = TemporalNode.of(date);

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

          for (const [key, def] of Object.entries(schema.properties)) {
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

            const [childNode, childErrors] = this.#parse(
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

            const [childNode, childErrors] = this.#parse(
              childContent,
              schema.schema,
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

        const [childNode, childErrors] = this.#parse(
          contentValue,
          childSchema,
          path.concat("1"),
        );

        if (childErrors) {
          return Result.error(childErrors);
        }

        return Result.ok(new UnionNode(childNode));
      }
      case "reference": {
        if (typeof content === "string") {
          const [data, error] = EntryId.from(content);

          if (error) {
            return Result.error([
              { path, reason: { type: "syntax_error" } satisfies ErrorReason },
            ]);
          }

          const node = ReferenceNode.of(data);

          return Result.ok(node);
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
}

export class ValidationError extends Error {
  readonly details: ErrorDetail[];

  constructor(details: ErrorDetail[]) {
    super(`Validation failed with ${details.length} errors.`);
    this.details = details;
  }
}

export interface ErrorDetail {
  path: string[];
  reason: ErrorReason;
}

export type ErrorReason =
  | { type: "invalid_type"; expected: DataType; actual: DataType }
  | { type: "syntax_error" }
  | { type: "missing_field" };

type DataType =
  | "string"
  | "number"
  | "bigint"
  | "boolean"
  | "symbol"
  | "undefined"
  | "object"
  | "function";

type Pojo = Record<PropertyKey, unknown>;

function isPojo(value: unknown): value is Pojo {
  return typeof value === "object" && !!value &&
    Reflect.getPrototypeOf(value) === Object.prototype;
}
