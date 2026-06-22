import ResourcesPage from "./resources.tsx";
import HomePage from "./home.tsx";
import NotFoundPage from "./not_found.tsx";
import ContentPage from "./resource.tsx";
import ContentsPage from "./contents.tsx";
import ContentCreationPage from "./content_creation.tsx";
import { Page } from "./symbol.ts";

export const views = {
  [Page.NotFound]: NotFoundPage,
  [Page.Home]: HomePage,
  [Page.Resources]: ResourcesPage,
  [Page.Content]: ContentPage,
  [Page.Contents]: ContentsPage,
  [Page.ContentCreation]: ContentCreationPage,
};
