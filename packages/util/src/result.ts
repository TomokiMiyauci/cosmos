export type Result<T, E> = Result.Ok<T> | Result.Error<E>;

// deno-lint-ignore no-namespace
export namespace Result {
  export type Ok<T> = [data: T, error: null];

  export type Error<T> = [data: null, error: T];

  export function ok<T>(of: T): Ok<T> {
    return [of, null];
  }
  export function error<T>(of: T): Error<T> {
    return [null, of];
  }
}
