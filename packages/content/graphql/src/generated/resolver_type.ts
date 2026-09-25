import type { Node } from '@cosmos/schema-node';
import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import type { ModelView, EntryView, SchemaView, StringSchemaView, NumberSchemaView, BooleanSchemaView, ListSchemaView, MapSchemaView, UnionSchemaView, ReferenceSchemaView } from '@cosmos/content';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: Date; output: Date; }
  EntryContent: { input: Node; output: Node; }
};

export type BooleanSchema = {
  __typename: 'BooleanSchema';
  id: Scalars['ID']['output'];
};

export type CreateEntryInput = {
  content: Scalars['EntryContent']['input'];
  model: Scalars['ID']['input'];
};

export type CreateEntryResult = CreateEntrySuccess;

export type CreateEntrySuccess = {
  __typename: 'CreateEntrySuccess';
  id: Scalars['ID']['output'];
};

export type Entry = {
  __typename: 'Entry';
  content: Scalars['EntryContent']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  model: Model;
  updatedAt: Scalars['DateTime']['output'];
};

export type MapSchema = {
  __typename: 'MapSchema';
  id: Scalars['ID']['output'];
  properties: Array<Property>;
  required: Array<Scalars['String']['output']>;
};

export type Model = {
  __typename: 'Model';
  id: Scalars['ID']['output'];
  schema: Schema;
};

export type Mutation = {
  __typename: 'Mutation';
  createEntry: CreateEntryResult;
  deleteEntry: Scalars['Boolean']['output'];
  updateEntry: Scalars['Boolean']['output'];
};


export type MutationCreateEntryArgs = {
  input: CreateEntryInput;
};


export type MutationDeleteEntryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateEntryArgs = {
  input: UpdateEntryInput;
};

export type NumberSchema = {
  __typename: 'NumberSchema';
  id: Scalars['ID']['output'];
};

export type Property = {
  __typename: 'Property';
  key: Scalars['String']['output'];
  value: Scalars['ID']['output'];
};

export type Query = {
  __typename: 'Query';
  entries: Array<Entry>;
  entry?: Maybe<Entry>;
  model?: Maybe<Model>;
  models: Array<Model>;
  schema?: Maybe<Schema>;
  schemas: Array<Schema>;
};


export type QueryEntriesArgs = {
  model?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryEntryArgs = {
  id: Scalars['ID']['input'];
};


export type QueryModelArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySchemaArgs = {
  id: Scalars['ID']['input'];
};

export type ReferenceSchema = {
  __typename: 'ReferenceSchema';
  id: Scalars['ID']['output'];
};

export type Schema = BooleanSchema | MapSchema | NumberSchema | ReferenceSchema | SequenseSchema | StringSchema | UnionSchema;

export type SequenseSchema = {
  __typename: 'SequenseSchema';
  id: Scalars['ID']['output'];
  item: Scalars['ID']['output'];
};

export type StringSchema = {
  __typename: 'StringSchema';
  id: Scalars['ID']['output'];
  term?: Maybe<Term>;
};

export type Term =
  | 'DATE'
  | 'DATETIME';

export type UnionSchema = {
  __typename: 'UnionSchema';
  id: Scalars['ID']['output'];
  schemas: Array<Scalars['String']['output']>;
};

export type UpdateEntryInput = {
  content: Scalars['EntryContent']['input'];
  id: Scalars['ID']['input'];
  model: Scalars['ID']['input'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping of union types */
export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
  CreateEntryResult: ( CreateEntrySuccess );
  Schema:
    | ( BooleanSchemaView )
    | ( MapSchemaView )
    | ( NumberSchemaView )
    | ( ReferenceSchemaView )
    | ( ListSchemaView )
    | ( StringSchemaView )
    | ( UnionSchemaView )
  ;
};


/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  BooleanSchema: ResolverTypeWrapper<BooleanSchemaView>;
  CreateEntryInput: CreateEntryInput;
  CreateEntryResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['CreateEntryResult']>;
  CreateEntrySuccess: ResolverTypeWrapper<CreateEntrySuccess>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  Entry: ResolverTypeWrapper<EntryView>;
  EntryContent: ResolverTypeWrapper<Scalars['EntryContent']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  MapSchema: ResolverTypeWrapper<MapSchemaView>;
  Model: ResolverTypeWrapper<ModelView>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  NumberSchema: ResolverTypeWrapper<NumberSchemaView>;
  Property: ResolverTypeWrapper<Property>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  ReferenceSchema: ResolverTypeWrapper<ReferenceSchemaView>;
  Schema: ResolverTypeWrapper<SchemaView>;
  SequenseSchema: ResolverTypeWrapper<ListSchemaView>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  StringSchema: ResolverTypeWrapper<StringSchemaView>;
  Term: Term;
  UnionSchema: ResolverTypeWrapper<UnionSchemaView>;
  UpdateEntryInput: UpdateEntryInput;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  BooleanSchema: BooleanSchemaView;
  CreateEntryInput: CreateEntryInput;
  CreateEntryResult: ResolversUnionTypes<ResolversParentTypes>['CreateEntryResult'];
  CreateEntrySuccess: CreateEntrySuccess;
  DateTime: Scalars['DateTime']['output'];
  Entry: EntryView;
  EntryContent: Scalars['EntryContent']['output'];
  ID: Scalars['ID']['output'];
  MapSchema: MapSchemaView;
  Model: ModelView;
  Mutation: Record<PropertyKey, never>;
  NumberSchema: NumberSchemaView;
  Property: Property;
  Query: Record<PropertyKey, never>;
  ReferenceSchema: ReferenceSchemaView;
  Schema: SchemaView;
  SequenseSchema: ListSchemaView;
  String: Scalars['String']['output'];
  StringSchema: StringSchemaView;
  UnionSchema: UnionSchemaView;
  UpdateEntryInput: UpdateEntryInput;
};

export type BooleanSchemaResolvers<ContextType = any, ParentType extends ResolversParentTypes['BooleanSchema'] = ResolversParentTypes['BooleanSchema']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateEntryResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateEntryResult'] = ResolversParentTypes['CreateEntryResult']> = {
  __resolveType: TypeResolveFn<'CreateEntrySuccess', ParentType, ContextType>;
};

