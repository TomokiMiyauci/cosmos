import ResourcePage, { type EntriesPageProps } from "./resource.tsx";
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
import type { Router } from "../type.ts";
import type { Queries } from "../application/query.ts";
import type { EntryService, Services } from "../application/service.ts";
import { Result } from "@miyauci/util";
import type { Messenger } from "../messenger.ts";

export const views = {
  [Page.NotFound]: {
    component: NotFoundPage,
  },
  [Page.Home]: {
    component: HomePage,
  },
  [Page.EntryList]: {
    component: ResourcePage,
    async getStaticProps(
      { queries, url }: Params,
    ): Promise<EntriesPageProps | null> {
      const modelId = url.searchParams.get("model");

      if (!modelId) return null;

      const summaries = await queries.entrySummary.listByModel(modelId);

      return { modelId, summaries };
    },
  },
  [Page.Entry]: {
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
  [Page.EntryCreation]: {
    async getStaticProps(
      params: Params,
    ): Promise<ContentCreatePageProps | null> {
      const { url } = params;

      const modelId = url.searchParams.get("model");

      if (!modelId) return null;

      const definition = await params.queries.definition.findFor(modelId);

      if (!definition) return null;

      const service = new EntryContentService(modelId, params.services.entry);

      return { definition, service, messenger: params.messenger };
    },
    component: ContentCreationPage,
  },
};

interface Params {
  params: Record<string, string>;
  router: Router;
  queries: Queries;
  services: Services;
  url: URL;
  messenger: Messenger;
}

class EntryContentService implements ContentService {
  constructor(private modelId: string, private service: EntryService) {}
  async create(content: Content): Promise<Result<string, ValidationError[]>> {
    const entry = { modelId: this.modelId, content };
    const [id, failure] = await this.service.save(entry);

    if (failure) {
      const errors = failure.errors.map((error) => ({
        path: error.path,
        message: error.message,
      }));

      return Result.error(errors);
    }

    return Result.ok(id);
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
