import {
  assertValidSchema,
  type GraphQLFieldConfig,
  GraphQLObjectType,
  type GraphQLObjectTypeConfig,
  GraphQLSchema,
  isObjectType,
  type ThunkObjMap,
} from "graphql";
import type {
  BuildContext,
  Builder,
  Entry,
  GraphqlNamedOutputType,
  Plugin,
  ResolverContext,
  TypeBuilder,
} from "./type.ts";
import { isNamedOutputType } from "./util.ts";
import { CoreTypeBuilder } from "./builder/type_builder.ts";
import { rewireTypes } from "@graphql-tools/utils";
import { mapValues } from "@std/collections/map-values";
import {
  type Plugin as TransformPlugin,
  SchemaTransformer,
} from "@miyauci/graphql-transformer";

export interface SchemaConfig {
  plugins: Plugin[];
  builder?: TypeBuilder;
}

export class QueryBuilder {
  #builder: TypeBuilder;

  constructor(private config: SchemaConfig) {
    this.#builder = config.builder ?? new CoreTypeBuilder();
  }

  build(ctx: BuildContext): GraphQLSchema {
    const entries = this.#builder.build(ctx);

    const transformers = this.config.plugins.map((plugin) =>
      plugin.transform?.bind(plugin)
    ).filter(isTruthy);
    const prividers = this.config.plugins.map((plugin) =>
      plugin.provideQuery?.bind(plugin)
    ).filter(isTruthy);
    const queries = this.config.plugins.map((plugin) =>
      plugin.query?.bind(plugin)
    ).filter(isTruthy);

    const transformed = applyTransform(entries, transformers);

    const queryFields = prividers.map((provider) =>
      provider({ entries: transformed, resources: ctx.manifest.resources })
    )
      .flat();

    const fields = queryFields.reduce<
      ThunkObjMap<GraphQLFieldConfig<unknown, ResolverContext>>
    >((acc, field) => {
      return {
        ...acc,
        [field.name]: field.type,
      };
    }, {});
    const baseQueryConfig = {
      name: "Query",
      fields,
    } satisfies GraphQLObjectTypeConfig<unknown, ResolverContext>;

    const queryConfig = queries.reduce((acc, fn) => fn(acc), baseQueryConfig);
    const query = new GraphQLObjectType(queryConfig);
    const schema = new GraphQLSchema({ query });

    return schema;
  }
}

function applyTransform(
  entreis: GraphqlNamedOutputType[],
  transformers: ((
    config: GraphQLObjectTypeConfig<Entry, unknown>,
  ) => GraphQLObjectTypeConfig<Entry, unknown>)[],
): Record<string, GraphqlNamedOutputType> {
  const record = entreis.reduce<Record<string, GraphqlNamedOutputType>>(
    (acc, entry) => {
      acc[entry.name] = entry;

      return acc;
    },
    {},
  );

  const map = mapValues(record, (type) => {
    if (isObjectType(type)) {
      const config = type.toConfig();

      const transformed = transformers.reduce<
        GraphQLObjectTypeConfig<Entry, unknown>
      >((acc, transformer) => {
        return transformer(acc);
      }, config);

      return new GraphQLObjectType(transformed);
    }

    return type;
  });

  const { typeMap } = rewireTypes(map, []);

  const entries = Object.values(typeMap).filter(isNamedOutputType).map((type) =>
    [type.name, type] as const
  );

  return Object.fromEntries(entries);
}

export interface BuilderOptions {
  plugins?: Plugin[];
  transformers?: TransformPlugin[];
}

export class SchemaBuilder implements Builder {
  #builder: QueryBuilder;
  #transformer: SchemaTransformer;
  constructor(private options: BuilderOptions) {
    this.#builder = new QueryBuilder({
      plugins: this.options.plugins ?? [],
    });
    this.#transformer = new SchemaTransformer({
      plugins: this.options.transformers ?? [],
    });
  }

  build(ctx: BuildContext): GraphQLSchema {
    const schema = this.#builder.build({
      manifest: ctx.manifest,
      datalayer: ctx.datalayer,
    });
    const finalSchema = this.#transformer.transform(schema);

    assertValidSchema(finalSchema);

    return finalSchema;
  }
}

function isTruthy<T>(value: T): value is NonNullable<T> {
  return !!value;
}
