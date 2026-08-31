import ResourcePage, { type ResourcePageProps } from "./resource.tsx";
import HomePage from "./home.tsx";
import NotFoundPage from "./not_found.tsx";
import ContentPage, { type ContentPageProps } from "./content.tsx";
import ContentsPage, { type ContentsPageProps } from "./contents.tsx";
import ContentCreationPage, {
  type Content,
  type ContentCreatePageProps,
  type ContentService,
  type ValidationError,
} from "./content_creation.tsx";
import { Page } from "./symbol.ts";
import type { CmsService, Router } from "../type.ts";
import AssetsPage, { type AssetsPageProps } from "./assets.tsx";
import type { Queries } from "../application/query.ts";
import type { EntryService, Services } from "../application/service.ts";
import { Result } from "@miyauci/util";

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
      const modelId = params.params.id;

      if (!modelId) return null;

      const definition = await params.queries.definition.findFor(modelId);

      if (!definition) return null;

      const service = new EntryContentService(modelId, params.services.entry);

      return { definition, service };
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
  queries: Queries;
  services: Services;
}

class EntryContentService implements ContentService {
  constructor(private modelId: string, private service: EntryService) {}
  async create(content: Content): Promise<Result<void, ValidationError[]>> {
    const entry = { modelId: this.modelId, content };
    const [_, failure] = await this.service.create(entry);

    if (failure) {
      const errors = failure.errors.map((error) => ({
        path: error.path,
        message: error.message,
      }));

      return Result.error(errors);
    }

    return Result.ok(undefined);
  }
}
