import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  type GraphQLObjectType,
  type GraphQLOutputType,
  type GraphQLScalarType,
  GraphQLString,
} from "graphql";
import type {
  AssetNode,
  AssetSchema,
  BooleanNode,
  BooleanSchema,
  DatetimeNode,
  DatetimeSchema,
  InstanceSchema,
  ListSchema,
  MapSchema,
  MarkdownNode,
  MarkdownSchema,
  Node,
  NumberNode,
  NumberSchema,
  ReferenceSchema,
  Schema,
  StringNode,
  StringSchema,
  UnionSchema,
} from "@cosmos/core";
import {
  assertAssertNode,
  assertBooleanNode,
  assertDatetimeNode,
  assertListNode,
  assertMapNode,
  assertMarkdownNode,
  assertNumberNode,
  assertReferenceNode,
  assertStringNode,
  assertUnionNode,
} from "@cosmos/node-validator";
import type { Entry, Fetcher } from "../type.ts";
import { toRoot, toString } from "@cosmos/codec-markdown";
import { mapValues } from "@std/collections";
import {
  type FieldConfig,
  type List,
  list,
  nonNull,
  type ObjectType,
  type ObjectTypeConfig,
  type ScalarType,
  type SchemaBuilder,
  type UnionType,
} from "@miyauci/graphql-builder";
import { GraphQLDateTime, GraphQLURL } from "graphql-scalars";

export interface GraphqlScalarDefinition<In, Out, Ctx = unknown> {
  type: ScalarType<Out> | GraphQLScalarType<Out>;
  resolve: GraphqlResolve<In, Out>;
}

export interface GrpahqlObjectTypeDefinition<T, U, Ctx = unknown> {
  type: ObjectType<U>;
  resolve: GraphqlResolve<T, U>;
}

export interface GraphqlListDefinition<T, U, Ctx = unknown> {
  type: List<GraphQLOutputType> | GraphQLList<GraphQLOutputType>;
  resolve: GraphqlResolve<T, U[]>;
}

export interface GraphqlUnionDefinition<T, U, Ctx = unknown> {
  type: UnionType;
  resolve: GraphqlResolve<T, U>;
}

export type GraphqlDefinition<T, U = T, Ctx = unknown> =
  | GraphqlScalarDefinition<T, U, Ctx>
  | GrpahqlObjectTypeDefinition<T, U>
  | GraphqlListDefinition<T, U>
  | GraphqlUnionDefinition<T, U>;

export interface GraphqlResolve<In, Out> {
  (value: In): Out | Promise<Out>;
}

export const string = {
  type: GraphQLString,
  resolve(node): string {
    return node.value;
  },
} satisfies GraphqlScalarDefinition<StringNode, string>;

const boolean = {
  type: GraphQLBoolean,
  resolve(node): boolean {
    return node.value;
  },
} satisfies GraphqlScalarDefinition<BooleanNode, boolean>;

const datetime = {
  type: GraphQLDateTime,
  resolve(node): Date {
    return node.value;
  },
} satisfies GraphqlScalarDefinition<DatetimeNode, Date>;

const asset = {
  type: GraphQLURL as GraphQLScalarType<URL>,
  resolve(node): URL {
    return node.value;
  },
} satisfies GraphqlScalarDefinition<AssetNode, URL>;

const markdown = {
  type: GraphQLString,
  resolve(node): string {
    const root = toRoot(node.value);
    const str = toString(root);

    return str;
  },
} satisfies GraphqlScalarDefinition<MarkdownNode, string>;

export const number = {
  type: GraphQLFloat,
  resolve(node): number {
    return node.value;
  },
} satisfies GraphqlScalarDefinition<NumberNode, number>;

const stringNode = {
  type: string.type,
  resolve(node): string {
    assertStringNode(node);

    return string.resolve(node);
  },
} satisfies GraphqlScalarDefinition<Node, string>;

export const numberNode = {
  type: number.type,
  resolve(node): number {
    assertNumberNode(node);

    return number.resolve(node);
  },
} satisfies GraphqlScalarDefinition<Node, number>;

export const booleanNode = {
  type: boolean.type,
  resolve(node): boolean {
    assertBooleanNode(node);

    return boolean.resolve(node);
  },
} satisfies GraphqlScalarDefinition<Node, boolean>;

