import {
  type GraphQLFieldConfig,
  GraphQLObjectType,
  type GraphQLObjectTypeConfig,
  GraphQLSchema,
  type ThunkObjMap,
} from "graphql";
import type {
  BuilderContext,
  GraphqlNamedOutputType,
  Namer,
  Plugin,
  ResolverContext,
  Resource,
  TypeBuilder,
} from "./type.ts";
import { isNamedOutputType, overrideName } from "./util.ts";
import { StandardNamer } from "./namers/standard.ts";
import { BasicTypeBuilder } from "./builder/type_builder.ts";
import { rewireTypes } from "@graphql-tools/utils";
import { mapValues } from "@std/collections/map-values";

export interface SchemaConfig {
  plugins: Plugin[];
  builder?: TypeBuilder;
  namer?: Namer;
}

export class SchemaBuilder {
  #namer: Namer;
  #builder: TypeBuilder;

  constructor(private config: SchemaConfig) {
    this.#builder = config.builder ?? new BasicTypeBuilder();
    this.#namer = config.namer ?? new StandardNamer();
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
      provider({ entries: transformed })
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
    const finalSchema = overrideName(this.#namer, schema);

    return finalSchema;
  }
}

function applyTransform(
  entreis: GraphQLObjectType<Resource>[],
  transformers: ((
    config: GraphQLObjectTypeConfig<Resource, unknown>,
  ) => GraphQLObjectTypeConfig<Resource, unknown>)[],
): GraphqlNamedOutputType[] {
  const record = entreis.reduce(
    (acc, entry) => {
      acc[entry.name] = entry;

      return acc;
    },
    {} as Record<string, GraphQLObjectType<Resource>>,
  );

  const map = mapValues(record, (type) => {
    const config = type.toConfig();

    const transformed = transformers.reduce<
      GraphQLObjectTypeConfig<Resource, unknown>
    >((acc, transformer) => {
      return transformer(acc);
    }, config);

    return new GraphQLObjectType(transformed);
  });

  const { typeMap } = rewireTypes(map, []);

  return Object.values(typeMap).filter(isNamedOutputType);
}
