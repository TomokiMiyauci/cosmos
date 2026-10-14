import { filterKeys } from "@std/collections/filter-keys";
import { compilePathname, MatchPattern } from "@b9g/match-pattern";

export type RelativeUrlString = string;

export interface Route<T> {
  resolve(param: T): RelativeUrlString;
  match(url: RelativeUrlString): T | null;
}

export function route<
  const T extends string,
>(
  pathname: T,
): Route<Params<T>> {
  const compiled = compilePathname(pathname);
  const paramNames = compiled.paramNames;
  const urlPattern = new MatchPattern({ pathname });

  return {
    resolve(params): string {
      let p: string = pathname;

      for (const name of paramNames) {
        // deno-lint-ignore no-explicit-any
        const value = (params as any)[name] ?? "";
        const placeholder = `:${name}`;

        p = p.replace(placeholder, value);
      }

      return p;
    },
    match(url): Params<T> | null {
      const result = urlPattern.exec(url);

      if (!result) return null;

      const set = new Set(paramNames);

      const params = filterKeys(result.params, (key) => set.has(key));

      return params as Params<T>;
    },
  };
}

type Delimiter = "/";

type TakeName<S extends string, Acc extends string = ""> = S extends
  `${infer Char}${infer Rest}`
  ? Char extends Delimiter ? [Acc, `${Char}${Rest}`]
  : TakeName<Rest, `${Acc}${Char}`>
  : [Acc, ""];

type ParseParams<S extends string> = S extends `${infer Before}:${infer After}`
  ? TakeName<After> extends [
    infer Name extends string,
    infer Rest extends string,
  ] ? Name | ParseParams<Rest>
  : never
  : never;

type Params<S extends string> = {
  [K in ParseParams<S>]: string;
};
