import type { Node, Schema } from "@cosmos/core";
import type {
  GraphQLQueryField,
  QueryContext,
  SchemaPlugin,
} from "../../type.ts";
import {
  type GraphQLInputFieldConfig,
  GraphQLInputObjectType,
  type GraphQLInputObjectTypeConfig,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from "graphql";
import { GraphQLBoolean } from "graphql";

export interface OpenCrudArgs {
  where?: WhereInput;
}

export interface WhereInput {
  AND?: WhereInput[];
  OR?: WhereInput[];
  NOT?: WhereInput[];

  [field: string]: FieldFilter | any;
}

const stringWhereInput = {
  name: "StringWhereInput",
  fields: {
    eq: { type: GraphQLString },
    not: { type: GraphQLString },
    contains: { type: GraphQLString },
    not_contains: { type: GraphQLString },
    starts_with: { type: GraphQLString },
    not_starts_with: { type: GraphQLString },
    ends_with: { type: GraphQLString },
    not_ends_with: { type: GraphQLString },
    lt: { type: GraphQLString },
    lte: { type: GraphQLString },
    gt: { type: GraphQLString },
    gte: { type: GraphQLString },
    in: { type: new GraphQLList(GraphQLString) },
    not_in: { type: new GraphQLList(GraphQLString) },
  },
} satisfies GraphQLInputObjectTypeConfig;

const booleanWhereInput = {
  name: "BooleanWhereInput",
  fields: {
    eq: { type: GraphQLBoolean },
    not: { type: GraphQLBoolean },
  },
} satisfies GraphQLInputObjectTypeConfig;

const datetimeWhereInput = {
  name: "DatetimeWhereInput",
  fields: {
    eq: { type: GraphQLString },
    not: { type: GraphQLString },
    in: { type: new GraphQLList(GraphQLString) },
    not_in: { type: new GraphQLList(GraphQLString) },
    lt: { type: GraphQLString },
    lte: { type: GraphQLString },
    gt: { type: GraphQLString },
    gte: { type: GraphQLString },
  },
} satisfies GraphQLInputObjectTypeConfig;

export class OpenCrud implements SchemaPlugin {
  name = "opencrud";

  provideQuery(ctx: QueryContext): GraphQLQueryField[] {
    const { fetcher: datalayer, entries } = ctx;
    const schelar = {
      string: new GraphQLInputObjectType(stringWhereInput),
      boolean: new GraphQLInputObjectType(booleanWhereInput),
      datetime: new GraphQLInputObjectType(datetimeWhereInput),
    };

    return entries.map(({ type: model, definition }) => {
      const name = model.name;
      const pluralName = `${model.name}s`;

      const fieldEntries = definition.schemas.map((schema) => {
        function resolveScalar(schema: Schema): GraphQLInputFieldConfig {
          switch (schema.type) {
            case "string": {
              return { type: schelar.string };
            }

            case "boolean": {
              return { type: schelar.boolean };
            }
            case "datetime": {
              return { type: schelar.datetime };
            }
            case "map":
            case "id":
            case "asset": {
              // deno-lint-ignore no-explicit-any
              return {} as any;
            }
          }
        }

        const config = resolveScalar(schema);

        return [schema.name, config] as const;
      });

      const fields = Object.fromEntries(fieldEntries);

      const fieldWheareInput: GraphQLInputObjectType =
        new GraphQLInputObjectType({
          name: `${name}WhereInput`,
          fields: () => ({
            AND: {
              type: new GraphQLList(new GraphQLNonNull(fieldWheareInput)),
            },
            OR: {
              type: new GraphQLList(new GraphQLNonNull(fieldWheareInput)),
            },
            NOT: {
              type: new GraphQLList(new GraphQLNonNull(fieldWheareInput)),
            },
            ...fields,
          }),
        });

      return {
        name: pluralName,
        type: {
          type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(model))),
          args: {
            where: {
              type: fieldWheareInput,
            },
          },
          resolve: async (_source: unknown, args: OpenCrudArgs) => {
            const ids = await datalayer.node.list(model.name);
            const nodes = await Promise.all(
              ids.map((id) => datalayer.node.fetch(id)),
            );

            const filter = createFilterFromArgs(args);

            const filterd = nodes.filter(filter);

            return filterd;
          },
        },
      } satisfies GraphQLQueryField;
    });
  }
}

