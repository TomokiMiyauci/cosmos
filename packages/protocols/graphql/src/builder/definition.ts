import {
  GraphQLBoolean,
  type GraphQLFieldConfig,
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  type GraphQLScalarType,
  GraphQLString,
  GraphQLUnionType,
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
  MapNode,
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
import { GraphQLDateTime, GraphQLURL } from "graphql-scalars";
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
import type { Fetcher, Resource } from "../type.ts";
import { toRoot, toString } from "@cosmos/codec-markdown";
import { mapValues } from "@std/collections";

export interface GraphqlScalarDefinition<In, Out, Ctx = unknown> {
  type: GraphQLScalarType<Out>;
  resolve: GraphqlResolve<In, Out>;
}

export interface GrpahqlObjectTypeDefinition<T, U, Ctx = unknown> {
  type: GraphQLObjectType<U>;
  resolve: GraphqlResolve<T, U>;
}

type GraphqlItem<U> =
  | GraphQLScalarType<U>
  | GraphQLObjectType<U>
  | GraphQLUnionType
  | GraphQLList<GraphqlItem<U>>;

export interface GraphqlListDefinition<T, U, Ctx = unknown> {
  type: GraphQLList<GraphqlItem<U>>;
  resolve: GraphqlResolve<T, U[]>;
}

export interface GraphqlUnionDefinition<T, U, Ctx = unknown> {
  type: GraphQLUnionType;
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

export const boolean = {
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

export const stringNode = {
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
  resolve(node): string {
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
):
  | GraphqlDefinition<Node, Data>
  | GraphqlDefinition<Node, MapNode>
  | GraphqlDefinition<Node, Resource> {
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

    case "map":
      return createMap(name, schema, ctx);

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
): GrpahqlObjectTypeDefinition<Node, Resource> {
  const reference = ctx.map[schema.model];

  if (!reference) throw new Error();

  return {
    type: reference,
    async resolve(parent): Promise<Resource> {
      assertReferenceNode(parent);

      const id = parent.value;
      const node = await ctx.fetcher.fetch(id);

      return {
        id,
        node,
      } satisfies Resource;
    },
  } satisfies GraphqlDefinition<Node, Resource>;
}

function createMap(
  name: string,
  schema: MapSchema,
  ctx: RuntimeContext,
): GrpahqlObjectTypeDefinition<Node, MapNode> {
  const required = new Set(schema.required);
  const type = new GraphQLObjectType<MapNode>({
    name,
    fields: () => {
      const fields = mapValues(schema.props, (schema, key) => {
        const { type, resolve } = createNodeDefinition(
          scope(name, key),
          schema,
          ctx,
        );

        function mappedResolve(node: Node): Data | Promise<Data> | null {
          assertMapNode(node);
          const child = node.value[key];

          if (!child) return null;

          return resolve(child);
        }

        return {
          type: required.has(key) ? new GraphQLNonNull(type) : type,
          resolve: mappedResolve,
          description: schema.description,
        } satisfies GraphQLFieldConfig<MapNode, unknown>;
      });

      return fields;
    },
    description: schema.description,
  });

  return {
    type,
    resolve(node): MapNode {
      assertMapNode(node);

      return node;
    },
  } satisfies GraphqlDefinition<Node, MapNode>;
}

function createList(
  name: string,
  schema: ListSchema,
  ctx: RuntimeContext,
): GraphqlListDefinition<Node, Data> {
  const { type, resolve } = createNodeDefinition(name, schema.item, ctx);

  return {
    // TODO: remove any
    type: new GraphQLList(type as any),
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
): GraphqlUnionDefinition<Node, Node> {
  const map = mapValues(
    schema.props,
    (
      schema,
      key,
    ) => createObject(scope(name, key), schema, ctx),
  );
  const types = Object.values(map);
  const weakMap = new WeakMap<object, string>();

  return {
    type: new GraphQLUnionType({
      name,
      types,
      resolveType(value: unknown): string | undefined {
        if (value && typeof value === "object") {
          const key = weakMap.get(value);

          if (typeof key === "string") {
            const keyed = map[key];

            if (keyed) {
              return keyed.name;
            }
          }
        }
      },
    }),
    resolve(node): Node {
      assertUnionNode(node);

      return node.value;
    },
  } satisfies GraphqlDefinition<Node, Node>;
}

function createInstance(
  schema: InstanceSchema,
  ctx: RuntimeContext,
): GrpahqlObjectTypeDefinition<Node, Resource> {
  const reference = ctx.map[schema.model];

  if (!reference) throw new Error();

  return {
    type: reference,
    resolve(node): Resource {
      return { id: "", node };
    },
  } satisfies GraphqlDefinition<Node, Resource>;
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
): GraphQLObjectType<Resource> {
  const def = resolveScalarDefinition(schema);

  return new GraphQLObjectType({
    name,
    fields: {
      value: {
        type: def.type,
        resolve(resource): Data | Promise<Data> {
          const node = resolveResource(resource);
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
  | Node
  | Date
  | URL
  | Resource
  | Data[];

export function createObject(
  name: string,
  schema: Schema,
  ctx: RuntimeContext,
): GraphQLObjectType<Resource> {
  switch (schema.type) {
    case "string":
    case "boolean":
    case "datetime":
    case "asset":
    case "markdown":
    case "number":
      return createScalarObject(name, schema);
    case "map":
      return createMapObject(name, schema, ctx);
    case "list":
      return createListObject(name, schema, ctx);

    case "reference": {
      const objectType = ctx.map[schema.model];

      if (!objectType) throw new Error();

      return objectType;
    }
    case "instance": {
      const objectType = ctx.map[schema.model];

      if (!objectType) throw new Error();

      return objectType;
    }
    case "union": {
      const { type, resolve } = createUnion(name, schema, ctx);

      return new GraphQLObjectType({
        name: scope(name, "value"),
        fields: {
          value: {
            type,
            resolve(resource): Node | Promise<Node> {
              const node = resolveResource(resource);

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
): GraphQLObjectType<Resource> {
  const { type, resolve } = createMap(name, schema, ctx);

  return new GraphQLObjectType<Resource>({
    name: type.name,
    description: type.description,
    interfaces: type.getInterfaces(),
    fields: () => {
      const config = type.toConfig();

      const fields = mapValues(
        config.fields,
        (field: GraphQLFieldConfig<MapNode, unknown>) => {
          return {
            ...field,
            async resolve(resource: Resource, ...args): Promise<unknown> {
              const node = resolveResource(resource);
              const mapNode = await resolve(node);

              return field.resolve?.(mapNode, ...args);
            },
            async subscribe(resource: Resource, ...args): Promise<unknown> {
              const node = resolveResource(resource);
              const mapNode = await resolve(node);

              return field.resolve?.(mapNode, ...args);
            },
          } satisfies GraphQLFieldConfig<Resource, unknown>;
        },
      );

      return fields;
    },
    astNode: type.astNode,
    extensionASTNodes: type.extensionASTNodes,
  });
}

function createListObject(
  name: string,
  schema: ListSchema,
  ctx: RuntimeContext,
): GraphQLObjectType<Resource> {
  const of = createObject(name, schema.item, ctx);

  return new GraphQLObjectType<Resource>({
    name,
    fields: {
      value: {
        type: new GraphQLList(of),
        resolve(resource): Node[] {
          const node = resolveResource(resource);

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
  map: Map;
}

export type Map = Record<string, GraphQLObjectType<Resource>>;

function scope(...scopes: string[]): string {
  return scopes.join("_");
}

function resolveResource(resource: Resource): Node {
  return resource.node;
}
