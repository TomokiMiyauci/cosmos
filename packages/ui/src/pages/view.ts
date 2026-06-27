import ResourcePage, { type ResourcePageProps } from "./resource.tsx";
import HomePage from "./home.tsx";
import NotFoundPage from "./not_found.tsx";
import ContentPage, { type ContentPageProps } from "./content.tsx";
import ContentsPage, { type ContentsPageProps } from "./contents.tsx";
import ContentCreationPage, {
  type ContentCreatePageProps,
} from "./content_creation.tsx";
import { Page } from "./symbol.ts";
import type { CmsService } from "../type.ts";
import AssetsPage, { type AssetsPageProps } from "./assets.tsx";

export const views = {
  [Page.NotFound]: {
    component: NotFoundPage,
  },
  [Page.Home]: {
    component: HomePage,
  },
  [Page.Resource]: {
    component: ResourcePage,
    getStaticProps({ params, service }: Params): ResourcePageProps | null {
      const id = params.id;

      if (!id) return null;

      return {
        resourceId: id,
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

      return {
        service,
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

      return {
        resourceId,
        template,
        service: params.service,
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
}