export type CreateEntrySuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateEntrySuccess'] = ResolversParentTypes['CreateEntrySuccess']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type EntryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Entry'] = ResolversParentTypes['Entry']> = {
  content?: Resolver<ResolversTypes['EntryContent'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  model?: Resolver<ResolversTypes['Model'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
};

export interface EntryContentScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['EntryContent'], any> {
  name: 'EntryContent';
}

export type MapSchemaResolvers<ContextType = any, ParentType extends ResolversParentTypes['MapSchema'] = ResolversParentTypes['MapSchema']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  properties?: Resolver<Array<ResolversTypes['Property']>, ParentType, ContextType>;
  required?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ModelResolvers<ContextType = any, ParentType extends ResolversParentTypes['Model'] = ResolversParentTypes['Model']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  schema?: Resolver<ResolversTypes['Schema'], ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createEntry?: Resolver<ResolversTypes['CreateEntryResult'], ParentType, ContextType, RequireFields<MutationCreateEntryArgs, 'input'>>;
  deleteEntry?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteEntryArgs, 'id'>>;
  updateEntry?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationUpdateEntryArgs, 'input'>>;
};

export type NumberSchemaResolvers<ContextType = any, ParentType extends ResolversParentTypes['NumberSchema'] = ResolversParentTypes['NumberSchema']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PropertyResolvers<ContextType = any, ParentType extends ResolversParentTypes['Property'] = ResolversParentTypes['Property']> = {
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  entries?: Resolver<Array<ResolversTypes['Entry']>, ParentType, ContextType, Partial<QueryEntriesArgs>>;
  entry?: Resolver<Maybe<ResolversTypes['Entry']>, ParentType, ContextType, RequireFields<QueryEntryArgs, 'id'>>;
  model?: Resolver<Maybe<ResolversTypes['Model']>, ParentType, ContextType, RequireFields<QueryModelArgs, 'id'>>;
  models?: Resolver<Array<ResolversTypes['Model']>, ParentType, ContextType>;
  schema?: Resolver<Maybe<ResolversTypes['Schema']>, ParentType, ContextType, RequireFields<QuerySchemaArgs, 'id'>>;
  schemas?: Resolver<Array<ResolversTypes['Schema']>, ParentType, ContextType>;
};

export type ReferenceSchemaResolvers<ContextType = any, ParentType extends ResolversParentTypes['ReferenceSchema'] = ResolversParentTypes['ReferenceSchema']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SchemaResolvers<ContextType = any, ParentType extends ResolversParentTypes['Schema'] = ResolversParentTypes['Schema']> = {
  __resolveType: TypeResolveFn<'BooleanSchema' | 'MapSchema' | 'NumberSchema' | 'ReferenceSchema' | 'SequenseSchema' | 'StringSchema' | 'UnionSchema', ParentType, ContextType>;
};

export type SequenseSchemaResolvers<ContextType = any, ParentType extends ResolversParentTypes['SequenseSchema'] = ResolversParentTypes['SequenseSchema']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  item?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StringSchemaResolvers<ContextType = any, ParentType extends ResolversParentTypes['StringSchema'] = ResolversParentTypes['StringSchema']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  term?: Resolver<Maybe<ResolversTypes['Term']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UnionSchemaResolvers<ContextType = any, ParentType extends ResolversParentTypes['UnionSchema'] = ResolversParentTypes['UnionSchema']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  schemas?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  BooleanSchema?: BooleanSchemaResolvers<ContextType>;
  CreateEntryResult?: CreateEntryResultResolvers<ContextType>;
  CreateEntrySuccess?: CreateEntrySuccessResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Entry?: EntryResolvers<ContextType>;
  EntryContent?: GraphQLScalarType;
  MapSchema?: MapSchemaResolvers<ContextType>;
  Model?: ModelResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  NumberSchema?: NumberSchemaResolvers<ContextType>;
  Property?: PropertyResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  ReferenceSchema?: ReferenceSchemaResolvers<ContextType>;
  Schema?: SchemaResolvers<ContextType>;
  SequenseSchema?: SequenseSchemaResolvers<ContextType>;
  StringSchema?: StringSchemaResolvers<ContextType>;
  UnionSchema?: UnionSchemaResolvers<ContextType>;
};

