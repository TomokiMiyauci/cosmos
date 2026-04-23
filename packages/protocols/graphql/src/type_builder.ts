import type {
  AssetNode,
  BooleanNode,
  DatetimeNode,
  InstanceSchema,
  ListSchema,
  MapSchema,
  MarkdonwNode,
  Node,
  NumberNode,
  ReferenceSchema,
  Schema,
  StringNode,
  UnionSchema,
} from "@cosmos/core";
import type {
  BuilderContext,
  Fetcher,
  GraphqlEntry,
  Resource,
  TypeBuilder,
} from "./type.ts";
import {
  GraphQLBoolean,
  type GraphQLFieldConfig,
  GraphQLFloat,
  GraphQLID,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLObjectType,
  type GraphQLScalarType,
  GraphQLString,
  GraphQLUnionType,
} from "graphql";
import { GraphQLDateTime, GraphQLURL } from "graphql-scalars";
import { mapValues } from "@std/collections";
import { toRoot, toString } from "@cosmos/codec-markdown";
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
import { GraphQLNonNull } from "graphql";

interface RuntimeContext {
  fetcher: Fetcher;
  map: Map;
  base: {
    node: GraphQLInterfaceType;
  };
}

export class BasicTypeBuilder implements TypeBuilder {
  build(ctx: BuilderContext): GraphqlEntry[] {
    const map: Map = {};
    const node = new GraphQLInterfaceType({
      name: "node",
      fields: {
        id: { type: GraphQLID },
      },
    });
    const context = {
      map,
      fetcher: ctx.datalayer.node,
      base: { node },
    } satisfies RuntimeContext;
    const entries = Object.entries(ctx.manifest.schemas).map(
      ([name, schema]) => {
        const type = createObject(
          name,
          schema,
          context,
        );

        map[name] = type;

        return {
          type,
          schema,
        };
      },
    );

    return entries;
  }
}

interface GraphqlScalarDefinition<In, Out, Ctx = unknown>
  extends GraphQLFieldConfig<In, Ctx> {
  type: GraphQLScalarType<Out>;
  resolve: GraphqlResolve<In, Out>;
}

interface GraphqlResolve<In, Out> {
  (value: In): Out | Promise<Out>;
}

const string = {
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

const number = {
  type: GraphQLFloat,
  resolve(node): number {
    return node.value;
  },
} satisfies GraphqlScalarDefinition<NumberNode, number>;

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
} satisfies GraphqlScalarDefinition<MarkdonwNode, string>;

type Map = Record<string, GraphQLObjectType<Resource>>;

