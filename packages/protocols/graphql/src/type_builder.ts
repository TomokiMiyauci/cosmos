import type {
  AssetNode,
  BooleanNode,
  DatetimeNode,
  MapNode,
  MapSchema,
  MarkdonwNode,
  Node,
  NumberNode,
  Schema,
  StringNode,
  UnionSchema,
} from "@cosmos/core";
import type {
  BuilderContext,
  Fetcher,
  GraphqlEntry,
  ResolverContext,
  TypeBuilder,
} from "./type.ts";
import {
  GraphQLBoolean,
  type GraphQLEnumType,
  type GraphQLFieldConfig,
  GraphQLFloat,
  type GraphQLInterfaceType,
  GraphQLList,
  type GraphQLNamedOutputType,
  GraphQLNonNull,
  GraphQLObjectType,
  type GraphQLScalarType,
  GraphQLString,
  GraphQLUnionType,
  isObjectType,
  isUnionType,
} from "graphql";
import { GraphQLDateTime, GraphQLURL } from "graphql-scalars";
import {
  isAssetNode,
  isBooleanNode,
  isDatetimeNode,
  isListNode,
  isMapNode,
  isNumberNode,
  isReferenceNode,
  isStringNode,
} from "./is.ts";
import { mapEntries } from "@std/collections";
import { toRoot, toString } from "@cosmos/codec-markdown";

interface RuntimeContext {
  fetcher: Fetcher;
  map: Map;
}

