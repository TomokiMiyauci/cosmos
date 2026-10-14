import type { RelativeUrlString, Route } from "./route.ts";

export type Routes = Record<string, Route<unknown>>;

export class Router<T extends Routes> {
  constructor(private routes: T) {}

  match(url: RelativeUrlString): MatchedResult<T> | null {
    for (const [key, route] of Object.entries(this.routes)) {
      const result = route.match(url);

      if (result) {
        return { key, params: result } as MatchedResult<T>;
      }
    }

    return null;
  }

  resolve<K extends keyof T>(
    key: K,
    params: RouteParams<T[K]>,
  ): RelativeUrlString {
    const route = this.routes[key];

    if (!route) throw new Error("unreachable");

    return route.resolve(params);
  }
}

export type RouteParams<T> = T extends Route<infer U> ? U : never;

export type MatchedResult<R> = {
  [K in keyof R]: RouteMatch<K, RouteParams<R[K]>>;
}[keyof R];

export interface RouteMatch<T, U> {
  key: T;
  params: U;
}