function createReference(
  schema: ReferenceSchema,
  ctx: RuntimeContext,
): GraphqlDefinition<Node, Resource> {
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

type Data =
  | string
  | number
  | boolean
  | Node
  | Resource
  | Date
  | URL
  | Resource[];

function createList(
  name: string,
  schema: ListSchema,
  ctx: RuntimeContext,
): GraphqlListDefinition<Node, Resource[]> {
  const of = createObject(name, schema.item, ctx);

  return {
    type: new GraphQLList(of),
    resolve(node): Resource[] {
      assertListNode(node);

      return node.value.map((node) => {
        return {
          id: "",
          node,
        };
      });
    },
  } satisfies GraphqlDefinition<Node, Resource[]>;
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

function createMap(
  name: string,
  schema: MapSchema,
  ctx: RuntimeContext,
): GrpahqlObjectTypeDefinition<Node, Resource> {
  const objectType = createObject(name, schema, ctx);

  return {
    type: objectType,
    resolve(node): Resource {
      assertMapNode(node);

      return { id: "", node };
    },
  } satisfies GraphqlDefinition<Node, Resource>;
}

function scope(...scopes: string[]): string {
  return scopes.join("_");
}

function createNodeDefinition(
  name: string,
  schema: Schema,
  ctx: RuntimeContext,
): GraphqlDefinition<Node, any> {
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

function createScalarObject(
  name: string,
  config: GraphqlScalarDefinition<Node, Data>,
  ctx: RuntimeContext,
): GraphQLObjectType<Resource> {
  return new GraphQLObjectType({
    name,
    interfaces: [ctx.base.node],
    fields: {
      id,
      value: {
        type: config.type,
        resolve(resource): Data | Promise<Data> {
          const node = resolveResource(resource);
          return config.resolve(node);
        },
      },
    },
  });
}

function createMapObject(
  name: string,
  schema: MapSchema,
  ctx: RuntimeContext,
): GraphQLObjectType<Resource> {
  const required = new Set(schema.required);
  return new GraphQLObjectType<Resource>({
    name,
    interfaces: [ctx.base.node],
    fields: () => {
      const fields = mapValues(schema.props, (schema, key) => {
        const { type, resolve } = createNodeDefinition(
          scope(name, key),
          schema,
          ctx,
        );

        const mapped = {
          type,
          resolve(node: Node): Data | Promise<Data> | null {
            assertMapNode(node);

            const child = node.value[key];

            if (!child) return null;

            return resolve(child);
          },
        };

        return {
          type: required.has(key)
            ? new GraphQLNonNull(mapped.type)
            : mapped.type,
          resolve(resource: Resource): Data | Promise<Data> | null {
            const node = resolveResource(resource);

            return mapped.resolve(node);
          },
          description: schema.description,
        } satisfies GraphQLFieldConfig<Resource, unknown>;
      });

      return {
        ...fields,
        id,
      };
    },
    description: schema.description,
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
  });
}

function createObject(
  name: string,
  schema: Schema,
  ctx: RuntimeContext,
): GraphQLObjectType<Resource> {
  switch (schema.type) {
    case "string":
      return createScalarObject(name, stringNode, ctx);
    case "boolean":
      return createScalarObject(name, booleanNode, ctx);
    case "datetime":
      return createScalarObject(name, datetimeNode, ctx);
    case "asset":
      return createScalarObject(name, assetNode, ctx);
    case "markdown":
    case "number":
      return createScalarObject(name, numberNode, ctx);
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
        interfaces: [ctx.base.node],
        fields: {
          id,
          value: {
            type,
            resolve(resource): Node | Promise<Node> {
              const node = resolveResource(resource);

              return resolve(node);
            },
          },
        },
      });
    }
  }
}

interface GrpahqlObjectTypeDefinition<T, U> {
  type: GraphQLObjectType<U>;
  resolve: GraphqlResolve<T, U>;
}

interface GraphqlListDefinition<T, U> {
  type: GraphQLList<GraphQLScalarType<Item<U>> | GraphQLObjectType<Item<U>>>;
  resolve: GraphqlResolve<T, U>;
}

interface GraphqlUnionDefinition<T, U> {
  type: GraphQLUnionType;
  resolve: GraphqlResolve<T, U>;
}

type GraphqlDefinition<T, U = T, Ctx = unknown> =
  | GraphqlScalarDefinition<T, U, Ctx>
  | GrpahqlObjectTypeDefinition<T, U>
  | GraphqlListDefinition<T, U>
  | GraphqlUnionDefinition<T, U>;

type Item<T> = T extends (infer U)[] ? U : never;

const stringNode = {
  type: string.type,
  resolve(node): string {
    assertStringNode(node);

    return node.value;
  },
} satisfies GraphqlScalarDefinition<Node, string>;

const numberNode = {
  type: number.type,
  resolve(node): number {
    assertNumberNode(node);

    return node.value;
  },
} satisfies GraphqlScalarDefinition<Node, number>;

const booleanNode = {
  type: boolean.type,
  resolve(node): boolean {
    assertBooleanNode(node);

    return boolean.resolve(node);
  },
} satisfies GraphqlScalarDefinition<Node, boolean>;

const datetimeNode = {
  type: datetime.type,
  resolve(node): Date {
    assertDatetimeNode(node);

    return datetime.resolve(node);
  },
} satisfies GraphqlScalarDefinition<Node, Date>;

const markdownNode = {
  type: markdown.type,
  resolve(node): string {
    assertMarkdownNode(node);

    return markdown.resolve(node);
  },
} satisfies GraphqlScalarDefinition<Node, string>;

const assetNode = {
  type: asset.type,
  resolve(node): URL {
    assertAssertNode(node);

    return asset.resolve(node);
  },
} satisfies GraphqlScalarDefinition<Node, URL>;

const id = {
  type: GraphQLID,
  resolve(resource): string {
    return resource.id;
  },
} satisfies GraphqlScalarDefinition<Resource, string>;

function resolveResource(resource: Resource): Node {
  return resource.node;
}
