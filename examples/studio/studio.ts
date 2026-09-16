import { Queries, Services } from "@cosmos/studio";
import { MapControl, TextControl } from "@cosmos/studio/control";
import { API_ENDPOINT } from "./constant.ts";
import {
  OpenapiDefinitionQuery,
  OpenapiEntryService,
  OpenapiEntrySummaryQuery,
  OpenapiModelQuery,
} from "@cosmos/studio-openapi";
import { Router } from "@cosmos/studio";

const url = new URL(API_ENDPOINT);

const queries = {
  definition: new OpenapiDefinitionQuery(url, {
    "post": { title: "Post", control: MapControl },
    "title.age": { title: "Title", control: TextControl },
  }),
  entrySummary: new OpenapiEntrySummaryQuery(url),
  model: new OpenapiModelQuery(url),
} satisfies Queries;

const services = {
  entry: new OpenapiEntryService(url),
} satisfies Services;

export const router = new Router(queries, services);
