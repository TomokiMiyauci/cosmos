import type { DatetimeNode, Node, Resource, StringNode } from "@cosmos/core";
import type {
  GraphqlNamedOutputType,
  GraphQLQueryField,
  Plugin,
  QueryContext,
} from "../../type.ts";
import {
  getNullableType,
  type GraphQLArgumentConfig,
  GraphQLBoolean,
  GraphQLEnumType,
  type GraphQLField,
  type GraphQLInputFieldConfig,
  GraphQLInputObjectType,
  type GraphQLInputObjectTypeConfig,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  isObjectType,
  isScalarType,
  isSpecifiedScalarType,
} from "graphql";
import { ascend, descend } from "@std/data-structures/comparators";
import { GraphQLDateTime } from "graphql-scalars";
import { isNonNullType } from "graphql";

export interface OpenCrudArgs {
  where?: WhereInput;
  orderBy?: OrderByInput;
}

export interface WhereInput {
  AND?: WhereInput[];
  OR?: WhereInput[];
  NOT?: WhereInput[];

  [field: string]: FieldFilter | any;
}

export interface OrderByInput {
  [fiedl: string]: "ASC" | "DESC";
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
  isOneOf: true,
} satisfies GraphQLInputObjectTypeConfig;

const booleanWhereInput = {
  name: "BooleanWhereInput",
  fields: {
    eq: { type: GraphQLBoolean },
    not: { type: GraphQLBoolean },
  },
  isOneOf: true,
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
  isOneOf: true,
} satisfies GraphQLInputObjectTypeConfig;

function createWhereInput(
  name: string,
  type: GraphqlNamedOutputType,
  ctx: Context,
): GraphQLInputObjectType | undefined {
  if (isObjectType(type)) {
    const fieldEntries = Object.entries(type.getFields()).map(
      ([name, schema]) => {
        function resolveScalar(
          field: GraphQLField<Resource, unknown>,
        ): GraphQLInputFieldConfig {
          let type = field.type;
          if (isNonNullType(type)) {
            type = getNullableType(type);
          }

          if (isScalarType(type)) {
            if (isSpecifiedScalarType(type)) {
              switch (type) {
                case GraphQLString: {
                  return {
                    type: ctx.map.where.string,
                  };
                }

                case GraphQLBoolean: {
                  return {
                    type: ctx.map.where.boolean,
                  };
                }
              }
            }

            switch (type.name) {
              case GraphQLDateTime.name: {
                return {
                  type: ctx.map.where.datetime,
                };
              }
            }
          }

          return {} as any;
        }

        const config = resolveScalar(schema);

        return [name, config] as const;
      },
    );

    const fields = Object.fromEntries(fieldEntries);

    const input: GraphQLInputObjectType = new GraphQLInputObjectType({
      name: `${name}WhereInput`,
      fields: () => ({
        AND: {
          type: new GraphQLList(new GraphQLNonNull(input)),
        },
        OR: {
          type: new GraphQLList(new GraphQLNonNull(input)),
        },
        NOT: {
          type: new GraphQLList(new GraphQLNonNull(input)),
        },
        ...fields,
      }),
      isOneOf: true,
    });

    return input;
  }
}

interface Scalar {
  string: GraphQLInputObjectType;
  boolean: GraphQLInputObjectType;
  datetime: GraphQLInputObjectType;
}

interface Context {
  map: ScalarMap;
}

interface ScalarMap {
  where: Scalar;
  orderBy: GraphQLEnumType;
}

function createOrderByInput(
  name: string,
  type: GraphqlNamedOutputType,
  ctx: Context,
): GraphQLInputObjectType | undefined {
  if (isObjectType(type)) {
    const fieldEntries = Object.entries(type.getFields()).map(
      ([name, schema]) => {
        function resolveScalar(
          field: GraphQLField<Resource, unknown>,
        ): GraphQLInputFieldConfig {
          let type = field.type;

          if (isNonNullType(type)) {
            type = getNullableType(type);
          }
          if (isScalarType(type)) {
            if (isSpecifiedScalarType(type)) {
              switch (type) {
                case GraphQLString: {
                  return {
                    type: ctx.map.orderBy,
                  };
                }
              }
            }

            switch (type.name) {
              case GraphQLDateTime.name: {
                return {
                  type: ctx.map.orderBy,
                };
              }
            }
          }

          return {} as any;
        }

        const config = resolveScalar(schema);

        return [name, config] as const;
      },
    );

    const fields = Object.fromEntries(fieldEntries);

    return new GraphQLInputObjectType({
      name: `${name}OrderByInput`,
      fields: () => fields,
    });
  }
}

