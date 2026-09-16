import { Page } from "./symbol.ts";
import { route, Router, type Routes } from "@miyauci/url-router";

export const routes = {
  [Page.EntryList]: route("/entries"),
  [Page.Home]: route("/"),
  [Page.EntryCreation]: route("/entries/new"),
  [Page.Entry]: route("/entries/:id"),
} satisfies Routes;

export const router = new Router(routes);

export function resolveEntryListByModel(modelId: string): string {
  return router.resolve(Page.EntryList, {}) + "?" + `model=${modelId}`;
}

export function resolveEntryCreation(modelId: string): string {
  return router.resolve(Page.EntryCreation, {}) + "?" + `model=${modelId}`;
}
