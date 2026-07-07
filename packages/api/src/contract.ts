import { initContract } from "@ts-rest/core";
import type {
  EntryDto,
  EntryInputDto,
  NewEntryInputDto,
  SummaryDTO,
} from "./dto.ts";

const c = initContract();

export const contract = c.router({
  getEntry: {
    method: "GET",
    path: "/entries/:id",
    responses: {
      200: c.type<EntryDto>(),
      400: c.type(),
      404: c.type(),
    },
  },
  putEntry: {
    method: "PUT",
    path: "/entries/:id",
    responses: {
      200: c.type<EntryDto>(),
      404: c.type(),
      400: c.type(),
    },
    body: c.type<EntryInputDto>(),
  },
  deleteEntry: {
    method: "DELETE",
    path: "/entries/:id",
    responses: {
      204: c.type(),
      400: c.type(),
    },
  },
  postEntry: {
    method: "POST",
    path: "/entries",
    responses: {
      201: c.type<EntryDto>(),
      400: c.type(),
    },
    body: c.type<NewEntryInputDto>(),
  },
  getSummaries: {
    method: "GET",
    path: "/entries",
    responses: {
      200: c.type<SummaryDTO[]>(),
    },
    query: c.type<{ model?: string }>(),
  },
  getResources: {
    method: "GET",
    path: "/resources",
    responses: {
      200: c.type(),
    },
  },
  getResource: {
    method: "GET",
    path: "/resources/:id",
    responses: {
      200: c.type(),
      404: c.type(),
    },
  },
  getModel: {
    method: "GET",
    path: "/models/:id",
    responses: {
      200: c.type(),
      404: c.type(),
    },
  },
  getModels: {
    method: "GET",
    path: "/models",
    responses: {
      200: c.type(),
    },
  },
});
