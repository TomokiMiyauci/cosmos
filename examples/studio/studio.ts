import type { Queries, Services } from "@cosmos/studio";
import { MapControl, TextControl } from "@cosmos/studio/control";
import { API_ENDPOINT } from "./constant.ts";
import {
  GraphqlDefinitionQuery,
  GraphqlEntryService,
  GraphqlEntrySummaryQuery,
  GraphqlModelQuery,
} from "@cosmos/studio-graphql";
import { Router } from "@cosmos/studio";

const url = new URL(API_ENDPOINT);

const queries = {
  definition: new GraphqlDefinitionQuery(url, {
    "post": { title: "Post", control: MapControl },
    "post.age": { title: "Age", control: TextControl },
  }),
  entrySummary: new GraphqlEntrySummaryQuery(url),
  model: new GraphqlModelQuery(url),
} satisfies Queries;

const services = {
  entry: new GraphqlEntryService(url),
} satisfies Services;

export const router = new Router(queries, services);
