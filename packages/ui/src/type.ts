export interface CmsService {
  findResource(id: string): Promise<Resource | null>;
  findResources(): Promise<Identity[]>;
}

export interface Resource {
  id: string;
}

export interface Identity {
  id: string;
}

export interface Router {
  redirect(to: string): void;
}
