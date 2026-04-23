import type { Datalayer, Manifest, Node, Schema } from "@cosmos/core";
import type { GraphQLFieldConfig, GraphQLObjectType } from "graphql";

export interface ResolverContext {
  fetcher: Fetcher;
}

export interface Resource {
  id: string;
  node: Node;
}

export interface Fetcher {
  fetch(id: string): Promise<Node> | Node;
  list(id: string): Promise<string[]> | string[];
}

export interface QueryContext {
  entries: GraphqlEntry[];
  types: GraphqlEntry[];
}

export interface GraphqlEntry {
  type: GraphQLObjectType<Resource>;
  schema: Schema;
}

export interface GraphQLQueryField {
  name: string;
  type: GraphQLFieldConfig<unknown, ResolverContext>;
}

export interface SchemaPlugin {
  name: string;
  provideQuery(ctx: QueryContext): GraphQLQueryField[];
}

export interface Namer {
  field(name: string): string;
  type(name: string): string;
}

export interface TypeBuilder {
  build(ctx: BuilderContext): GraphqlEntry[];
}

export interface BuilderContext {
  manifest: Manifest;
  datalayer: Datalayer;
}