export class OpenCrud implements Plugin {
  name = "opencrud";

  provideQuery(ctx: QueryContext): GraphQLQueryField[] {
    const { entries, resources } = ctx;
    const scalar = {
      map: {
        where: {
          string: new GraphQLInputObjectType(stringWhereInput),
          boolean: new GraphQLInputObjectType(booleanWhereInput),
          datetime: new GraphQLInputObjectType(datetimeWhereInput),
        },
        orderBy: new GraphQLEnumType({
          name: "SortOrder",
          values: {
            ASC: {},
            DESC: {},
          },
        }),
      },
    } satisfies Context;

    const fields = Object.entries(resources).map(([key, resource]) => {
      const type = entries[resource.model];

      if (!type) throw new Error();

      const name = type.name;
      const whereInput = createWhereInput(name, type, scalar);
      const whereArgs: Record<string, GraphQLArgumentConfig> = whereInput
        ? {
          where: {
            type: whereInput,
          },
        }
        : {};
      const orderByInput = createOrderByInput(name, type, scalar);
      const orderByArgs: Record<string, GraphQLArgumentConfig> = orderByInput
        ? {
          orderBy: {
            type: orderByInput,
          },
        }
        : {};

      return {
        name: key,
        type: {
          type: new GraphQLNonNull(
            new GraphQLList(new GraphQLNonNull(type)),
          ),
          args: {
            ...whereArgs,
            ...orderByArgs,
          },
          resolve: async (_source: unknown, args: OpenCrudArgs, ctx) => {
            const ids = await ctx.fetcher.list(name);
            const resources = await Promise.all(
              ids.map(async (id) => {
                return { id, node: await ctx.fetcher.fetch(id) };
              }),
            );

            const filter = createFilterFromArgs(args);
            const compare = createCompareFromArts(args);

            const result = resources.filter(({ node }) => filter(node))
              .toSorted(({ node: left }, { node: right }) =>
                compare(left, right)
              );

            return result;
          },
        },
      } satisfies GraphQLQueryField;
    });

    return fields;
  }
}

function createFilterFromArgs(args: OpenCrudArgs): (node: Node) => boolean {
  return (node) => {
    return evaluateWhere(node, args.where);
  };
}

function createCompareFromArts(
  args: OpenCrudArgs,
): (left: Node, right: Node) => number {
  return (left, right) => {
    return evaluateOrderBy(left, right, args.orderBy);
  };
}

function evaluateOrderBy(
  left: Node,
  right: Node,
  orderBy: OrderByInput | undefined,
): number {
  if (!orderBy) return 0;
  if (left.type !== "map" || right.type !== "map") return 0;

  const kv = Object.entries(orderBy)[0];

  if (!kv) return 0;

  const [key, value] = kv;
  const leftValue = left.value[key];
  const rightValue = right.value[key];

  if (!leftValue || !rightValue) return 0;

  if (leftValue.type !== rightValue.type) throw new Error();

  switch (leftValue.type) {
    case "string": {
      const left = leftValue.value;
      const right = (rightValue as StringNode).value;

      switch (value) {
        case "ASC":
          return ascend(left, right);
        case "DESC":
          return descend(left, right);
      }
      break;
    }
    case "datetime": {
      const left = leftValue.value;
      const right = (rightValue as DatetimeNode).value;

      switch (value) {
        case "ASC": {
          return ascend(left, right);
        }
        case "DESC": {
          return descend(left, right);
        }
      }
      break;
    }
    case "number":
    case "boolean":
    case "asset":
    case "map":
    case "list":
    case "reference":
    case "union":
    case "markdown": {
      return 0;
    }
  }
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
