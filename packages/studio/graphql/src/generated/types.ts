/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { Node } from '@cosmos/schema-node';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export const Term = {
  Date: 'DATE',
  Datetime: 'DATETIME'
} as const;

export type Term = typeof Term[keyof typeof Term];
export type GetEntryQuery_entry_model = { __typename: 'Model', id: string };

export type GetEntryQuery_entry = { __typename: 'Entry', id: string, content: Node, model: GetEntryQuery_entry_model };

export type GetEntryQuery = { __typename: 'Query', entry: GetEntryQuery_entry | null };


export type GetEntryQueryVariables = Exact<{
  id: string | number;
}>;

export type GetSummaryEntryQuery_entries = { __typename: 'Entry', id: string, updatedAt: string, title: string };

export type GetSummaryEntryQuery = { __typename: 'Query', entries: Array<GetSummaryEntryQuery_entries> };


export type GetSummaryEntryQueryVariables = Exact<{
  model?: string | number | null | undefined;
}>;

export type GetModelsQuery_models = { __typename: 'Model', id: string };

export type GetModelsQuery = { __typename: 'Query', models: Array<GetModelsQuery_models> };


export type GetModelsQueryVariables = Exact<{ [key: string]: never; }>;

export type GetSchemaQuery_model_schema_MapSchema_properties = { __typename: 'Property', key: string, value: string };

export type GetSchemaQuery_model_schema_BooleanSchema = { __typename: 'BooleanSchema', id: string };

export type GetSchemaQuery_model_schema_MapSchema = { __typename: 'MapSchema', id: string, required: Array<string>, properties: Array<GetSchemaQuery_model_schema_MapSchema_properties> };

export type GetSchemaQuery_model_schema_NumberSchema = { __typename: 'NumberSchema', id: string };

export type GetSchemaQuery_model_schema_ReferenceSchema = { __typename: 'ReferenceSchema', id: string };

export type GetSchemaQuery_model_schema_SequenseSchema = { __typename: 'SequenseSchema', id: string, item: string };

export type GetSchemaQuery_model_schema_StringSchema = { __typename: 'StringSchema', id: string, term: Term | null };

export type GetSchemaQuery_model_schema_UnionSchema = { __typename: 'UnionSchema', id: string, schemas: Array<string> };

export type GetSchemaQuery_model_schema =
  | GetSchemaQuery_model_schema_BooleanSchema
  | GetSchemaQuery_model_schema_MapSchema
  | GetSchemaQuery_model_schema_NumberSchema
  | GetSchemaQuery_model_schema_ReferenceSchema
  | GetSchemaQuery_model_schema_SequenseSchema
  | GetSchemaQuery_model_schema_StringSchema
  | GetSchemaQuery_model_schema_UnionSchema
;

export type GetSchemaQuery_model = { __typename: 'Model', id: string, schema: GetSchemaQuery_model_schema };

export type GetSchemaQuery_schemas_MapSchema_properties = { __typename: 'Property', key: string, value: string };

export type GetSchemaQuery_schemas_BooleanSchema = { __typename: 'BooleanSchema', id: string };

export type GetSchemaQuery_schemas_MapSchema = { __typename: 'MapSchema', id: string, required: Array<string>, properties: Array<GetSchemaQuery_schemas_MapSchema_properties> };

export type GetSchemaQuery_schemas_NumberSchema = { __typename: 'NumberSchema', id: string };

export type GetSchemaQuery_schemas_ReferenceSchema = { __typename: 'ReferenceSchema', id: string };

export type GetSchemaQuery_schemas_SequenseSchema = { __typename: 'SequenseSchema', id: string, item: string };

export type GetSchemaQuery_schemas_StringSchema = { __typename: 'StringSchema', id: string, term: Term | null };

export type GetSchemaQuery_schemas_UnionSchema = { __typename: 'UnionSchema', id: string, schemas: Array<string> };

export type GetSchemaQuery_schemas =
  | GetSchemaQuery_schemas_BooleanSchema
  | GetSchemaQuery_schemas_MapSchema
  | GetSchemaQuery_schemas_NumberSchema
  | GetSchemaQuery_schemas_ReferenceSchema
  | GetSchemaQuery_schemas_SequenseSchema
  | GetSchemaQuery_schemas_StringSchema
  | GetSchemaQuery_schemas_UnionSchema
;

export type GetSchemaQuery = { __typename: 'Query', model: GetSchemaQuery_model | null, schemas: Array<GetSchemaQuery_schemas> };


export type GetSchemaQueryVariables = Exact<{
  modelId: string | number;
}>;

export type DeleteEntryMutation = { __typename: 'Mutation', deleteEntry: boolean };


export type DeleteEntryMutationVariables = Exact<{
  id: string | number;
}>;

export type CreateEntryMutation_createEntry = { __typename: 'CreateEntrySuccess', id: string };

export type CreateEntryMutation = { __typename: 'Mutation', createEntry: CreateEntryMutation_createEntry };


export type CreateEntryMutationVariables = Exact<{
  modelId: string | number;
  content: Node;
}>;

export type UpdateEntryMutation = { __typename: 'Mutation', updateEntry: boolean };


export type UpdateEntryMutationVariables = Exact<{
  id: string | number;
  modelId: string | number;
  content: Node;
}>;


export const GetEntryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetEntry"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"entry"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"model"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}}]}}]} as unknown as DocumentNode<GetEntryQuery, GetEntryQueryVariables>;
export const GetSummaryEntryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSummaryEntry"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"model"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"entries"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"model"},"value":{"kind":"Variable","name":{"kind":"Name","value":"model"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetSummaryEntryQuery, GetSummaryEntryQueryVariables>;
export const GetModelsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetModels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"models"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<GetModelsQuery, GetModelsQueryVariables>;
export const GetSchemaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSchema"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"modelId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"model"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"modelId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"schema"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StringSchema"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"term"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NumberSchema"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BooleanSchema"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SequenseSchema"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"item"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MapSchema"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"required"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ReferenceSchema"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UnionSchema"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"schemas"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"schemas"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StringSchema"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"term"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NumberSchema"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BooleanSchema"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SequenseSchema"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"item"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MapSchema"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"required"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ReferenceSchema"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UnionSchema"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"schemas"}}]}}]}}]}}]} as unknown as DocumentNode<GetSchemaQuery, GetSchemaQueryVariables>;
export const DeleteEntryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteEntry"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteEntry"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteEntryMutation, DeleteEntryMutationVariables>;
export const CreateEntryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateEntry"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"modelId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"content"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EntryContent"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createEntry"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"model"},"value":{"kind":"Variable","name":{"kind":"Name","value":"modelId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"content"},"value":{"kind":"Variable","name":{"kind":"Name","value":"content"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CreateEntrySuccess"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<CreateEntryMutation, CreateEntryMutationVariables>;
export const UpdateEntryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateEntry"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"modelId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"content"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EntryContent"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateEntry"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"model"},"value":{"kind":"Variable","name":{"kind":"Name","value":"modelId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"content"},"value":{"kind":"Variable","name":{"kind":"Name","value":"content"}}}]}}]}]}}]} as unknown as DocumentNode<UpdateEntryMutation, UpdateEntryMutationVariables>;