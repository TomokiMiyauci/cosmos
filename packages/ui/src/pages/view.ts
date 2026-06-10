import ResourcesPage from "./resources.tsx";
import HomePage from "./home.tsx";
import NotFoundPage from "./not_found.tsx";
import ResourcePage from "./resource.tsx";
import ContentsPage from "./contents.tsx";
import { Page } from "./symbol.ts";

export const views = {
  [Page.NotFound]: NotFoundPage,
  [Page.Home]: HomePage,
  [Page.Resources]: ResourcesPage,
  [Page.Resource]: ResourcePage,
  [Page.Contents]: ContentsPage,
};
