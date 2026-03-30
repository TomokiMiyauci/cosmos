import type { AssetMapping, Fetcher, Storage } from "@cosmos/core";

export interface Middleware {
  (request: Request, ctx: MiddlewareContext): Promise<Response> | Response;
}

export interface MiddlewareObject {
  handle(
    request: Request,
    ctx: MiddlewareContext,
  ): Promise<Response> | Response;
}

export type MiddlewareVariant = Middleware | MiddlewareObject;

export interface Middleware {
  (request: Request, ctx: MiddlewareContext): Promise<Response> | Response;
}
export interface MiddlewareContext {
  next: Handler;
  fetcher: Fetcher;
  storage: Storage;
  asset: AssetMapping;
}

export interface Handler {
  (request: Request): Promise<Response> | Response;
}
