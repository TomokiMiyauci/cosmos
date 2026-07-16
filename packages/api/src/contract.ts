import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

const SummaryDto = z.object({
  id: z.string(),
  model: z.string(),
  name: z.string(),
});
const EntryDto = z.object({
  id: z.string(),
  model: z.string(),
  name: z.string(),
});
const StringNodeJson = z.object({
  type: z.literal("string"),
  value: z.string(),
});
const NumberNodeJson = z.object({
  type: z.literal("number"),
  value: z.number(),
});
const BooleanNodeJson = z.object({
  type: z.literal("boolean"),
  value: z.boolean(),
});
const DatetimeNodeJson = z.object({
  type: z.literal("datetime"),
  value: z.string(),
});
const ListNodeJson = z.object({
  type: z.literal("list"),
  value: z.array(z.any()),
});
const MapNodeJson = z.object({
  type: z.literal("map"),
  value: z.object({}).passthrough(),
});
const ReferenceNodeJson = z.object({
  type: z.literal("reference"),
  value: z.string(),
});
const AssetNodeJson = z.object({ type: z.literal("asset"), value: z.string() });
const NodeJson = z.union([
  StringNodeJson,
  NumberNodeJson,
  BooleanNodeJson,
  DatetimeNodeJson,
  ListNodeJson,
  MapNodeJson,
  ReferenceNodeJson,
  AssetNodeJson,
]);
const EntryInputDto = z.object({ name: z.string(), node: NodeJson });
const NewEntryInputDto = z
  .object({ name: z.string().optional(), model: z.string(), node: NodeJson })
  .passthrough();
const Identitiy = z.object({ id: z.string() });
const Resource = z.object({ id: z.string(), model: z.string() }).passthrough();
const Model = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    schema: z.object({}).passthrough(),
  })
  .passthrough();

export const schemas = {
  SummaryDto,
  EntryDto,
  StringNodeJson,
  NumberNodeJson,
  BooleanNodeJson,
  DatetimeNodeJson,
  ListNodeJson,
  MapNodeJson,
  ReferenceNodeJson,
  AssetNodeJson,
  NodeJson,
  EntryInputDto,
  NewEntryInputDto,
  Identitiy,
  Resource,
  Model,
};

export const contract = c.router({
  getSummaries: {
    method: "GET",
    path: "/entries",
    summary: "Get entry summaries",
    query: z.object({ model: z.string().optional() }),
    responses: { 200: z.array(SummaryDto) },
  },
  postEntry: {
    method: "POST",
    path: "/entries",
    body: NewEntryInputDto,
    contentType: "application/json",
    responses: { 201: Identitiy, 400: c.noBody() },
  },
  getEntry: {
    method: "GET",
    path: "/entries/:id",
    summary: "Returns single entry",
    responses: { 200: EntryDto, 404: c.noBody() },
  },
  putEntry: {
    method: "PUT",
    path: "/entries/:id",
    summary: "Replace entry",
    body: EntryInputDto,
    contentType: "application/json",
    responses: { 204: c.noBody() },
  },
  deleteEntry: {
    method: "DELETE",
    path: "/entries/:id",
    summary: "Delete entry",
    body: c.noBody(),
    responses: { 204: c.noBody() },
  },
  getResources: {
    method: "GET",
    path: "/resources",
    summary: "Retruns resources",
    responses: { 200: z.array(Resource) },
  },
  getResource: {
    method: "GET",
    path: "/resources/:id",
    summary: "Return resource",
    responses: { 200: Resource, 404: c.noBody() },
  },
  getModels: {
    method: "GET",
    path: "/models",
    summary: "Return models",
    responses: { 200: z.array(Model) },
  },
  getModel: {
    method: "GET",
    path: "/models/:id",
    summary: "Return model",
    responses: { 200: Model, 404: c.noBody() },
  },
});