export class BasicTypeBuilder implements TypeBuilder {
  build(ctx: BuilderContext): GraphqlEntry[] {
    const map: Map = {};
    const context = {
      map,
      fetcher: ctx.datalayer.node,
    } satisfies RuntimeContext;
    const entries = Object.entries(ctx.manifest.schemas).map(
      ([name, schema]) => {
        const type = createRoot(
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

interface GraphqlScalarConfig<In, Out, Ctx>
  extends GraphQLFieldConfig<In, Ctx> {
  type: GraphQLScalarType<Out>;
  resolve: GraphqlResolve<In, Out>;
}

interface GraphqlResolve<In, Out> {
  (value: In): Out;
}

type GraphqlType<T = unknown> =
  | GraphQLScalarType
  | GraphQLObjectType<T>
  | GraphQLInterfaceType
  | GraphQLUnionType
  | GraphQLEnumType
  | GraphQLList<GraphqlType<unknown>>;

interface GraphqlDefinition<In, Out, Ctx>
  extends Pick<GraphQLFieldConfig<In, Ctx>, "type" | "resolve"> {
  type: GraphqlType<Out>;
  resolve: GraphqlResolve<In, Out>;
}

const string = {
  type: GraphQLString,
  resolve(node): string {
    return node.value;
  },
} satisfies GraphqlScalarConfig<StringNode, string, unknown>;

const boolean = {
  type: GraphQLBoolean,
  resolve(node): boolean {
    return node.value;
  },
} satisfies GraphqlScalarConfig<BooleanNode, boolean, unknown>;

const number = {
  type: GraphQLFloat,
  resolve(node): number {
    return node.value;
  },
} satisfies GraphqlScalarConfig<NumberNode, number, unknown>;

const datetime = {
  type: GraphQLDateTime,
  resolve(node): Date {
    return node.value;
  },
} satisfies GraphqlScalarConfig<DatetimeNode, Date, unknown>;

const asset = {
  type: GraphQLURL as GraphQLScalarType<URL>,
  resolve(node): URL {
    return node.value;
  },
} satisfies GraphqlScalarConfig<AssetNode, URL, unknown>;

const markdown = {
  type: GraphQLString,
  resolve(node): string {
    const root = toRoot(node.value);
    const str = toString(root);

    return str;
  },
} satisfies GraphqlScalarConfig<MarkdonwNode, string, unknown>;

type Map = Record<string, GraphQLObjectType<Node>>;

function createReference(
  type: GraphQLNamedOutputType,
  ctx: ResolverContext,
): GraphqlDefinition<Node, Node | Promise<Node>, ResolverContext> {
  return {
    type,
    resolve(node: Node): Promise<Node> | Node {
      if (isReferenceNode(node)) {
        return ctx.fetcher.fetch(node.value);
      }
      throw new Error();
    },
  };
}

type Data =
  | string
  | boolean
  | Date
  | URL
  | number
  | Data[]
  | Node
  | null;

function createList<U>(
  def: GraphqlDefinition<Node, any, U>,
): GraphqlDefinition<Node, unknown[], U> {
  const definition = {
    type: new GraphQLList(def.type),
    resolve(node): unknown[] {
      if (isListNode(node)) {
        return node.value.map((node) => def.resolve(node));
      }
      throw new Error();
    },
  } satisfies GraphqlDefinition<Node, unknown[], U>;

  return definition;
}

function createDefinition(
  name: string,
  schema: Schema,
  ctx: RuntimeContext,
): GraphqlDefinition<Node, any, ResolverContext> {
  switch (schema.type) {
    case "string": {
      return {
        type: string.type,
        resolve(node): string {
          if (isStringNode(node)) {
            return string.resolve(node);
          }

          throw new Error();
        },
      };
    }
    case "number": {
      return {
        type: number.type,
        resolve(node): number {
          if (isNumberNode(node)) {
            return number.resolve(node);
          }
          throw new Error();
        },
      };
    }
    case "boolean": {
      return {
        type: boolean.type,
        resolve(node): boolean {
          if (isBooleanNode(node)) {
            return boolean.resolve(node);
          }
          throw new Error();
        },
      };
    }
    case "asset": {
      return {
        type: asset.type,
        resolve(node): URL {
          if (isAssetNode(node)) {
            return asset.resolve(node);
          }
          throw new Error();
        },
      };
    }
    case "datetime": {
      return {
        type: datetime.type,
        resolve(node): Date {
          if (isDatetimeNode(node)) {
            return datetime.resolve(node);
          }
          throw new Error();
        },
      };
    }

    case "reference": {
      const outputType = ctx.map[schema.model];

      if (!outputType) throw new Error();

      return createReference(outputType, ctx);
    }
    case "list": {
      const child = createDefinition(name, schema.item, ctx);

      return createList(child);
    }
    case "map": {
      return createMap(name, schema, ctx);
    }
    case "instance": {
      const outputType = ctx.map[schema.model];

      if (!outputType) throw new Error();

      return createInstance(outputType);
    }
    case "union": {
      return createUnion(name, schema, ctx);
    }
    case "markdown": {
      return {
        type: markdown.type,
        resolve(node): string {
          if (node.type === "markdown") {
            return markdown.resolve(node);
          }

          throw new Error();
        },
      };
    }
  }
}

function createUnion(
  name: string,
  schema: UnionSchema,
  ctx: RuntimeContext,
): GraphqlDefinition<Node, Node, ResolverContext> {
  const map = mapEntries(
    schema.props,
    ([key, schema]) => [key, createRoot(scope(name, key), schema, ctx)],
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
      description: schema.description,
    }),
    resolve(node): Node {
      if (node.type === "union") {
        const value = node.value;
        weakMap.set(value, node.key);

        return value;
      }

      throw new Error();
    },
  };
}

function createInstance(
  type: GraphQLNamedOutputType,
): GraphqlDefinition<Node, Node, ResolverContext> {
  return {
    type,
    resolve(node): Node {
      return node;
    },
  };
}

function createMap(
  name: string,
  schema: MapSchema,
  ctx: RuntimeContext,
): GraphqlDefinition<Node, Node, ResolverContext> {
  const type = new GraphQLObjectType({
    name,
    fields: () => {
      const required = new Set(schema.required);
      const fields = mapEntries(schema.props, ([key, schema]) => {
        const { type, resolve } = createDefinition(
          scope(name, key),
          schema,
          ctx,
        );

        const def = {
          type,
          resolve(node): Data {
            if (isMapNode(node)) {
              const child = node.value[key];

              if (!child) return null;

              return resolve(child);
            }
            throw new Error();
          },
        } satisfies GraphqlDefinition<Node, Data, ResolverContext>;

        const field = {
          ...def,
          type: required.has(key) ? new GraphQLNonNull(def.type) : def.type,
          description: schema.description,
        } satisfies GraphQLFieldConfig<Node, ResolverContext>;

        return [key, field] as const;
      });

      return fields;
    },
    description: schema.description,
  });

  return {
    type,
    resolve(node): MapNode {
      if (isMapNode(node)) {
        return node;
      }

      throw new Error();
    },
  };
}

function scope(...scopes: string[]): string {
  return scopes.join("_");
}

export function createRoot(
  name: string,
  schema: Schema,
  ctx: RuntimeContext,
): GraphQLObjectType<Node> {
  const def = createDefinition(name, schema, ctx);

  if (isObjectType(def.type)) {
    return def.type;
  }

  const scopedName = isUnionType(def.type) ? scope(name, "value") : name;

  return new GraphQLObjectType<Node>({
    name: scopedName,
    fields: {
      value: {
        type: def.type,
        resolve: def.resolve,
      },
    },
    description: schema.description,
  });
}
