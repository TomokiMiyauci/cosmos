import type { AssetMapping, Datalayer } from "@cosmos/core";

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
  datalayer: Datalayer;
  asset: AssetMapping;
}

export interface Handler {
  (request: Request): Promise<Response> | Response;
}