export const datetimeNode = {
  type: datetime.type,
  resolve(node): Date {
    assertDatetimeNode(node);

    return datetime.resolve(node);
  },
} satisfies GraphqlScalarDefinition<Node, Date>;

export const markdownNode = {
  type: markdown.type,
  resolve(node): string | Promise<string> {
    assertMarkdownNode(node);

    return markdown.resolve(node);
  },
} satisfies GraphqlScalarDefinition<Node, string>;

export const assetNode = {
  type: asset.type,
  resolve(node): URL {
    assertAssertNode(node);

    return asset.resolve(node);
  },
} satisfies GraphqlScalarDefinition<Node, URL>;

export function createNodeDefinition(
  name: string,
  schema: Schema,
  ctx: RuntimeContext,
): GraphqlDefinition<Node, Data> {
  switch (schema.type) {
    case "number":
      return numberNode;

    case "boolean":
      return booleanNode;

    case "datetime":
      return datetimeNode;

    case "markdown":
      return markdownNode;

    case "asset":
      return assetNode;

    case "string":
      return stringNode;

    case "map": {
      const { config, resolve } = createMapConfig(name, schema, ctx);

      return {
        type: ctx.builder.objectType(config),
        resolve,
      };
    }

    case "list":
      return createList(name, schema, ctx);

    case "reference":
      return createReference(schema, ctx);

    case "instance":
      return createInstance(schema, ctx);

    case "union":
      return createUnion(name, schema, ctx);
  }
}

export function createReference(
  schema: ReferenceSchema,
  ctx: RuntimeContext,
): GrpahqlObjectTypeDefinition<Node, Data> {
  const reference = ctx.builder.objectType(schema.model);

  return {
    type: reference,
    async resolve(parent): Promise<Entry> {
      assertReferenceNode(parent);

      const id = parent.value.toString();
      const node = await ctx.fetcher.fetch(id);

      return {
        id,
        node,
      } satisfies Entry;
    },
  };
}

function createMapConfig(
  name: string,
  schema: MapSchema,
  ctx: RuntimeContext,
): {
  config: ObjectTypeConfig<Data, unknown>;
  resolve: GraphqlResolve<Node, Record<string, Node>>;
} {
  const required = new Set(schema.required);
  const fields = mapValues(schema.props, (schema, key) => {
    const { type, resolve } = createNodeDefinition(
      scope(name, key),
      schema,
      ctx,
    );

    return {
      type: required.has(key)
        ? "type" in type ? nonNull(type) : new GraphQLNonNull(type)
        : type,
      resolve(data): Data | Promise<Data> | null {
        data = data as Record<string, Node>;

        const node = data[key];

        if (!node) return null;

        return resolve(node);
      },
    } satisfies FieldConfig<Data, unknown>;
  });

  return {
    config: { name, fields, description: schema.description },
    resolve(node: Node): Record<string, Node> {
      assertMapNode(node);

      return node.value;
    },
  };
}

function createList(
  name: string,
  schema: ListSchema,
  ctx: RuntimeContext,
): GraphqlListDefinition<Node, Data> {
  const { type, resolve } = createNodeDefinition(name, schema.item, ctx);

  return {
    type: "type" in type ? list(type) : new GraphQLList(type),
    async resolve(node): Promise<Data[]> {
      assertListNode(node);

      const promises = node.value.map(async (child) => await resolve(child));
      const result = await Promise.all(promises);

      return result;
    },
  } satisfies GraphqlListDefinition<Node, Data>;
}

function createUnion(
  name: string,
  schema: UnionSchema,
  ctx: RuntimeContext,
): GraphqlUnionDefinition<Node, Data> {
  const map = mapValues(
    schema.props,
    (_, key) => ctx.builder.objectType(scope(name, key)),
  );
  const types = Object.values(map);
  const weakMap = new WeakMap<object, string>();

  return {
    type: ctx.builder.unionType({
      name,
      types,
      resolveType(value: unknown): string | undefined {
        if (value && typeof value === "object") {
          const key = weakMap.get(value);

          if (typeof key === "string") {
            const keyed = map[key];

            if (keyed) {
              return keyed.type.name;
            }
          }
        }
      },
    }),
    resolve(node): Entry {
      assertUnionNode(node);

      return { id: "", node: node.value };
    },
  };
}

