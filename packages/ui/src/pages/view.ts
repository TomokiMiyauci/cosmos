import ResourcePage, { type ResourcePageProps } from "./resource.tsx";
import HomePage from "./home.tsx";
import NotFoundPage from "./not_found.tsx";
import ContentPage, { type ContentPageProps } from "./content.tsx";
import ContentsPage, { type ContentsPageProps } from "./contents.tsx";
import ContentCreationPage, {
  type ContentCreatePageProps,
} from "./content_creation.tsx";
import { Page } from "./symbol.ts";
import type { CmsService, Router } from "../type.ts";
import AssetsPage, { type AssetsPageProps } from "./assets.tsx";
import { NodeCreateUseCase } from "~usecase/node";

export const views = {
  [Page.NotFound]: {
    component: NotFoundPage,
  },
  [Page.Home]: {
    component: HomePage,
  },
  [Page.Resource]: {
    component: ResourcePage,
    async getStaticProps(
      { params, service }: Params,
    ): Promise<ResourcePageProps | null> {
      const id = params.id;

      if (!id) return null;

      const resource = await service.findResource(id);

      if (!resource) return null;

      return {
        resource,
        service,
      };
    },
  },
  [Page.Content]: {
    async getStaticProps(params: Params): Promise<ContentPageProps | null> {
      const { service } = params;

      const id = params.params.id;

      if (!id) return null;

      const contentId = id;

      const data = await service.findContent(contentId);

      if (!data) return null;

      return {
        onAction: (entry) => service.saveEntry(entry),
        onRemove: (id) => service.eraseNodeById(id),
        contentId,
        data,
      };
    },
    component: ContentPage,
  },
  [Page.Contents]: {
    component: ContentsPage,
    getStaticProps(params: Params): ContentsPageProps {
      return {
        service: params.service,
      };
    },
  },
  [Page.ContentCreation]: {
    async getStaticProps(
      params: Params,
    ): Promise<ContentCreatePageProps | null> {
      const resourceId = params.params.id;

      if (!resourceId) return null;

      const template = await params.service.findTemplate(resourceId);

      if (!template) return null;

      const model = template.meta.model;

      const usecase = new NodeCreateUseCase(
        params.service,
        model,
        (...args) => params.router.redirect(...args),
      );

      return {
        template,
        usecase,
      };
    },
    component: ContentCreationPage,
  },
  [Page.Assets]: {
    getStaticProps(parapms: Params): AssetsPageProps {
      return {
        service: parapms.service,
      };
    },
    component: AssetsPage,
  },
};

interface Params {
  params: Record<string, string>;
  service: CmsService;
  router: Router;
}
