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
import { BasicTypeBuilder } from "./builder/type_builder.ts";

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
    const entries = this.#builder.build(ctx);

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
