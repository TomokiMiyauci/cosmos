import type { GraphQLObjectType, GraphQLOutputType } from "graphql";
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

export interface GraphqlScalarDefinition<In, Out, Ctx = unknown> {
  type: ScalarType<Out>;
  resolve: GraphqlResolve<In, Out>;
}

export interface GrpahqlObjectTypeDefinition<T, U, Ctx = unknown> {
  type: ObjectType<U>;
  resolve: GraphqlResolve<T, U>;
}

export interface GraphqlListDefinition<T, U, Ctx = unknown> {
  type: List<GraphQLOutputType>;
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

function string(
  ctx: RuntimeContext,
): GraphqlScalarDefinition<StringNode, string> {
  return {
    type: ctx.builder.scalarType("String") as ScalarType<string>,
    resolve(node): string {
      return node.value;
    },
  };
}

function boolean(
  ctx: RuntimeContext,
): GraphqlScalarDefinition<BooleanNode, boolean> {
  return {
    type: ctx.builder.scalarType("Boolean") as ScalarType<boolean>,
    resolve(node): boolean {
      return node.value;
    },
  };
}

function datetime(
  ctx: RuntimeContext,
): GraphqlScalarDefinition<DatetimeNode, Date> {
  return {
    type: ctx.builder.scalarType("DateTime") as ScalarType<Date>,
    resolve(node): Date {
      return node.value;
    },
  };
}

function asset(ctx: RuntimeContext): GraphqlScalarDefinition<AssetNode, URL> {
  return {
    type: ctx.builder.scalarType("URL") as ScalarType<URL>,
    resolve(node): URL {
      return node.value;
    },
  };
}
function markdown(
  ctx: RuntimeContext,
): GraphqlScalarDefinition<MarkdownNode, string> {
  return {
    type: ctx.builder.scalarType("String") as ScalarType<string>,
    resolve(node): string {
      const root = toRoot(node.value);
      const str = toString(root);

      return str;
    },
  };
}

export function number(
  ctx: RuntimeContext,
): GraphqlScalarDefinition<NumberNode, number> {
  return {
    type: ctx.builder.scalarType("Float") as ScalarType<number>,
    resolve(node): number {
      return node.value;
    },
  };
}
export function stringNode(
  ctx: RuntimeContext,
): GraphqlScalarDefinition<Node, string> {
  const { type, resolve } = string(ctx);

  return {
    type,
    resolve(node): string | Promise<string> {
      assertStringNode(node);

      return resolve(node);
    },
  };
}

export function numberNode(
  ctx: RuntimeContext,
): GraphqlScalarDefinition<Node, number> {
  const { type, resolve } = number(ctx);

  return {
    type,
    resolve(node): number | Promise<number> {
      assertNumberNode(node);

      return resolve(node);
    },
  };
}

export function booleanNode(
  ctx: RuntimeContext,
): GraphqlScalarDefinition<Node, boolean> {
  const { type, resolve } = boolean(ctx);

  return {
    type,
    resolve(node): boolean | Promise<boolean> {
      assertBooleanNode(node);

      return resolve(node);
    },
  };
}

export function datetimeNode(
  ctx: RuntimeContext,
): GraphqlScalarDefinition<Node, Date> {
  const { type, resolve } = datetime(ctx);

  return {
    type,
    resolve(node): Date | Promise<Date> {
      assertDatetimeNode(node);

      return resolve(node);
    },
  };
}

export function markdownNode(
  ctx: RuntimeContext,
): GraphqlScalarDefinition<Node, string> {
  const { type, resolve } = markdown(ctx);

  return {
    type,
    resolve(node): string | Promise<string> {
      assertMarkdownNode(node);

      return resolve(node);
    },
  };
}

export function assetNode(
  ctx: RuntimeContext,
): GraphqlScalarDefinition<Node, URL> {
  const { type, resolve } = asset(ctx);

  return {
    type,
    resolve(node): URL | Promise<URL> {
      assertAssertNode(node);

      return resolve(node);
    },
  };
}

export function createNodeDefinition(
  name: string,
  schema: Schema,
  ctx: RuntimeContext,
): GraphqlDefinition<Node, Data> {
  switch (schema.type) {
    case "number":
      return numberNode(ctx);

    case "boolean":
      return booleanNode(ctx);

    case "datetime":
      return datetimeNode(ctx);

    case "markdown":
      return markdownNode(ctx);

    case "asset":
      return assetNode(ctx);

    case "string":
      return stringNode(ctx);

    case "map": {
      const { config, resolve } = createMapConfig(name, schema, ctx);

      return {
        type: ctx.builder.objectType<Data, unknown>(config),
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
    const { type, resolve } = createNodeDefinition(name, schema, ctx);

    return {
      type: required.has(key) ? nonNull(type) : type,
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
    type: list(type),
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
      return stringNode(ctx);
    case "number":
      return numberNode(ctx);
    case "boolean":
      return booleanNode(ctx);
    case "datetime":
      return datetimeNode(ctx);
    case "asset":
      return assetNode(ctx);
    case "markdown":
      return markdownNode(ctx);
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