function createFilterFromArgs(args: OpenCrudArgs): (node: Node) => boolean {
  return (node) => {
    return evaluateWhere(node, args.where);
  };
}

function evaluateWhere(node: Node, where?: WhereInput): boolean {
  if (!where) return true;
  if (node.type !== "map") return false;

  const { NOT, AND, OR, ...rest } = where;

  if (AND) {
    return AND.every((where) => evaluateWhere(node, where));
  }

  if (OR) {
    return OR.some((where) => evaluateWhere(node, where));
  }

  if (NOT) {
    return !NOT.every((where) => evaluateWhere(node, where));
  }

  return Object.entries(node.value).every(([key, node]) => {
    const filedFilter = rest[key] as FieldFilter | undefined;

    if (!filedFilter) return true;

    switch (node.type) {
      case "string": {
        const filter = filedFilter as StringFieldFilter;
        const entries = Object.entries(filter) as StringOperationPair[];

        return entries.every((entry) => compareString(node.value, entry));
      }
      case "boolean": {
        const filter = filedFilter as BooleanFieldFilter;
        const entries = Object.entries(filter) as BooleanOperationPair[];

        return entries.every((entry) => compareBoolean(node.value, entry));
      }
      case "id":
      case "datetime":
      case "asset":
      case "map": {
        return false;
      }
    }
  });
}

function compareString(value: string, pair: StringOperationPair): boolean {
  const [op, operand] = pair;

  switch (op) {
    case "eq": {
      return value === operand;
    }
    case "not": {
      return value !== operand;
    }
    case "in": {
      return operand.includes(value);
    }
    case "contains": {
      return value.includes(operand);
    }
    case "not_contains": {
      return !value.includes(operand);
    }
    case "starts_with": {
      return value.startsWith(operand);
    }
    case "not_starts_with": {
      return !value.startsWith(operand);
    }
    case "ends_with": {
      return value.endsWith(operand);
    }
    case "not_ends_with": {
      return !value.endsWith(operand);
    }
    case "lt": {
      return value < operand;
    }
    case "lte": {
      return value <= operand;
    }
    case "gt": {
      return value > operand;
    }
    case "gte": {
      return value >= operand;
    }
    case "not_in": {
      return !operand.includes(value);
    }
  }
}

function compareBoolean(value: boolean, pair: BooleanOperationPair): boolean {
  const [op, operand] = pair;

  switch (op) {
    case "eq": {
      return value === operand;
    }
    case "not": {
      return value !== operand;
    }
  }
}

type Tuple<T> = {
  [k in keyof T]: [k, NonNullable<T[k]>];
}[keyof T];

type StringOperationPair = NonNullable<Tuple<StringFieldFilter>>;
type BooleanOperationPair = NonNullable<Tuple<BooleanFieldFilter>>;

interface StringFieldFilter {
  eq?: string;
  not?: string;
  contains?: string;
  not_contains?: string;
  starts_with?: string;
  not_starts_with?: string;
  ends_with?: string;
  not_ends_with?: string;
  lt?: string;
  lte?: string;
  gt?: string;
  gte?: string;
  in?: string[];
  not_in?: string[];
}

interface NumberFieldFilter {
  eq?: number;
  not?: number;
  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;
  in?: number[];
  not_in?: number[];
}

interface BooleanFieldFilter {
  eq?: boolean;
  not?: boolean;
}

interface DatetimeFieldFilter {
  eq?: Date;
  not?: Date;
  lt?: Date;
  lte?: Date;
  gt?: Date;
  gte?: Date;
}

type FieldFilter =
  | StringFieldFilter
  | NumberFieldFilter
  | BooleanFieldFilter
  | DatetimeFieldFilter;