function createInstance(
  schema: InstanceSchema,
  ctx: RuntimeContext,
): GrpahqlObjectTypeDefinition<Node, Data> {
  const reference = ctx.builder.objectType(schema.model);

  return {
    type: reference,
    resolve(node): Entry {
      return { id: "", node };
    },
  } satisfies GraphqlDefinition<Node, Entry>;
}

type ScalarSchema =
  | StringSchema
  | NumberSchema
  | DatetimeSchema
  | BooleanSchema
  | AssetSchema
  | MarkdownSchema;

function resolveScalarDefinition(
  schema: ScalarSchema,
  ctx: RuntimeContext,
): GraphqlScalarDefinition<Node, Data> {
  switch (schema.type) {
    case "string":
      return stringNode;
    case "number":
      return numberNode;
    case "boolean":
      return booleanNode;
    case "datetime":
      return datetimeNode;
    case "asset":
      return assetNode;
    case "markdown":
      return markdownNode;
  }
}

export function createScalarObject(
  name: string,
  schema: ScalarSchema,
  ctx: RuntimeContext,
): ObjectType<Entry> {
  const def = resolveScalarDefinition(schema, ctx);

  return ctx.builder.objectType({
    name,
    fields: {
      value: {
        type: def.type,
        resolve(resource): Data | Promise<Data> {
          const node = resolveEntry(resource);
          return def.resolve(node);
        },
      },
    },
    description: schema.description,
  });
}

export type Data =
  | string
  | number
  | boolean
  | Date
  | URL
  | Entry
  | Record<string, Node>
  | Data[];

export function createObject(
  name: string,
  schema: Schema,
  ctx: RuntimeContext,
): ObjectType<Entry> {
  switch (schema.type) {
    case "string":
    case "boolean":
    case "datetime":
    case "asset":
    case "markdown":
    case "number":
      return createScalarObject(name, schema, ctx);
    case "map":
      return createMapObject(name, schema, ctx);
    case "list":
      return createListObject(name, schema, ctx);

    case "reference": {
      return ctx.builder.objectType(schema.model);
    }
    case "instance": {
      return ctx.builder.objectType(schema.model);
    }
    case "union": {
      const { type, resolve } = createUnion(name, schema, ctx);

      return ctx.builder.objectType({
        name: scope(name, "value"),
        fields: {
          value: {
            type,
            resolve(resource): Data | Promise<Data> {
              const node = resolveEntry(resource);

              return resolve(node);
            },
          },
        },
        description: schema.description,
      });
    }
  }
}

function createMapObject(
  name: string,
  schema: MapSchema,
  ctx: RuntimeContext,
): ObjectType<Entry> {
  const { config, resolve } = createMapConfig(name, schema, ctx);

  const fields = mapValues(
    config.fields,
    (field) => {
      return {
        ...field,
        async resolve(resource: Entry, ...args): Promise<unknown> {
          const node = resolveEntry(resource);
          const mapNode = await resolve(node);

          return field.resolve?.(mapNode, ...args);
        },
        async subscribe(resource: Entry, ...args): Promise<unknown> {
          const node = resolveEntry(resource);
          const mapNode = await resolve(node);

          return field.resolve?.(mapNode, ...args);
        },
      } satisfies FieldConfig<Entry, unknown>;
    },
  );

  return ctx.builder.objectType<Entry, unknown>({
    ...config,
    fields,
  });
}

function createListObject(
  name: string,
  schema: ListSchema,
  ctx: RuntimeContext,
): ObjectType<Entry> {
  const of = createObject(name, schema.item, ctx);

  return ctx.builder.objectType<Entry, unknown>({
    name,
    fields: {
      value: {
        type: list(of),
        resolve(resource): Node[] {
          const node = resolveEntry(resource);

          assertListNode(node);

          return node.value;
        },
      },
    },
    description: schema.description,
  });
}

export interface RuntimeContext {
  fetcher: Fetcher;
  builder: SchemaBuilder;
}

export type Map = Record<string, GraphQLObjectType<Entry>>;

function scope(...scopes: string[]): string {
  return scopes.join("_");
}

function resolveEntry(resource: Entry): Node {
  return resource.node;
}
