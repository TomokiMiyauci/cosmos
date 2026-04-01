import type { Datalayer, Definition } from "@cosmos/core";
import type { GraphQLFieldConfig, GraphQLObjectType } from "graphql";

export interface QueryContext {
  fetcher: Datalayer;
  entries: GraphqlEntry[];
}

export interface GraphqlEntry {
  type: GraphQLObjectType;
  definition: Definition;
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
