export type Result<T, E> = Result.Ok<T> | Result.Error<E>;

// deno-lint-ignore no-namespace
export namespace Result {
  export type Ok<T> = [data: T, error: void];

  export type Error<T> = [data: void, error: T];

  export function ok<T>(of: T): Ok<T> {
    return [of, void 0];
  }
  export function error<T>(of: T): Error<T> {
    return [void 0, of];
  }
}
