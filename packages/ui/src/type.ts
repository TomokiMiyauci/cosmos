export interface CmsService {
  findSummaries(option?: ContentsOption): Promise<Summary[]>;
  findResource(id: string): Promise<Resource | null>;
  findResources(): Promise<Identity[]>;
}

export interface Resource {
  id: string;
}

export interface ContentsOption {
  resource: string;
}

export interface Identity {
  id: string;
}

export interface Summary extends SummaryInput {
  id: string;
  model: string;
}

export interface SummaryInput {
  name: string;
}

export interface Router {
  redirect(to: string): void;
}
