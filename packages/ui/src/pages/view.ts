import ResourcePage, { type ResourcePageProps } from "./resource.tsx";
import HomePage from "./home.tsx";
import NotFoundPage from "./not_found.tsx";
import ContentPage, { type EntryPageProps } from "./content.tsx";
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
    async getStaticProps(params: Params): Promise<EntryPageProps | null> {
      const id = params.params.id;

      if (!id) return null;

      const entry = await params.queries.entry.findById(id);

      if (!entry) return null;

      const modelId = entry.modelId;

      const definition = await params.queries.definition.findFor(modelId);

      if (!definition) return null;

      const service = new EntryContentUpdateService(
        params.services.entry,
        id,
        modelId,
      );

      return {
        definition,
        formData: entry.content,
        service,
      };
    },
    component: ContentPage,
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
    const [_, failure] = await this.service.save(entry);

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

class EntryContentUpdateService {
  constructor(
    private service: EntryService,
    private id: string,
    private modelId: string,
  ) {}
  async save(content: Content): Promise<Result<void, ValidationError[]>> {
    const [_, failure] = await this.service.save({
      id: this.id,
      modelId: this.modelId,
      content,
    });

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
