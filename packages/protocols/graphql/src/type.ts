import type { Datalayer, Field } from "@cosmos/core";
import type { GraphQLFieldConfig, GraphQLOutputType } from "graphql";

export interface ResolverContext {
  fetcher: Datalayer;
}

export interface QueryContext extends ResolverContext {
  entries: GraphqlEntry[];
}

export interface GraphqlEntry {
  type: GraphQLOutputType;
  definition: Field;
}

export interface GraphQLQueryField {
  name: string;
  type: GraphQLFieldConfig<unknown, unknown>;
}

export interface SchemaPlugin {
  name: string;
  provideQuery(ctx: QueryContext): GraphQLQueryField[];
}

export interface Namer {
  field(name: string): string;
  type(name: string): string;
}
