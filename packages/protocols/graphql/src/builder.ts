import type {
  AssetNode,
  BooleanNode,
  DatetimeNode,
  Manifest,
  MapNode,
  MapSchema,
  Node,
  NumberNode,
  Schema,
  StringNode,
} from "@cosmos/core";
import {
  GraphQLBoolean,
  type GraphQLFieldConfig,
  type GraphQLFieldResolver,
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  type GraphQLOutputType,
  type GraphQLScalarType,
  GraphQLSchema,
  GraphQLString,
  type ThunkObjMap,
} from "graphql";
import type {
  Fetcher,
  GraphqlEntry,
  Namer,
  ResolverContext,
  SchemaPlugin,
} from "./type.ts";
import { GraphQLDateTime, GraphQLURL } from "graphql-scalars";
import { overrideName } from "./util.ts";
import { StandardNamer } from "./namers/standard.ts";
import { mapEntries } from "@std/collections";
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

export interface SchemaConfig {
  plugins: SchemaPlugin[];
  namer?: Namer;
}

export interface BuilderContext {
  manifest: Manifest;
  fetcher: Fetcher;
}

export class SchemaBuilder {
  #namer: Namer;
  constructor(private config: SchemaConfig) {
    this.#namer = config.namer ?? new StandardNamer();
  }

  build(ctx: BuilderContext): GraphQLSchema {
    const map: Record<string, GraphQLOutputType> = {};
    const entries = Object.entries(ctx.manifest.schemas).map(
      ([name, schema]) => {
        const field = createDefinition(
          name,
          schema,
          map,
        );

        map[name] = field.type;

        return {
          type: field.type,
          definition: schema,
        } satisfies GraphqlEntry;
      },
    );

    const queryFields = this.config.plugins
      .map((registry) => {
        return registry.provideQuery({ entries });
      })
      .flat();

    const fields = queryFields.reduce<
      ThunkObjMap<GraphQLFieldConfig<unknown, ResolverContext>>
    >((acc, field) => {
      return {
        ...acc,
        [field.name]: field.type,
      };
    }, {});

    const query = new GraphQLObjectType({ name: "Query", fields });
    const schema = new GraphQLSchema({ query });
    const finalSchema = overrideName(this.#namer, schema);

    return finalSchema;
  }
}

interface GraphqlScalarConfig<In, Out, Ctx>
  extends GraphQLFieldConfig<In, Ctx> {
  type: GraphQLScalarType<Out>;
  resolve: GraphQLFieldResolver<In, Ctx, unknown, Out>;
}

interface GraphqlDefinition<In, Out, Ctx>
  extends Pick<GraphQLFieldConfig<In, Ctx>, "type" | "resolve"> {
  type: GraphQLScalarType<Out> | GraphQLOutputType;
  resolve: GraphQLFieldResolver<In, Ctx, unknown, Out>;
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

type Map = Record<string, GraphQLOutputType>;

function createReference(
  type: GraphQLOutputType,
): GraphqlDefinition<Node, Node | Promise<Node>, ResolverContext> {
  return {
    type,
    resolve(node: Node, _, context: ResolverContext): Promise<Node> | Node {
      if (isReferenceNode(node)) {
        return context.fetcher.fetch(node.value);
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
  | Promise<Node>
  | Node;

function createList<T, U>(
  def: GraphqlDefinition<Node, T, U>,
): GraphqlDefinition<Node, T[], U> {
  const definition = {
    type: new GraphQLList(def.type),
    resolve(node: Node, args, context, info): T[] {
      if (isListNode(node)) {
        return node.value.map((node) => def.resolve(node, args, context, info));
      }
      throw new Error();
    },
  } satisfies GraphqlDefinition<Node, T[], U>;

  return definition;
}

function createDefinition(
  name: string,
  schema: Schema,
  map: Map,
): GraphqlDefinition<Node, Data, ResolverContext> {
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
      return createReference(map[schema.model]);
    }
    case "list": {
      const child = createDefinition(name, schema.item, map);

      return createList(child);
    }
    case "map": {
      return createMap(name, schema, map);
    }
    case "instance": {
      return createInstance(map[schema.model]);
    }
  }
}

function createInstance(
  type: GraphQLOutputType,
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
  map: Map,
): GraphqlDefinition<Node, Data, ResolverContext> {
  const type = new GraphQLObjectType({
    name,
    fields: () => {
      const required = new Set(schema.required);
      const fields = mapEntries(schema.props, ([key, schema]) => {
        const { type, resolve } = createDefinition(key, schema, map);

        const def = {
          type,
          resolve(node, args, context, info): Data | null {
            if (isMapNode(node)) {
              const child = node.value[key];

              if (!child) return null;

              return resolve(child, args, context, info);
            }
            throw new Error();
          },
        } satisfies GraphqlDefinition<Node, Data | null, ResolverContext>;

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
