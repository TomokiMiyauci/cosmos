import type {
  DatetimeNode,
  Node,
  Resource,
  Schema,
  StringNode,
} from "@cosmos/core";
import type {
  Plugin,
  QueryContext,
  QueryMap,
  ResolverContext,
} from "../../type.ts";
import {
  type GraphQLArgumentConfig,
  GraphQLBoolean,
  GraphQLEnumType,
  type GraphQLFieldConfig,
  type GraphQLInputFieldConfig,
  GraphQLInputObjectType,
  type GraphQLInputObjectTypeConfig,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from "graphql";
import { ascend, descend } from "@std/data-structures/comparators";
import { filterValues } from "@std/collections/filter-values";
import { mapValues } from "@std/collections/map-values";

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
    notContains: { type: GraphQLString },
    startsWith: { type: GraphQLString },
    notStartsWith: { type: GraphQLString },
    endsWith: { type: GraphQLString },
    notEndsWith: { type: GraphQLString },
    lt: { type: GraphQLString },
    lte: { type: GraphQLString },
    gt: { type: GraphQLString },
    gte: { type: GraphQLString },
    in: { type: new GraphQLList(GraphQLString) },
    notIn: { type: new GraphQLList(GraphQLString) },
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
    notIn: { type: new GraphQLList(GraphQLString) },
    lt: { type: GraphQLString },
    lte: { type: GraphQLString },
    gt: { type: GraphQLString },
    gte: { type: GraphQLString },
  },
  isOneOf: true,
} satisfies GraphQLInputObjectTypeConfig;

function createWhereInput(
  name: string,
  schema: Schema,
  ctx: Context,
): GraphQLInputObjectType | undefined {
  function resolveScalar(
    schema: Schema,
  ): GraphQLInputFieldConfig | null {
    switch (schema.type) {
      case "string": {
        return {
          type: ctx.map.where.string,
        };
      }
      case "boolean": {
        return {
          type: ctx.map.where.boolean,
        };
      }
      case "datetime": {
        return {
          type: ctx.map.where.datetime,
        };
      }
      case "number":
      case "asset":
      case "map":
      case "list":
      case "reference":
      case "instance":
      case "union":
      case "markdown":
    }

    return null;
  }

  if (schema.type === "map") {
    const mappedProps = mapValues(schema.props, resolveScalar);
    const fields = filterValues(mappedProps, isTruthy) as Record<
      string,
      GraphQLInputFieldConfig
    >;

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
  schema: Schema,
  ctx: Context,
): GraphQLInputObjectType | undefined {
  if (schema.type === "map") {
    const mappedProps = mapValues(schema.props, (schema) => {
      switch (schema.type) {
        case "string": {
          return {
            type: ctx.map.orderBy,
          };
        }
        case "datetime": {
          return {
            type: ctx.map.orderBy,
          };
        }
        case "number":
        case "boolean":
        case "asset":
        case "map":
        case "list":
        case "reference":
        case "instance":
        case "union":
        case "markdown":
      }
    });
    const fields = filterValues(mappedProps, isTruthy) as Record<
      string,
      { type: GraphQLEnumType }
    >;

    return new GraphQLInputObjectType({
      name: `${name}OrderByInput`,
      fields,
    });
  }
}

export class OpenCrud implements Plugin {
  name = "opencrud";

  provideQuery(ctx: QueryContext): QueryMap {
    const { types, resources } = ctx;
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

    const collectionResources = filterValues(resources, isCollection);

    const fields = mapValues(collectionResources, (resource, key) => {
      const entry = types[resource.model];

      if (!entry) throw new Error();

      const { type, schema } = entry;
      const name = type.name;
      const whereInput = createWhereInput(name, schema, scalar);
      const whereArgs: Record<string, GraphQLArgumentConfig> = whereInput
        ? {
          where: {
            type: whereInput,
          },
        }
        : {};
      const orderByInput = createOrderByInput(name, schema, scalar);
      const orderByArgs: Record<string, GraphQLArgumentConfig> = orderByInput
        ? {
          orderBy: {
            type: orderByInput,
          },
        }
        : {};

      return {
        type: new GraphQLNonNull(
          new GraphQLList(new GraphQLNonNull(type)),
        ),
        args: {
          ...whereArgs,
          ...orderByArgs,
        },
        resolve: async (_source: unknown, args: OpenCrudArgs, ctx) => {
          const ids = await ctx.fetcher.list(key);
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
      } satisfies GraphQLFieldConfig<unknown, ResolverContext>;
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
    case "notContains": {
      return !value.includes(operand);
    }
    case "startsWith": {
      return value.startsWith(operand);
    }
    case "notStartsWith": {
      return !value.startsWith(operand);
    }
    case "endsWith": {
      return value.endsWith(operand);
    }
    case "notEndsWith": {
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
    case "notIn": {
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
  notContains?: string;
  startsWith?: string;
  notStartsWith?: string;
  endsWith?: string;
  notEndsWith?: string;
  lt?: string;
  lte?: string;
  gt?: string;
  gte?: string;
  in?: string[];
  notIn?: string[];
}

interface NumberFieldFilter {
  eq?: number;
  not?: number;
  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;
  in?: number[];
  notIn?: number[];
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

function isCollection(resource: Resource): boolean {
  return resource.type === "collection";
}

function isTruthy<T>(value: T): value is NonNullable<T> {
  return !!value;
}
