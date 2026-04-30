import {
  type GraphQLFieldConfig,
  GraphQLObjectType,
  type GraphQLObjectTypeConfig,
  GraphQLSchema,
  isObjectType,
  type ThunkObjMap,
} from "graphql";
import type {
  BuilderContext,
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

export interface SchemaConfig {
  plugins: Plugin[];
  builder?: TypeBuilder;
}

export class SchemaBuilder {
  #builder: TypeBuilder;

  constructor(private config: SchemaConfig) {
    this.#builder = config.builder ?? new CoreTypeBuilder();
  }

  build(ctx: BuilderContext): GraphQLSchema {
    const entries = this.#builder.build(ctx);

    const transformers = this.config.plugins.map((plugin) =>
      plugin.transform?.bind(plugin)
    ).filter((v) => !!v);
    const prividers = this.config.plugins.map((plugin) =>
      plugin.provideQuery?.bind(plugin)
    ).filter((v) => !!v);

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

    const query = new GraphQLObjectType({ name: "Query", fields });
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
