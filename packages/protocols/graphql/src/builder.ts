import {
  type GraphQLFieldConfig,
  GraphQLObjectType,
  GraphQLSchema,
  type ThunkObjMap,
} from "graphql";
import type {
  BuilderContext,
  Namer,
  ResolverContext,
  SchemaPlugin,
  TypeBuilder,
} from "./type.ts";
import { overrideName } from "./util.ts";
import { StandardNamer } from "./namers/standard.ts";
import { BasicTypeBuilder } from "./type_builder.ts";

export interface SchemaConfig {
  plugins: SchemaPlugin[];
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
    const types = this.#builder.build(ctx);
    const name = new Set(ctx.manifest.resources);
    const entries = types.filter(({ type }) => name.has(type.name));

    const queryFields = this.config.plugins
      .map((registry) => {
        return registry.provideQuery({ types, entries });
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
