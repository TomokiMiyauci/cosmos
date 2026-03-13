import type { Fetcher } from "@cosmos/core";
import type { GraphQLFieldConfig, GraphQLObjectType } from "graphql";

export interface QueryFeature {
  feature: "query";
  provide: QueryProvider;
}

export interface QueryProvider {
  (ctx: QueryContext): GraphQLQueryField[];
}

export interface QueryContext {
  fetcher: Fetcher;
  entries: GraphEntry[];
}

export interface GraphEntry {
  type: GraphQLObjectType;
  sources: string[];
}

export interface GraphQLQueryField {
  name: string;
  field: GraphQLFieldConfig<unknown, unknown>;
}

export interface SchemaPlugin {
  name: string;
  provideQuery(ctx: QueryContext): GraphQLQueryField[];
}
