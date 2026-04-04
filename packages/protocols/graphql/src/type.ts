import type { Field, NodeValue } from "@cosmos/core";
import type { GraphQLFieldConfig, GraphQLOutputType } from "graphql";

export interface ResolverContext {
  fetcher: Fetcher;
}

export interface Fetcher {
  fetch(id: string): Promise<Data> | Promise<Data>;
  list(id: string): Promise<string[]> | string[];
}

export type Value = NodeValue["value"];
export type MapValue = {
  [k: string]: Data;
};
export type ListValue = Data[];

export type Data = MapValue | Value | ListValue;

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
