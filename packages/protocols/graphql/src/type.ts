import type { Datalayer, Manifest, Node, Resource, Schema } from "@cosmos/core";
import type {
  GraphQLEnumType,
  GraphQLFieldConfig,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLUnionType,
} from "graphql";

export interface ResolverContext {
  fetcher: Fetcher;
}

export interface Entry {
  id: string;
  node: Node;
}

export interface TypeEntry {
  type: GraphqlNamedOutputType;
  schema: Schema;
}

export interface Fetcher {
  fetch(id: string): Promise<Node> | Node;
  list(id: string): Promise<string[]> | string[];
}

export interface QueryContext {
  types: Record<string, TypeEntry>;
  resources: Record<string, Resource>;
}

export interface GraphQLQueryField {
  name: string;
  type: GraphQLFieldConfig<unknown, ResolverContext>;
}

export interface TypeBuilder {
  build(ctx: BuildContext): Record<string, TypeEntry>;
}

export interface QueryMap {
  [k: string]: GraphQLFieldConfig<unknown, ResolverContext>;
}

export interface Plugin {
  transform?(
    config: GraphQLObjectTypeConfig<Entry, unknown>,
  ): GraphQLObjectTypeConfig<Entry, unknown>;
  provideQuery?(ctx: QueryContext): QueryMap;
  query?(
    config: GraphQLObjectTypeConfig<unknown, ResolverContext>,
  ): GraphQLObjectTypeConfig<unknown, unknown>;
}

export type GraphqlNamedOutputType =
  | GraphQLScalarType
  | GraphQLObjectType<Entry>
  | GraphQLInterfaceType
  | GraphQLUnionType
  | GraphQLEnumType;

export interface BuildContext {
  manifest: Manifest;
  datalayer: Datalayer;
}

export interface Builder {
  build(ctx: BuildContext): GraphQLSchema;
}
